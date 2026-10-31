import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TheaterToggle, WatchLayout } from "./watch-layout";

afterEach(cleanup);

describe("WatchLayout", () => {
  it("switches to theater mode without remounting the player", () => {
    const mounted = vi.fn();
    function Player() {
      useEffect(() => mounted(), []);
      return <div data-testid="player" />;
    }
    const { container } = render(
      <WatchLayout
        player={<Player />}
        details={<TheaterToggle />}
        upNext={<p>Up next</p>}
      />,
    );
    const grid = container.firstElementChild!;
    expect(grid.getAttribute("data-theater")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Theater mode" }));
    expect(grid.getAttribute("data-theater")).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Default view" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getAllByTestId("player")).toHaveLength(1);
    expect(mounted).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Default view" }));
  });
});
