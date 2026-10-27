import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath (open-redirect protection)", () => {
  it.each([
    ["/account", "/account"],
    ["/results?q=jollof", "/results?q=jollof"],
    ["/account/devices#top", "/account/devices#top"],
  ])("keeps same-site path %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([
    "https://evil.example",
    "//evil.example/path",
    "/\\evil.example",
    "javascript:alert(1)",
    "account",
    "",
    null,
    undefined,
  ])("rejects %j", (input) => {
    expect(safeNextPath(input)).toBe("/");
  });
});
