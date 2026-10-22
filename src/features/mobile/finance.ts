import type { Order, MobileRole } from "./data";
export type RegisteredUser = {
  id: string;
  name: string;
  phone: string;
  role: MobileRole;
  registeredAt: string;
  verification: "demo";
  partnerId?: string;
};
export type Partner = {
  id: string;
  name: string;
  pillar: "carwash" | "provider";
  registeredAt: string;
  userId: string;
};
export type Settlement = {
  id: string;
  partnerId: string;
  orderIds: string[];
  amountCents: number;
  commissionCents: number;
  reference: string;
  createdAt: string;
  week: string;
};
export const commissionBps = (pillar: "carwash" | "provider") =>
  pillar === "carwash" ? 1000 : 500;
export function splitAmount(price: number, bps: number) {
  const grossCents = Math.round(price * 100);
  const feeCents = Math.round((grossCents * bps) / 10000);
  return { grossCents, feeCents, netCents: grossCents - feeCents };
}
export function orderAmounts(order: Order) {
  return splitAmount(
    order.price,
    order.commissionBps ?? commissionBps(order.channel),
  );
}
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Maputo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function shiftDay(day: string, days: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function periodRange(period: string, anchor: string) {
  if (period === "week") {
    const weekday = new Date(`${anchor}T12:00:00Z`).getUTCDay();
    const start = shiftDay(anchor, -(weekday === 0 ? 6 : weekday - 1));
    return { start, end: shiftDay(start, 6) };
  }
  if (period === "month") {
    const start = anchor.slice(0, 7) + "-01";
    const next = new Date(`${start}T12:00:00Z`);
    next.setUTCMonth(next.getUTCMonth() + 1);
    return { start, end: shiftDay(next.toISOString().slice(0, 10), -1) };
  }
  return { start: anchor, end: anchor };
}
export function inRange(iso: string | undefined, start: string, end: string) {
  if (!iso) return false;
  const day = dayKey(new Date(iso));
  return day >= start && day <= end;
}
export function earnedAt(order: Order) {
  if (["cancelled", "rejected", "pending"].includes(order.status))
    return undefined;
  return order.channel === "provider"
    ? order.confirmedAt || order.completedAt
    : order.status === "completed"
      ? order.completedAt
      : undefined;
}
export function reportFor(
  orders: Order[],
  start: string,
  end: string,
  partnerId?: string,
) {
  const selected = orders.filter(
    (o) =>
      (!partnerId || o.partnerId === partnerId) &&
      inRange(earnedAt(o), start, end),
  );
  return selected.reduce(
    (sum, order) => {
      const amounts = orderAmounts(order);
      return {
        count: sum.count + 1,
        grossCents: sum.grossCents + amounts.grossCents,
        feeCents: sum.feeCents + amounts.feeCents,
        netCents: sum.netCents + amounts.netCents,
      };
    },
    { count: 0, grossCents: 0, feeCents: 0, netCents: 0 },
  );
}
export function settlementCandidates(
  orders: Order[],
  settlements: Settlement[],
  partnerId: string,
  beforeWeek: string,
) {
  const paid = new Set(settlements.flatMap((s) => s.orderIds));
  return orders.filter(
    (o) =>
      o.channel === "carwash" &&
      o.partnerId === partnerId &&
      o.status === "completed" &&
      o.completedAt &&
      dayKey(new Date(o.completedAt)) < beforeWeek &&
      o.payment !== "Pagar no Local" &&
      !paid.has(o.id),
  );
}
export function ratingFor(orders: Order[], partnerId: string) {
  const reviews = orders
    .filter(
      (o) => o.partnerId === partnerId && o.status === "completed" && o.review,
    )
    .map((o) => o.review!);
  return {
    count: reviews.length,
    average: reviews.length
      ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
      : 0,
  };
}
