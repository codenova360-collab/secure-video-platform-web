import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { CatalogVideo } from "@/lib/api/types";
import { SnackbarProvider } from "../ui/snackbar";
import { CompactVideoCard, VideoCard, VideoResultRow } from "./video-cards";

afterEach(cleanup);

const paid: CatalogVideo = {
  id: "1",
  slug: "perfect-jollof-three-ways",
  title: "Perfect Jollof, Three Ways",
  summary: "Smoky party jollof.",
  accessType: "PAID",
  price: { amountMinor: "1500", currency: "GHS" },
  accessDurationDays: 30,
  categories: [{ name: "Cooking", slug: "cooking" }],
  thumbnail: null,
  durationSeconds: 2110,
  publishedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
};

const free: CatalogVideo = {
  ...paid,
  id: "2",
  slug: "five-quick-weeknight-dinners",
  title: "Five Quick Weeknight Dinners",
  accessType: "FREE",
  price: null,
  accessDurationDays: null,
  durationSeconds: null,
};

const renderWithProviders = (ui: React.ReactElement) =>
  render(<SnackbarProvider>{ui}</SnackbarProvider>);

describe("VideoCard", () => {
  it("shows price, duration, category, access, and links to the watch page", () => {
    renderWithProviders(<VideoCard video={paid} />);
    expect(screen.getByText("GH₵ 15")).toBeDefined();
    expect(screen.getByText("35:10")).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Cooking" }).getAttribute("href"),
    ).toBe("/?category=cooking");
    expect(screen.getByText(/30-day access · 3 days ago/)).toBeDefined();
    for (const link of screen.getAllByRole("link", {
      name: "Perfect Jollof, Three Ways",
    })) {
      expect(link.getAttribute("href")).toBe(
        "/watch/perfect-jollof-three-ways",
      );
    }
    expect(
      screen.getByRole("button", { name: /More actions for Perfect Jollof/ }),
    ).toBeDefined();
  });

  it("marks free videos and hides an unknown duration", () => {
    renderWithProviders(<VideoCard video={free} />);
    expect(screen.getByText("FREE")).toBeDefined();
    expect(screen.queryByText(/^\d+:\d\d$/)).toBeNull();
  });
});

describe("VideoResultRow / CompactVideoCard", () => {
  it("renders the search row with a summary and the compact card", () => {
    render(
      <>
        <VideoResultRow video={paid} />
        <CompactVideoCard video={free} />
      </>,
    );
    expect(screen.getByText("Smoky party jollof.")).toBeDefined();
    expect(
      screen.getByRole("heading", { name: "Five Quick Weeknight Dinners" }),
    ).toBeDefined();
  });
});
