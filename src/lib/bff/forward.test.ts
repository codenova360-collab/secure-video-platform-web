import { describe, expect, it, vi } from "vitest";
import { clientIpOf, forwardToApi, MAX_BODY_BYTES } from "./forward";

const SECRET = "s".repeat(40);

function setup(response: Response = new Response(null, { status: 204 })) {
  const fetchImpl = vi.fn().mockResolvedValue(response);
  const config = {
    apiUrl: "http://api.internal:4000",
    proxySecret: SECRET,
    blockedPrefixes: ["admin"],
    trustForwardedFor: false,
    fetchImpl: fetchImpl as unknown as typeof fetch,
  };
  const call = () => fetchImpl.mock.calls[0] as [URL, RequestInit];
  return { fetchImpl, config, call };
}

describe("forwardToApi (BFF proxy)", () => {
  it("forwards to /v1 with the proxy secret and allowlisted headers only", async () => {
    const { config, call } = setup();
    const request = new Request("https://example.com/api/auth/login?x=1", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "svp_session=abc",
        origin: "https://example.com",
        authorization: "Bearer stolen",
        "x-proxy-secret": "client-supplied",
        "x-client-ip": "6.6.6.6",
        "x-forwarded-for": "6.6.6.6",
      },
      body: JSON.stringify({ email: "a@example.com" }),
    });

    await forwardToApi(request, ["auth", "login"], config);
    const [url, init] = call();
    const headers = init.headers as Headers;

    expect(url.toString()).toBe("http://api.internal:4000/v1/auth/login?x=1");
    expect(headers.get("x-proxy-secret")).toBe(SECRET);
    expect(headers.get("cookie")).toBe("svp_session=abc");
    expect(headers.get("origin")).toBe("https://example.com");
    expect(headers.get("authorization")).toBeNull();
    // Client-supplied IP headers are never trusted in production mode.
    expect(headers.get("x-client-ip")).toBeNull();
    expect(headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(init.redirect).toBe("manual");
  });

  it("uses Netlify's client IP header, and X-Forwarded-For only when allowed", () => {
    const netlify = new Headers({
      "x-nf-client-connection-ip": "203.0.113.5",
      "x-forwarded-for": "6.6.6.6",
    });
    expect(clientIpOf(netlify, false)).toBe("203.0.113.5");
    const forwarded = new Headers({
      "x-forwarded-for": "198.51.100.7, 10.0.0.1",
    });
    expect(clientIpOf(forwarded, false)).toBeNull();
    expect(clientIpOf(forwarded, true)).toBe("198.51.100.7");
  });

  it("relays every Set-Cookie and only allowlisted response headers", async () => {
    const upstream = new Response('{"ok":true}', {
      status: 200,
      headers: [
        ["content-type", "application/json"],
        ["set-cookie", "svp_session=new; HttpOnly; Path=/"],
        ["set-cookie", "other=1; Path=/"],
        ["x-request-id", "req-123"],
        ["server", "secret-internal-server"],
      ],
    });
    const { config } = setup(upstream);
    const response = await forwardToApi(
      new Request("https://example.com/api/me"),
      ["me"],
      config,
    );

    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie()).toEqual([
      "svp_session=new; HttpOnly; Path=/",
      "other=1; Path=/",
    ]);
    expect(response.headers.get("x-request-id")).toBe("req-123");
    expect(response.headers.get("server")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ ok: true });
  });

  it.each([
    [["admin", "staff"]],
    [[".."]],
    [["me", "..", "admin"]],
    [["a%2Fb"]],
    [[]],
  ])(
    "refuses blocked or unsafe paths %j without calling the API",
    async (segments) => {
      const { config, fetchImpl } = setup();
      const response = await forwardToApi(
        new Request("https://example.com/api/x"),
        segments,
        config,
      );
      expect(response.status).toBe(404);
      expect(fetchImpl).not.toHaveBeenCalled();
    },
  );

  it("refuses oversized bodies", async () => {
    const { config, fetchImpl } = setup();
    const response = await forwardToApi(
      new Request("https://example.com/api/me", {
        method: "PATCH",
        body: "x".repeat(MAX_BODY_BYTES + 1),
      }),
      ["me"],
      config,
    );
    expect(response.status).toBe(413);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns a safe 502 when the API is unreachable", async () => {
    const { config, fetchImpl } = setup();
    fetchImpl.mockRejectedValueOnce(
      new Error("connect ECONNREFUSED 10.0.0.5:4000"),
    );
    const response = await forwardToApi(
      new Request("https://example.com/api/me"),
      ["me"],
      config,
    );
    expect(response.status).toBe(502);
    const text = await response.text();
    expect(text).toContain("BAD_GATEWAY");
    expect(text).not.toContain("10.0.0.5");
  });

  it("with an allowlist, reaches only those prefixes (admin proxy)", async () => {
    const { config, fetchImpl } = setup();
    const adminConfig = {
      ...config,
      blockedPrefixes: undefined,
      allowedPrefixes: ["admin"],
    };
    const refused = await forwardToApi(
      new Request("https://admin.example.com/api/me"),
      ["me"],
      adminConfig,
    );
    expect(refused.status).toBe(404);
    expect(fetchImpl).not.toHaveBeenCalled();
    await forwardToApi(
      new Request("https://admin.example.com/api/admin/me"),
      ["admin", "me"],
      adminConfig,
    );
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
