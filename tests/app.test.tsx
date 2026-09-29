import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { initialState } from "../src/data";
const start = () => {
  localStorage.setItem("tab-app-v1", JSON.stringify(initialState));
  return render(<App />);
};
describe("connected app journeys", () => {
  it("orders a customized drink, flips the ticket, delivers it, and saves an accurate receipt", async () => {
    const user = userEvent.setup();
    start();
    await user.click(screen.getByRole("button", { name: "Join Maya" }));
    await user.click(screen.getByRole("button", { name: /Disco Paloma.*16/ }));
    await user.click(screen.getByRole("button", { name: "Tajín" }));
    await user.type(
      screen.getByLabelText("Note for the bartender"),
      "Extra lime",
    );
    await user.click(
      screen.getByRole("button", { name: "Add to round · $16.00" }),
    );
    await user.click(screen.getByRole("button", { name: /Review your round/ }));
    await user.click(
      screen.getByRole("button", { name: "Open tab & send round" }),
    );
    await user.click(screen.getByRole("button", { name: "Open my tab" }));
    await user.click(
      screen.getByRole("button", { name: "Pay with Apple Pay" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Authorize & open tab" }),
    );
    expect(screen.getByText("Your order.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Show server" }));
    expect(document.querySelector(".show-server")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Bring back" }));
    await user.click(screen.getByRole("button", { name: "Exit" }));
    expect(
      (
        screen.getByRole("button", {
          name: "Close my tab",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await user.click(screen.getByRole("button", { name: /View order/ }));
    await user.click(screen.getByRole("button", { name: /Bartender demo/ }));
    expect(
      screen.getByText(/Tajín · Regular · Classic · Extra lime/),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Mark ready for pickup" }),
    );
    await user.click(screen.getByRole("button", { name: "Mark delivered" }));
    await user.click(screen.getByRole("button", { name: "Exit" }));
    await user.click(screen.getByRole("button", { name: "Close my tab" }));
    await user.click(screen.getByRole("button", { name: "Pay $20.62" }));
    await user.click(
      screen.getByRole("button", { name: "Confirm demo payment" }),
    );
    expect(screen.getByText("Tab closed.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Rate 5 stars" }));
    const saved = JSON.parse(localStorage.getItem("tab-app-v1")!);
    expect(saved.tab).toBeNull();
    expect(saved.receipts).toHaveLength(1);
    expect(saved.receipts[0].rating).toBe(5);
    expect(saved.receipts[0].rounds[0].items[0].rim).toBe("Tajín");
  });
  it("saves a group tab and members, and survives a reload", async () => {
    const user = userEvent.setup();
    const view = start();
    await user.click(screen.getByRole("button", { name: "Join Maya" }));
    await user.click(screen.getByRole("button", { name: /Open a tab/ }));
    await user.click(
      screen.getByRole("button", { name: /Group tab One shared/ }),
    );
    await user.click(screen.getByRole("button", { name: "Open our tab" }));
    await user.click(screen.getByRole("button", { name: "Card", exact: true }));
    await user.click(
      screen.getByRole("button", { name: "Authorize & open tab" }),
    );
    await user.click(screen.getByRole("button", { name: /Your group tab/ }));
    await user.click(screen.getByRole("button", { name: "Invite to tab" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /Alex/ }));
    await user.click(
      screen.getByRole("button", { name: "Save group · 2 people" }),
    );
    expect(screen.getByText(/2 people · you’re hosting/)).toBeTruthy();
    view.unmount();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: /Your tab at House of Yes/ }),
    );
    expect(screen.getByText("Group tab.")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("tab-app-v1")!).tab.members).toEqual(
      ["alex"],
    );
  });
  it("filters venues, saves favorites, edits profile and creates a plan", async () => {
    const user = userEvent.setup();
    start();
    await user.click(
      within(screen.getByRole("navigation")).getByRole("button", {
        name: "Explore",
        exact: true,
      }),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Search bars" }),
      "attaboy",
    );
    expect(screen.getByText("1 SPOT")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Attaboy Manhattan/ }));
    await user.click(screen.getByRole("button", { name: "Save to favorites" }));
    await user.click(
      screen.getByRole("button", { name: "Profile", exact: true }),
    );
    await user.click(screen.getByRole("button", { name: "Edit profile" }));
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Zhangir");
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    expect(screen.getByText("Zhangir")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Plans.*plans/ }));
    await user.click(screen.getByRole("button", { name: "Create a plan" }));
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2027-10-02");
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: /Alex/ }),
    );
    await user.click(screen.getByRole("button", { name: "Send invite" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const saved = JSON.parse(localStorage.getItem("tab-app-v1")!);
    expect(saved.favorites).toContain("attaboy");
    expect(saved.plans).toHaveLength(4);
  });
  it("shows the sample QR scan venue without requiring camera permissions", async () => {
    const user = userEvent.setup();
    start();
    await user.click(
      screen.getAllByRole("button", { name: "Scan a TAB code" })[0],
    );
    await user.click(
      screen.getByRole("button", { name: "Try a sample venue code" }),
    );
    expect(screen.getByRole("heading", { name: "House of Yes" })).toBeTruthy();
  });
});
