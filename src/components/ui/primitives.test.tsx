import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { initialsOf } from "./avatar";
import { Button, IconButton } from "./button";
import { Chip } from "./chip";
import { Dialog } from "./dialog";
import { Menu, MenuItem } from "./menu";
import { SnackbarProvider, useSnackbar } from "./snackbar";
import { TextField } from "./text-field";

afterEach(cleanup);

describe("Button", () => {
  it("renders a pill button that can be disabled or loading", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveProperty("type", "button");
    expect(button.className).toContain("rounded-full");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();

    rerender(
      <Button onClick={onClick} loading>
        Save
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(
      screen.getByRole("button", { name: "Save" }).getAttribute("aria-busy"),
    ).toBe("true");
  });

  it("uses the accent token for the primary variant", () => {
    render(<Button variant="primary">Go</Button>);
    expect(screen.getByRole("button").className).toContain("bg-accent");
  });

  it("gives icon-only buttons an accessible name", () => {
    render(<IconButton icon="menu" label="Guide" />);
    expect(screen.getByRole("button", { name: "Guide" })).toBeDefined();
  });
});

describe("Chip", () => {
  it("exposes the selected state", () => {
    render(
      <>
        <Chip selected>All</Chip>
        <Chip>Free</Chip>
      </>,
    );
    expect(
      screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "Free" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });
});

describe("TextField", () => {
  it("labels the input and links error messages", () => {
    render(
      <TextField label="Email" errors={["Enter a valid email address."]} />,
    );
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const errorId = input.getAttribute("aria-describedby");
    expect(document.getElementById(errorId!)?.textContent).toContain(
      "Enter a valid email address.",
    );
  });

  it("toggles password visibility", async () => {
    render(<TextField label="Password" type="password" />);
    const input = screen.getByLabelText("Password");
    expect(input.getAttribute("type")).toBe("password");
    await userEvent.click(
      screen.getByRole("button", { name: "Show password" }),
    );
    expect(input.getAttribute("type")).toBe("text");
  });
});

describe("Dialog", () => {
  it("opens, shows its title and actions, and closes", async () => {
    // jsdom lacks showModal/close; stub them like a browser would behave.
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };

    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            title="Delete?"
            actions={<Button onClick={() => setOpen(false)}>Cancel</Button>}
          >
            Body text
          </Dialog>
        </>
      );
    }
    render(<Harness />);
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("heading", { name: "Delete?" })).toBeDefined();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Delete?" })).toBeNull(),
    );
  });
});

describe("Menu", () => {
  it("opens from its trigger, runs an item, and closes on Escape", async () => {
    const onSelect = vi.fn();
    render(
      <Menu trigger={(props) => <button {...props}>Account</button>}>
        <MenuItem onSelect={onSelect}>Sign out</MenuItem>
      </Menu>,
    );
    const trigger = screen.getByRole("button", { name: "Account" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();

    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("Snackbar", () => {
  it("announces a message", async () => {
    function Trigger() {
      const show = useSnackbar();
      return <button onClick={() => show("Profile saved")}>Save</button>;
    }
    render(
      <SnackbarProvider>
        <Trigger />
      </SnackbarProvider>,
    );
    await userEvent.click(screen.getByText("Save"));
    expect(screen.getByRole("status").textContent).toContain("Profile saved");
  });
});

describe("initialsOf", () => {
  it("builds initials", () => {
    expect(initialsOf("Kwame Mensah")).toBe("KM");
    expect(initialsOf("ama")).toBe("A");
    expect(initialsOf("  ")).toBe("?");
  });
});
