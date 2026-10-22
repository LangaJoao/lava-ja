import type { Order, OrderStatus } from "./data";

export type PointEntry = {
  id: string;
  label: string;
  points: number;
  date: string;
};
export type OrderState = {
  orders: Order[];
  points: number;
  transactions: PointEntry[];
};
const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  rejected: [],
  cancelled: [],
};

/** Applies a local demo transition atomically, including exactly-once loyalty credit. */
export function transitionOrder<S extends OrderState>(
  state: S,
  id: string,
  status: OrderStatus,
): S {
  const order = state.orders.find((o) => o.id === id);
  if (!order || !transitions[order.status].includes(status)) return state;
  if (status === "completed" && !order.tasks.every(Boolean)) return state;
  const award =
    status === "completed" && order.mine && !order.awarded
      ? Math.floor(order.price / 100) * 10
      : 0;
  return {
    ...state,
    points: state.points + award,
    transactions: award
      ? [
          { id, label: order.wash, points: award, date: "Agora" },
          ...state.transactions,
        ]
      : state.transactions,
    orders: state.orders.map((o) =>
      o.id === id
        ? {
            ...o,
            status,
            ...(status === "confirmed"
              ? { confirmedAt: new Date().toISOString() }
              : {}),
            ...(status === "completed"
              ? {
                  stage: 4,
                  awarded: true,
                  completedAt: new Date().toISOString(),
                }
              : {}),
          }
        : o,
    ),
  };
}
export function submitReview(
  order: Order,
  stars: number,
  comment: string,
  now: string,
): Order {
  if (
    !order.mine ||
    order.status !== "completed" ||
    !order.clientConfirmedAt ||
    order.review ||
    !Number.isInteger(stars) ||
    stars < 1 ||
    stars > 5
  )
    return order;
  return {
    ...order,
    clientConfirmedAt: order.clientConfirmedAt || now,
    review: { stars, comment: comment.trim().slice(0, 1000), createdAt: now },
  };
}
export function redeemPoints<S extends OrderState>(
  state: S,
  label: string,
  price: number,
  id: string,
): S {
  if (!Number.isFinite(price) || price <= 0 || state.points < price)
    return state;
  return {
    ...state,
    points: state.points - price,
    transactions: [
      { id, label, points: -price, date: "Agora" },
      ...state.transactions,
    ],
  };
}
