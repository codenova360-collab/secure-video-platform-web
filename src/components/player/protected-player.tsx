"use client";

import type MuxPlayerElement from "@mux/mux-player";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type {
  PlaybackHeartbeat,
  PlaybackResponse,
  PlaybackSource,
} from "@/lib/api/types";
import { Icon } from "../icons/icon";
import { Button, ButtonLink } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Watermark } from "./watermark";

// Mux Player is a browser-only custom element: load it on the client only.
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <Spinner className="m-auto text-white" />,
});

/** Mux error codes that fresh tokens fix (expired, missing). */
const TOKEN_ERRORS = new Set([2403210, 2403201]);
const MAX_RECOVERIES = 3;

type View =
  | { state: "idle" }
  | { state: "starting" }
  | {
      state: "playing";
      playback: PlaybackResponse;
      source: PlaybackSource;
      startTime: number;
      /** Bumped to remount the player with fresh credentials. */
      attempt: number;
    }
  | { state: "limit"; message: string }
  | {
      state: "stopped";
      message: string;
      /** Offer to start again here (e.g. after another device took over). */
      canResume: boolean;
      renew: boolean;
    }
  | { state: "error"; message: string };

const PLAYBACK_ERROR =
  "Something went wrong while playing this video. Check your connection and try again.";

