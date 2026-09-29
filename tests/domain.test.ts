import { describe, it, expect } from "vitest";
import { totals, splitCents, canClose, makeRound } from "../src/domain.mjs";
describe("tab accounting", () => {
  it("matches the reference receipt without floating point dollar drift", () => {
    const r = { items: [{ price: 1600, quantity: 1 }], status: "Delivered" };
    expect(totals([r], 20)).toEqual({
      subtotal: 1600,
      tax: 142,
      tip: 320,
      total: 2062,
    });
  });
  it("keeps every cent when splitting and does not allow invalid splits", () => {
    expect(splitCents(2062, 3)).toEqual([688, 687, 687]);
    expect(() => splitCents(100, 0)).toThrow();
  });
  it("only closes nonempty tabs with all rounds delivered", () => {
    expect(canClose(null)).toBe(false);
    expect(canClose({ rounds: [] })).toBe(false);
    expect(canClose({ rounds: [{ status: "Received" }] })).toBe(false);
    expect(
      canClose({ rounds: [{ status: "Delivered" }, { status: "Ready" }] }),
    ).toBe(false);
    expect(canClose({ rounds: [{ status: "Delivered" }] })).toBe(true);
  });
  it("snapshots ordered items and rejects an empty round", () => {
    const items = [{ name: "Paloma", price: 1600, quantity: 1 }];
    const r = makeRound(items, 47);
    items[0].quantity = 5;
    expect(r.items[0].quantity).toBe(1);
    expect(() => makeRound([], 48)).toThrow();
  });
});
