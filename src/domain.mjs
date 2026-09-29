export const TAX_RATE = 0.08875;
export const money = (cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export const subtotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export function totals(rounds, tipPercent = 0) {
  const sub = rounds.reduce((s, r) => s + subtotal(r.items), 0);
  const tax = Math.round(sub * TAX_RATE);
  const tip = Math.round((sub * tipPercent) / 100);
  return { subtotal: sub, tax, tip, total: sub + tax + tip };
}
export function splitCents(amount, count) {
  if (!Number.isInteger(count) || count < 1)
    throw new Error("Choose at least one person");
  return Array.from(
    { length: count },
    (_, i) => Math.floor(amount / count) + (i < amount % count ? 1 : 0),
  );
}
export function canClose(tab) {
  return (
    !!tab &&
    tab.rounds.length > 0 &&
    tab.rounds.every((r) => r.status === "Delivered")
  );
}
export function makeRound(items, id) {
  if (!items.length) throw new Error("Add a drink first");
  return {
    id,
    createdAt: Date.now(),
    status: "Received",
    items: items.map((i) => ({ ...i })),
  };
}
