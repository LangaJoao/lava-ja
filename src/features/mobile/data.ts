export type MobileRole = "client" | "carwash" | "provider";
export const roleNames: Record<MobileRole, string> = {
  client: "Cliente",
  carwash: "Car Wash",
  provider: "Prestador de Serviços",
};
export const homeFor = (role: string | null) =>
  role === "admin" ? "/admin" : `/mobile/${role || "client"}`;
export const money = (value: number) => `${value.toLocaleString("pt-PT")} MT`;
export const services = [
  {
    id: "complete",
    name: "Lavagem Completa",
    description: "Interior, exterior e aspiração",
    price: 600,
    minutes: 45,
  },
  {
    id: "simple",
    name: "Lavagem Simples",
    description: "Exterior e vidros",
    price: 350,
    minutes: 20,
  },
  {
    id: "seats",
    name: "Limpeza de Estofos",
    description: "Limpeza profunda dos estofos",
    price: 1200,
    minutes: 90,
  },
  {
    id: "polish",
    name: "Polimento de Faróis",
    description: "Restaura o brilho dos faróis",
    price: 800,
    minutes: 60,
  },
  {
    id: "engine",
    name: "Lavagem de Motor",
    description: "Limpeza técnica profunda",
    price: 1200,
    minutes: 60,
  },
];
export const washes = [
  {
    id: "brilho",
    name: "Brilho de Matola",
    address: "Av. das Indústrias, Matola",
    distance: 1.2,
    rating: 4.8,
    price: 450,
    photo: "blue" as const,
  },
  {
    id: "liberdade",
    name: "Auto-Spa Liberdade",
    address: "Av. da Liberdade, Matola",
    distance: 2.5,
    rating: 4.9,
    price: 600,
    photo: "silver" as const,
  },
  {
    id: "uem",
    name: "Lavagem Rápida UEM",
    address: "Campus UEM, Maputo",
    distance: 3.1,
    rating: 4.5,
    price: 350,
    photo: "hand" as const,
  },
];
export function catalogFor(
  washId: string | undefined,
  config: { enabledServices: string[]; servicePrices: Record<string, number> },
) {
  return washId === "brilho"
    ? services
        .filter((service) => config.enabledServices.includes(service.id))
        .map((service) => ({
          ...service,
          price: config.servicePrices[service.id] ?? service.price,
        }))
    : services;
}
export type OrderStatus =
  "pending" | "confirmed" | "active" | "completed" | "rejected" | "cancelled";
export const statusNames: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  active: "Em serviço",
  completed: "Concluída",
  rejected: "Rejeitada",
  cancelled: "Cancelada",
};
export type Order = {
  id: string;
  client: string;
  car: string;
  serviceId: string;
  price: number;
  time: string;
  date: string;
  status: OrderStatus;
  channel: "carwash" | "provider";
  wash: string;
  mine?: boolean;
  payment?: string;
  tasks: boolean[];
  stage: number;
  awarded?: boolean;
  partnerId?: string;
  createdAt?: string;
  completedAt?: string;
  confirmedAt?: string;
  commissionBps?: number;
  clientConfirmedAt?: string;
  review?: { stars: number; comment: string; createdAt: string };
};
export const initialOrders: Order[] = [
  {
    id: "LV-1042",
    client: "Anabela Sitoe",
    car: "Toyota Corolla · AFM 129 MC",
    serviceId: "simple",
    price: 350,
    time: "10:00",
    date: "Hoje",
    status: "active",
    channel: "provider",
    wash: "Prestador independente",
    tasks: [true, true, false, false],
    stage: 2,
  },
  {
    id: "LV-1043",
    client: "Ricardo Sitoe",
    car: "Toyota Hilux · AGD-421-MP",
    serviceId: "complete",
    price: 600,
    time: "10:30",
    date: "Hoje",
    status: "pending",
    channel: "carwash",
    wash: "Auto Brilho Matola",
    tasks: [false, false, false, false],
    stage: 0,
  },
  {
    id: "LV-1044",
    client: "Elena Mucavele",
    car: "VW Golf · AAF-882-MC",
    serviceId: "simple",
    price: 350,
    time: "11:15",
    date: "Hoje",
    status: "pending",
    channel: "carwash",
    wash: "Auto Brilho Matola",
    tasks: [false, false, false, false],
    stage: 0,
  },
  {
    id: "LV-1045",
    client: "Mário Langa",
    car: "Ford Ranger · AAB-201-MP",
    serviceId: "engine",
    price: 1200,
    time: "12:00",
    date: "Hoje",
    status: "confirmed",
    channel: "carwash",
    wash: "Auto Brilho Matola",
    tasks: [false, false, false, false],
    stage: 0,
  },
  {
    id: "LV-1046",
    client: "Sara Meque",
    car: "Toyota Fortuner · AAB 001 MP",
    serviceId: "complete",
    price: 600,
    time: "14:30",
    date: "Hoje",
    status: "pending",
    channel: "provider",
    wash: "Prestador independente",
    tasks: [false, false, false, false],
    stage: 0,
  },
  {
    id: "LV-1047",
    client: "Paulo Mondlane",
    car: "VW Golf 7 · AGH 422 MC",
    serviceId: "seats",
    price: 1200,
    time: "15:30",
    date: "Hoje",
    status: "pending",
    channel: "provider",
    wash: "Prestador independente",
    tasks: [false, false, false, false],
    stage: 0,
  },
  {
    id: "LV-1041",
    client: "Ricardo Santos",
    car: "Toyota Hilux · AFG-201-MC",
    serviceId: "complete",
    price: 600,
    time: "14:20",
    date: "Ontem",
    status: "completed",
    channel: "carwash",
    wash: "Auto Brilho Matola",
    mine: true,
    tasks: [true, true, true, true],
    stage: 4,
    awarded: true,
  },
];
