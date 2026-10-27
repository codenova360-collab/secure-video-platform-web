import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Home from "./page";

afterEach(cleanup);

test("renders the placeholder home page", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Secure Video Platform" }),
  ).toBeDefined();
});
