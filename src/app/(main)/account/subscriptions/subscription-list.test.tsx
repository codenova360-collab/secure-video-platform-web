import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlanCard } from "@/components/catalog/plan-cards";
import { SnackbarProvider } from "@/components/ui/snackbar";
import type { CatalogPlan, CustomerSubscription } from "@/lib/api/types";
import { SubscriptionList, subscriptionNote } from "./subscription-list";

const api = vi.hoisted(() => vi.fn());
const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/lib/api/client", () => ({ api }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/plans",
}));

const subscription = (
  changes: Partial<CustomerSubscription> = {},
): CustomerSubscription => ({
  id: "s1",
  status: "ACTIVE",
  plan: { name: "Monthly Unlimited", slug: "monthly-unlimited" },
  price: { amountMinor: "5900", currency: "GHS" },
  billingInterval: "MONTHLY",
  currentPeriodStart: "2026-10-30T10:00:00.000Z",
  currentPeriodEnd: "2026-11-30T10:00:00.000Z",
  accessUntil: "2026-12-03T10:00:00.000Z",
  nextPaymentAt: "2026-11-30T10:00:00.000Z",
  cancelledAt: null,
  canCancel: true,
  canUpdateCard: true,
  createdAt: "2026-10-30T10:00:00.000Z",
  ...changes,
});

const renderList = (subscriptions: CustomerSubscription[]) =>
  render(
    <SnackbarProvider>
      <SubscriptionList subscriptions={subscriptions} />
    </SnackbarProvider>,
  );

beforeEach(() => {
  api.mockReset();
  router.refresh.mockReset();
});
afterEach(() => {
  cleanup();
});

describe("SubscriptionList", () => {
  it("shows price, status, and the next payment", () => {
    renderList([subscription()]);
    expect(screen.getByText("Monthly Unlimited")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText(/GH₵ 59\.00 \/ month/)).toBeDefined();
    expect(screen.getByText("Renews 30 Nov 2026")).toBeDefined();
  });

  it("explains each state in one line", () => {
    expect(subscriptionNote(subscription({ status: "PAST_DUE" }))).toMatch(
      /couldn’t charge your card.*3 Dec 2026/,
    );
    expect(
      subscriptionNote(
        subscription({
          status: "NON_RENEWING",
          accessUntil: "2026-11-30T10:00:00.000Z",
        }),
      ),
    ).toBe("Won’t renew · access until 30 Nov 2026");
    expect(subscriptionNote(subscription({ status: "EXPIRED" }))).toMatch(
      /^Ended/,
    );
  });

  it("confirms before cancelling, then refreshes", async () => {
    api.mockResolvedValue({ subscription: subscription() });
    renderList([subscription()]);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.getByText(/won’t renew and your card won’t be charged again/),
    ).toBeDefined();
    expect(api).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole("button", {
        name: "Cancel subscription",
        hidden: true, // jsdom has no showModal()
      }),
    );
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith("/subscriptions/s1/cancel", {
        method: "POST",
      }),
    );
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
  });

  it("highlights a failed renewal with a card update", () => {
    renderList([subscription({ status: "PAST_DUE" })]);
    expect(screen.getByText("Payment failed")).toBeDefined();
    expect(
      (screen.getByRole("button", { name: "Update card" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("offers to subscribe again once it has ended", () => {
    renderList([
      subscription({
        status: "EXPIRED",
        canCancel: false,
        canUpdateCard: false,
      }),
    ]);
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Subscribe again" })
        .getAttribute("href"),
    ).toBe("/plans");
  });

  it("shows an empty state", () => {
    renderList([]);
    expect(screen.getByText("No subscriptions")).toBeDefined();
  });
});

describe("PlanCard", () => {
  const plan: CatalogPlan = {
    slug: "monthly-unlimited",
    name: "Monthly Unlimited",
    description: "",
    billingType: "RECURRING",
    price: { amountMinor: "5900", currency: "GHS" },
    durationDays: null,
    billingInterval: "MONTHLY",
    scope: "ALL_PAID_VIDEOS",
    categories: [],
    videoCount: 12,
    cover: null,
    publishedAt: "2026-10-01T00:00:00.000Z",
  };

  it("lets customers subscribe to recurring plans", async () => {
    api.mockResolvedValue({ order: { id: "o1" } });
    render(
      <SnackbarProvider>
        <PlanCard plan={plan} />
      </SnackbarProvider>,
    );
    expect(screen.getByText(/renews automatically/)).toBeDefined();
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith("/orders", {
        body: { productType: "PLAN", slug: "monthly-unlimited" },
      }),
    );
    expect(router.push).toHaveBeenCalledWith("/checkout/o1");
  });
});
