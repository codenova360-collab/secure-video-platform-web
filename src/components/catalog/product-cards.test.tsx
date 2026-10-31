import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CatalogBundle, CatalogPlan } from "@/lib/api/types";
import { bundleSavings, planPrice, planTerm } from "@/lib/format";
import { BundleCard } from "./bundle-cards";
import { SnackbarProvider } from "../ui/snackbar";
import { PlanCard, planScope } from "./plan-cards";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/plans",
}));

afterEach(cleanup);

const bundle: CatalogBundle = {
  slug: "entrepreneur-starter-pack",
  title: "Entrepreneur Starter Pack",
  summary: "Your first year in business.",
  price: { amountMinor: "8500", currency: "GHS" },
  value: { amountMinor: "11000", currency: "GHS" },
  accessDurationDays: null,
  cover: null,
  previewThumbnails: [],
  videoCount: 3,
  publishedAt: "2026-10-20T00:00:00.000Z",
};

const monthly: CatalogPlan = {
  slug: "vaultline-monthly",
  name: "Vaultline Monthly",
  description: "Every paid video, renewed monthly.",
  billingType: "RECURRING",
  price: { amountMinor: "5900", currency: "GHS" },
  durationDays: null,
  billingInterval: "MONTHLY",
  scope: "ALL_PAID_VIDEOS",
  categories: [],
  cover: null,
  videoCount: 11,
  publishedAt: "2026-10-20T00:00:00.000Z",
};

describe("BundleCard", () => {
  it("shows price, savings, video count, and links to the bundle", () => {
    render(<BundleCard bundle={bundle} />);
    expect(screen.getByText("GH₵ 85")).toBeDefined();
    expect(screen.getByText(/Save GH₵ 25/)).toBeDefined();
    expect(screen.getByText("3 videos")).toBeDefined();
    // Thumbnail and title both link to the bundle (like video cards).
    const links = screen.getAllByRole("link", {
      name: "Entrepreneur Starter Pack",
    });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/bundles/entrepreneur-starter-pack",
      "/bundles/entrepreneur-starter-pack",
    ]);
  });
});

describe("PlanCard", () => {
  it("describes price, billing, and scope, and offers to subscribe", () => {
    render(
      <SnackbarProvider>
        <PlanCard plan={monthly} />
      </SnackbarProvider>,
    );
    expect(screen.getByText("GH₵ 59 / month")).toBeDefined();
    expect(screen.getByText("Billed monthly · cancel anytime")).toBeDefined();
    expect(screen.getByText(/All paid videos · 11 videos/)).toBeDefined();
    expect(
      (screen.getByRole("button", { name: /Subscribe/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
    expect(
      screen.getByText("Paid by card, renews automatically"),
    ).toBeDefined();
  });

  it("lists categories for category plans", () => {
    const plan: CatalogPlan = {
      ...monthly,
      scope: "CATEGORIES",
      videoCount: 1,
      categories: [
        { name: "Business & Money", slug: "business-and-money" },
        { name: "Tech Skills", slug: "tech-skills" },
      ],
    };
    expect(planScope(plan)).toBe("Business & Money, Tech Skills · 1 video");
  });
});

describe("plan and bundle formatting", () => {
  it("formats plan prices and terms", () => {
    const pass = {
      ...monthly,
      billingType: "ONE_TIME" as const,
      billingInterval: null,
      durationDays: 30,
    };
    expect(planPrice(pass)).toBe("GH₵ 59");
    expect(planTerm(pass)).toBe("30 days of access · pay once");
    expect(planTerm({ ...pass, durationDays: null })).toBe(
      "Lifetime access · pay once",
    );
    expect(planPrice({ ...monthly, billingInterval: "ANNUALLY" })).toBe(
      "GH₵ 59 / year",
    );
  });

  it("only reports real savings", () => {
    expect(bundleSavings(bundle)).toBe("GH₵ 25");
    expect(bundleSavings({ ...bundle, value: bundle.price })).toBeNull();
  });
});
