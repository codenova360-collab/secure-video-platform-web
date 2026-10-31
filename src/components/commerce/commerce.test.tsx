import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentStatus } from "@/app/(main)/checkout/callback/payment-status";
import { ApiError } from "@/lib/api/errors";
import type { PaymentVerifyResponse } from "@/lib/api/types";
import { SnackbarProvider } from "../ui/snackbar";
import { BuyButton } from "./buy-button";

const api = vi.hoisted(() => vi.fn());
const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
const search = vi.hoisted(() => ({ value: "" }));
vi.mock("@/lib/api/client", () => ({ api }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/watch/perfect-jollof",
  useSearchParams: () => new URLSearchParams(search.value),
}));

const REFERENCE = "PAY-0123456789ABCDEFGHJKMNPQRS";

const verifyResponse = (
  outcome: PaymentVerifyResponse["outcome"],
): PaymentVerifyResponse => ({
  outcome,
  message:
    outcome === "PENDING"
      ? "We’re waiting for your payment to be confirmed."
      : "Done.",
  order: {
    id: "o1",
    reference: "ORD-1",
    kind: "PURCHASE",
    status: outcome === "PAID" ? "PAID" : "PENDING",
    total: { amountMinor: "1500", currency: "GHS" },
    items: [
      {
        productType: "VIDEO",
        title: "Perfect Jollof",
        unitPrice: { amountMinor: "1500", currency: "GHS" },
        accessDurationDays: 30,
        billingInterval: null,
        product: { type: "VIDEO", slug: "perfect-jollof" },
      },
    ],
    alreadyOwned: [],
    accessStartsAt: null,
    coveredByCurrentPlan: false,
    canPay: outcome !== "PAID",
    createdAt: "2026-10-30T00:00:00.000Z",
    expiresAt: "2026-10-30T00:30:00.000Z",
    paidAt: null,
  },
});

beforeEach(() => {
  api.mockReset();
  router.push.mockReset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("BuyButton", () => {
  const renderButton = () =>
    render(
      <SnackbarProvider>
        <BuyButton productType="VIDEO" slug="perfect-jollof">
          Buy GH₵ 15
        </BuyButton>
      </SnackbarProvider>,
    );

  it("creates an order by slug (no price) and opens checkout", async () => {
    api.mockResolvedValue({ order: { id: "o1" } });
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /Buy GH₵ 15/ }));
    expect(api).toHaveBeenCalledWith("/orders", {
      body: { productType: "VIDEO", slug: "perfect-jollof" },
    });
    expect(router.push).toHaveBeenCalledWith("/checkout/o1");
  });

  it("sends signed-out visitors to sign in and back", async () => {
    api.mockRejectedValue(new ApiError(401, "UNAUTHORIZED", "Sign in"));
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /Buy/ }));
    expect(router.push).toHaveBeenCalledWith(
      "/login?next=%2Fwatch%2Fperfect-jollof",
    );
  });

  it("explains when the customer already has access", async () => {
    api.mockRejectedValue(
      new ApiError(
        409,
        "ALREADY_ENTITLED",
        "You already have lifetime access to this video.",
      ),
    );
    renderButton();
    await userEvent.click(screen.getByRole("button", { name: /Buy/ }));
    expect(
      await screen.findByText(
        "You already have lifetime access to this video.",
      ),
    ).toBeDefined();
    expect(router.push).not.toHaveBeenCalled();
  });
});

describe("PaymentStatus", () => {
  it("keeps checking while pending, then shows success", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    search.value = `reference=${REFERENCE}`;
    api
      .mockResolvedValueOnce(verifyResponse("PENDING"))
      .mockResolvedValueOnce(verifyResponse("PAID"));
    render(<PaymentStatus />);
    expect(await screen.findByText("Waiting for confirmation")).toBeDefined();
    expect(screen.getByText(/approve the prompt on your phone/)).toBeDefined();
    await vi.advanceTimersByTimeAsync(3100);
    expect(await screen.findByText("Payment received")).toBeDefined();
    expect(api).toHaveBeenCalledWith(`/payments/verify/${REFERENCE}`);
    expect(
      screen.getByRole("link", { name: /Watch now/ }).getAttribute("href"),
    ).toBe("/watch/perfect-jollof");
  });

  it("offers a retry when the payment failed", async () => {
    search.value = `reference=${REFERENCE}`;
    api.mockResolvedValue(verifyResponse("FAILED"));
    render(<PaymentStatus />);
    expect(await screen.findByText("Payment not completed")).toBeDefined();
    expect(
      screen.getByRole("link", { name: /Try again/ }).getAttribute("href"),
    ).toBe("/checkout/o1");
  });

  it("rejects malformed references without calling the API", async () => {
    search.value = "reference=../../admin";
    render(<PaymentStatus />);
    expect(await screen.findByText("This link isn’t complete")).toBeDefined();
    await waitFor(() => expect(api).not.toHaveBeenCalled());
  });
});
