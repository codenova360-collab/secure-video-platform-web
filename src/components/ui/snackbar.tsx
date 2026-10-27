"use client";

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface SnackbarMessage {
  id: number;
  text: string;
  action?: { label: string; onClick: () => void };
}

type Show = (text: string, action?: SnackbarMessage["action"]) => void;

const SnackbarContext = createContext<Show | null>(null);

const DURATION_MS = 4000;

/**
 * YouTube-style snackbar: one message at a time, bottom-left, dark (or light
 * in dark mode), optional uppercase action. Announced politely.
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<SnackbarMessage | null>(null);
  const counter = useRef(0);

  const show = useCallback<Show>((text, action) => {
    counter.current += 1;
    setMessage({ id: counter.current, text, action });
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), DURATION_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <SnackbarContext value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-6 z-[60] max-mini:right-4 max-mini:bottom-20 max-mini:left-4"
      >
        {message && (
          <div
            key={message.id}
            role="status"
            className="pointer-events-auto flex min-h-12 max-w-md items-center gap-6 rounded-lg bg-snackbar px-4 py-3 text-sm text-snackbar-text shadow-lg"
          >
            <span className="flex-1">{message.text}</span>
            {message.action && (
              <button
                type="button"
                className="font-medium text-accent uppercase"
                onClick={() => {
                  message.action?.onClick();
                  setMessage(null);
                }}
              >
                {message.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </SnackbarContext>
  );
}

export function useSnackbar(): Show {
  const show = use(SnackbarContext);
  if (!show)
    throw new Error("useSnackbar must be used inside SnackbarProvider");
  return show;
}
