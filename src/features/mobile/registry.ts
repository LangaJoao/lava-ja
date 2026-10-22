import { initialOrders, type Order } from "./data";
import {
  commissionBps,
  dayKey,
  shiftDay,
  type Partner,
  type RegisteredUser,
} from "./finance";
const today = dayKey();
const ago = (days: number) => `${shiftDay(today, -days)}T10:00:00+02:00`;
export const demoUsers: RegisteredUser[] = [
  {
    id: "client-demo",
    name: "Ricardo Santos",
    phone: "+258841234567",
    role: "client",
    registeredAt: ago(20),
    verification: "demo",
  },
  {
    id: "client-2",
    name: "Anabela Sitoe",
    phone: "+258851234560",
    role: "client",
    registeredAt: ago(10),
    verification: "demo",
  },
  {
    id: "owner-brilho",
    name: "Auto Brilho Matola",
    phone: "+258861234561",
    role: "carwash",
    registeredAt: ago(60),
    verification: "demo",
    partnerId: "brilho",
  },
  {
    id: "owner-liberdade",
    name: "Auto-Spa Liberdade",
    phone: "+258871234562",
    role: "carwash",
    registeredAt: ago(50),
    verification: "demo",
    partnerId: "liberdade",
  },
  {
    id: "owner-uem",
    name: "Lavagem Rápida UEM",
    phone: "+258841234563",
    role: "carwash",
    registeredAt: ago(40),
    verification: "demo",
    partnerId: "uem",
  },
  {
    id: "provider-demo",
    name: "Arnaldo Mondlane",
    phone: "+258851234564",
    role: "provider",
    registeredAt: ago(15),
    verification: "demo",
    partnerId: "provider-demo",
  },
];
export const demoPartners: Partner[] = demoUsers
  .filter((u) => u.role !== "client")
  .map((u) => ({
    id: u.partnerId!,
    name: u.name,
    pillar: u.role as "carwash" | "provider",
    registeredAt: u.registeredAt,
    userId: u.id,
  }));
export function migrateOrder(order: Order): Order {
  const date = order.date === "Ontem" ? ago(1) : ago(0);
  return {
    ...order,
    partnerId:
      order.partnerId ||
      (order.channel === "provider" ? "provider-demo" : "brilho"),
    createdAt: order.createdAt || date,
    completedAt:
      order.completedAt || (order.status === "completed" ? date : undefined),
    confirmedAt:
      order.confirmedAt ||
      (["confirmed", "active", "completed"].includes(order.status)
        ? date
        : undefined),
    commissionBps: order.commissionBps ?? commissionBps(order.channel),
  };
}
export const demoFinancialOrders: Order[] = [
  ...initialOrders.map(migrateOrder),
  ...[2, 4, 8, 12, 20, 35].flatMap((days, index) =>
    ["brilho", "liberdade", "uem"].map((partnerId, i): Order => ({
      id: `history-${days}-${i}`,
      client: "Cliente de demonstração",
      car: "Toyota · AAA-000-MC",
      serviceId: "complete",
      price: 600 + index * 100,
      time: "10:00",
      date: shiftDay(today, -days),
      status: "completed",
      channel: "carwash",
      wash: demoPartners.find((p) => p.id === partnerId)!.name,
      partnerId,
      tasks: [true, true, true, true],
      stage: 4,
      createdAt: ago(days),
      confirmedAt: ago(days),
      completedAt: ago(days),
      commissionBps: 1000,
      payment: "Moza Banco (Conta Móvel)",
    })),
  ),
];