/** Tells the API the player closed; survives page unload. */
function endSession(sessionId: string) {
  void fetch(`/api/playback/${sessionId}/end`, {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined);
}

function viewForError(error: unknown): View {
  if (!(error instanceof ApiError) || error.status === 0 || error.status >= 500)
    return { state: "error", message: PLAYBACK_ERROR };
  if (error.code === "STREAM_LIMIT")
    return { state: "limit", message: error.message };
  if (error.code === "PLAYBACK_ENDED")
    return {
      state: "stopped",
      message: error.message,
      canResume: true,
      renew: false,
    };
  if (error.status === 401)
    return {
      state: "stopped",
      message: "You’ve been signed out. Sign in again to keep watching.",
      canResume: false,
      renew: false,
    };
  return {
    state: "stopped",
    message: error.message,
    canResume: false,
    renew: error.code === "EXPIRED",
  };
}

/**
 * The watch page's player (docs/ARCHITECTURE.md §9.5). Starts a playback
 * session on Play, streams with the API's short-lived signed credentials,
 * heartbeats to keep them fresh, and shows the API's reason whenever it
 * stops (stream limit, ended elsewhere, access over). A moving watermark
 * with the viewer's masked email sits over the video.
 */
export function ProtectedPlayer({
  slug,
  title,
  renewHref,
}: {
  slug: string;
  title: string;
  /** Where "Renew" goes when access has expired. */
  renewHref: string;
}) {
  const [view, setView] = useState<View>({ state: "idle" });
  const playerRef = useRef<MuxPlayerElement | HTMLVideoElement | null>(null);
  /** Newest credentials from heartbeats, used when the player needs to reload. */
  const latestSourceRef = useRef<PlaybackSource | null>(null);
  const recoveriesRef = useRef(0);

  const sessionId = view.state === "playing" ? view.playback.session.id : null;
  const heartbeatSeconds =
    view.state === "playing" ? view.playback.session.heartbeatSeconds : 0;

  const start = useCallback(
    async (endOthers = false) => {
      setView({ state: "starting" });
      try {
        const playback = await api<PlaybackResponse>(
          `/videos/${slug}/playback`,
          { body: { endOthers } },
        );
        latestSourceRef.current = playback.source;
        recoveriesRef.current = 0;
        setView({
          state: "playing",
          playback,
          source: playback.source,
          startTime: 0,
          attempt: 0,
        });
      } catch (error) {
        setView(viewForError(error));
      }
    },
    [slug],
  );

  // Heartbeats while the session is open; closing the player ends it.
  useEffect(() => {
    if (!sessionId) return;
    const timer = setInterval(() => {
      api<PlaybackHeartbeat>(`/playback/${sessionId}/heartbeat`, {
        method: "POST",
      })
        .then((beat) => {
          if (beat.source) latestSourceRef.current = beat.source;
        })
        .catch((error: unknown) => {
          const next = viewForError(error);
          // A dropped connection or a server hiccup: keep playing, try again next time.
          if (next.state === "error") return;
          setView(next);
        });
    }, heartbeatSeconds * 1000);
    const onPageHide = () => endSession(sessionId);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", onPageHide);
      endSession(sessionId);
    };
  }, [sessionId, heartbeatSeconds]);

  /** Playback errors: reload with the newest credentials, a few times. */
  const onPlayerError = (event: Event | React.SyntheticEvent) => {
    if (view.state !== "playing") return;
    const element = playerRef.current;
    // Mux Player reports a MediaError (with `muxCode`, `fatal`) on the event
    // or the element; a plain <video> has a MediaError on the element.
    const error = ((event as { detail?: unknown }).detail ??
      (event.currentTarget as { error?: unknown } | null)?.error ??
      null) as { muxCode?: number; fatal?: boolean } | null;
    const tokenProblem =
      error?.muxCode !== undefined && TOKEN_ERRORS.has(error.muxCode);
    if (error && error.fatal === false && !tokenProblem) return;
    if (recoveriesRef.current >= MAX_RECOVERIES) {
      setView({ state: "error", message: PLAYBACK_ERROR });
      return;
    }
    recoveriesRef.current += 1;
    setView({
      ...view,
      source: latestSourceRef.current ?? view.source,
      startTime: element?.currentTime ?? 0,
      attempt: view.attempt + 1,
    });
  };

  if (view.state === "playing") {
    const { source, playback } = view;
    const containerId = `player-${playback.session.id}`;
    return (
      <div
        id={containerId}
        className="absolute inset-0 flex bg-black"
        onContextMenu={(event) => event.preventDefault()}
      >
        {source.type === "mux" && source.playbackId && source.tokens ? (
          <MuxPlayer
            key={view.attempt}
            ref={(element) => {
              playerRef.current = element;
            }}
            playbackId={source.playbackId}
            tokens={source.tokens}
            title={title}
            metadata={{ video_id: slug, video_title: title }}
            streamType="on-demand"
            startTime={view.startTime}
            autoPlay
            accentColor="#2dd4bf"
            primaryColor="#ffffff"
            fullscreenElement={containerId}
            onError={onPlayerError}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <video
            key={view.attempt}
            ref={(element) => {
              playerRef.current = element;
              if (element && view.startTime > 0)
                element.currentTime = view.startTime;
            }}
            src={source.url ?? undefined}
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
            onError={onPlayerError}
            className="size-full"
          />
        )}
        <Watermark text={playback.watermark} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 px-6 text-center text-white">
      {view.state === "idle" || view.state === "starting" ? (
        <button
          type="button"
          onClick={() => void start()}
          disabled={view.state === "starting"}
          aria-label={`Play ${title}`}
          className="flex size-20 items-center justify-center rounded-full bg-black/70 transition hover:scale-105 hover:bg-accent focus-visible:outline-2 focus-visible:outline-white disabled:opacity-70"
        >
          {view.state === "starting" ? (
            <Spinner className="text-white" />
          ) : (
            <Icon name="play_arrow" size={48} filled />
          )}
        </button>
      ) : view.state === "limit" ? (
        <>
          <Icon name="devices" size={40} />
          <p className="max-w-md text-lg font-medium">{view.message}</p>
          <Button variant="primary" onClick={() => void start(true)}>
            Watch here instead
          </Button>
          <p className="max-w-md text-xs text-white/70">
            This stops playback on your other devices.
          </p>
        </>
      ) : view.state === "stopped" ? (
        <>
          <Icon name={view.canResume ? "devices" : "lock"} size={40} />
          <p className="max-w-md text-lg font-medium">{view.message}</p>
          {view.canResume && (
            <Button variant="primary" onClick={() => void start()}>
              Watch here
            </Button>
          )}
          {view.renew && (
            <ButtonLink href={renewHref} variant="primary">
              Renew
            </ButtonLink>
          )}
        </>
      ) : (
        <>
          <Icon name="error" size={40} />
          <p className="max-w-md text-base font-medium">{view.message}</p>
          <Button variant="primary" icon="refresh" onClick={() => void start()}>
            Try again
          </Button>
        </>
      )}
    </div>
  );
}
