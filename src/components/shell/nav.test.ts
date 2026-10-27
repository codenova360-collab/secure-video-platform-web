import { describe, expect, it } from "vitest";
import { describeDevice } from "@/app/(main)/account/devices/device-list";
import { isActive } from "./nav-items";

describe("isActive", () => {
  it("matches home exactly and sections by prefix", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/results", "/")).toBe(false);
    expect(isActive("/account/devices", "/account")).toBe(true);
    expect(isActive("/accounting", "/account")).toBe(false);
    expect(isActive("/library", "/library#continue")).toBe(true);
  });
});

describe("describeDevice", () => {
  it("names common browsers and platforms", () => {
    expect(
      describeDevice(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      ),
    ).toEqual({ name: "Chrome on macOS", mobile: false });
    expect(
      describeDevice(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      ).mobile,
    ).toBe(true);
    expect(describeDevice(null)).toEqual({
      name: "Unknown device",
      mobile: false,
    });
  });
});
