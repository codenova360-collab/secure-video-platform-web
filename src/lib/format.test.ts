import { describe, expect, it } from "vitest";
import { accessLabel, formatDuration, formatMoney, timeAgo } from "./format";

describe("formatMoney", () => {
  it("formats pesewas exactly, including large amounts", () => {
    expect(formatMoney({ amountMinor: "1500", currency: "GHS" })).toBe(
      "GH₵ 15.00",
    );
    expect(formatMoney({ amountMinor: "4599", currency: "GHS" })).toBe(
      "GH₵ 45.99",
    );
    expect(formatMoney({ amountMinor: "1000000000", currency: "GHS" })).toBe(
      "GH₵ 10,000,000.00",
    );
    expect(
      formatMoney({ amountMinor: "9007199254740993", currency: "GHS" }),
    ).toBe("GH₵ 90,071,992,547,409.93");
  });

  it("drops .00 in compact badges", () => {
    expect(
      formatMoney({ amountMinor: "4500", currency: "GHS" }, { compact: true }),
    ).toBe("GH₵ 45");
    expect(
      formatMoney({ amountMinor: "4550", currency: "GHS" }, { compact: true }),
    ).toBe("GH₵ 45.50");
  });
});

describe("accessLabel", () => {
  it("describes access", () => {
    expect(accessLabel({ accessType: "FREE", accessDurationDays: null })).toBe(
      "Free",
    );
    expect(accessLabel({ accessType: "PAID", accessDurationDays: null })).toBe(
      "Lifetime access",
    );
    expect(accessLabel({ accessType: "PAID", accessDurationDays: 30 })).toBe(
      "30-day access",
    );
  });
});

describe("formatDuration / timeAgo", () => {
  it("formats durations like YouTube", () => {
    expect(formatDuration(2110)).toBe("35:10");
    expect(formatDuration(4325)).toBe("1:12:05");
    expect(formatDuration(59)).toBe("0:59");
  });

  it("describes elapsed time", () => {
    const now = new Date("2026-10-27T12:00:00Z");
    expect(timeAgo("2026-10-27T11:59:30Z", now)).toBe("just now");
    expect(timeAgo("2026-10-24T12:00:00Z", now)).toBe("3 days ago");
    expect(timeAgo("2026-10-26T12:00:00Z", now)).toBe("1 day ago");
  });
});
