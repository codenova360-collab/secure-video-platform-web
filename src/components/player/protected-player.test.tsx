import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import type { PlaybackResponse } from "@/lib/api/types";
import { ProtectedPlayer } from "./protected-player";

const api = vi.hoisted(() => vi.fn());
/** Props of each Mux Player the component renders. */
const players = vi.hoisted(() => [] as Record<string, unknown>[]);
vi.mock("@/lib/api/client", () => ({ api }));
vi.mock("next/dynamic", () => ({
  default: () =>
    function FakeMuxPlayer(props: Record<string, unknown>) {
      players.push(props);
      return (
        <div
          data-testid="mux-player"
          onClick={() =>
            (props.onError as (event: unknown) => void)({
              detail: { muxCode: 2403210, fatal: true },
              currentTarget: null,
            })
          }
        />
      );
    },
}));

const source = (playback: string) => ({
  type: "mux" as const,
  playbackId: "play_1",
  tokens: { playback, thumbnail: "t", storyboard: "s" },
  url: null,
  expiresAt: "2026-11-01T12:00:00.000Z",
});

const started: PlaybackResponse = {
  session: { id: "ps_1", heartbeatSeconds: 30 },
  source: source("token-1"),
  watermark: "k•••@example.com · #A7F2C9",
  video: { title: "Perfect Jollof", durationSeconds: 120 },
};

const fetchSpy = vi.fn(() => Promise.resolve(new Response(null)));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  api.mockReset();
  players.length = 0;
  fetchSpy.mockClear();
  vi.stubGlobal("fetch", fetchSpy);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const renderPlayer = () =>
  render(
    <ProtectedPlayer
      slug="perfect-jollof"
      title="Perfect Jollof"
      renewHref="/watch/perfect-jollof"
    />,
  );

async function play() {
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Play Perfect Jollof" }),
    );
  });
}

describe("ProtectedPlayer", () => {
  it("starts a session on Play and streams with the signed tokens and a watermark", async () => {
    api.mockResolvedValue(started);
    renderPlayer();
    expect(api).not.toHaveBeenCalled();
    await play();
    expect(api).toHaveBeenCalledWith("/videos/perfect-jollof/playback", {
      body: { endOthers: false },
    });
    expect(players.at(-1)).toMatchObject({
      playbackId: "play_1",
      tokens: { playback: "token-1", thumbnail: "t", storyboard: "s" },
      startTime: 0,
    });
    expect(screen.getByTestId("watermark").textContent).toBe(
      "k•••@example.com · #A7F2C9",
    );
  });

  it("at the stream limit, explains and can stop the other devices", async () => {
    api.mockRejectedValueOnce(
      new ApiError(
        409,
        "STREAM_LIMIT",
        "You’re watching on 2 other devices. Stop playback there, or watch here instead.",
      ),
    );
    renderPlayer();
    await play();
    expect(screen.getByText(/watching on 2 other devices/)).toBeDefined();
    api.mockResolvedValueOnce(started);
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Watch here instead" }),
      );
    });
    expect(api).toHaveBeenLastCalledWith("/videos/perfect-jollof/playback", {
      body: { endOthers: true },
    });
    expect(screen.getByTestId("mux-player")).toBeDefined();
  });

  it("heartbeats, and stops with the API’s reason when another device takes over", async () => {
    api.mockResolvedValueOnce(started);
    renderPlayer();
    await play();
    api.mockResolvedValueOnce({ session: started.session, source: null });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(api).toHaveBeenLastCalledWith("/playback/ps_1/heartbeat", {
      method: "POST",
    });
    expect(screen.getByTestId("mux-player")).toBeDefined();

    api.mockRejectedValueOnce(
      new ApiError(
        409,
        "PLAYBACK_ENDED",
        "Playback was started on another device.",
      ),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(screen.queryByTestId("mux-player")).toBeNull();
    expect(
      screen.getByText("Playback was started on another device."),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Watch here" })).toBeDefined();
    // The closed session is ended at the API.
    expect(fetchSpy).toHaveBeenCalledWith("/api/playback/ps_1/end", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
    });
  });

  it("keeps playing through a dropped heartbeat", async () => {
    api.mockResolvedValueOnce(started);
    renderPlayer();
    await play();
    api.mockRejectedValueOnce(ApiError.network());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(screen.getByTestId("mux-player")).toBeDefined();
  });

  it("shows Renew when access expires mid-watch", async () => {
    api.mockResolvedValueOnce(started);
    renderPlayer();
    await play();
    api.mockRejectedValueOnce(
      new ApiError(
        403,
        "EXPIRED",
        "Your access ended on 12 September 2026. Renew to keep watching.",
      ),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(screen.getByText(/access ended on 12 September 2026/)).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Renew" }).getAttribute("href"),
    ).toBe("/watch/perfect-jollof");
  });

  it("reloads with the newest tokens when the player reports an expired token", async () => {
    api.mockResolvedValueOnce(started);
    renderPlayer();
    await play();
    api.mockResolvedValueOnce({
      session: started.session,
      source: source("token-2"),
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("mux-player")); // fake token error
    });
    expect(players.at(-1)).toMatchObject({
      tokens: { playback: "token-2" },
    });
  });

  it("ends the session when the player goes away", async () => {
    api.mockResolvedValueOnce(started);
    const { unmount } = renderPlayer();
    await play();
    unmount();
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/playback/ps_1/end",
      expect.objectContaining({ keepalive: true }),
    );
  });
});
