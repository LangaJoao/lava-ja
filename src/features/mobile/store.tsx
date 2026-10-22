import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { washes, type MobileRole, type Order, type OrderStatus } from "./data";
import { redeemPoints, submitReview, transitionOrder } from "./domain";
import {
  demoFinancialOrders,
  demoPartners,
  demoUsers,
  migrateOrder,
} from "./registry";
import {
  commissionBps,
  dayKey,
  orderAmounts,
  periodRange,
  ratingFor,
  settlementCandidates,
  type Partner,
  type RegisteredUser,
  type Settlement,
} from "./finance";
import { checkDemoOtp, issueDemoOtp, type DemoChallenge } from "./otp";

export type Vehicle = {
  id: string;
  brand: string;
  model?: string; // Legacy data; no longer collected in the garage.
  plate: string;
  color: string;
};
type Profile = {
  name: string;
  contact: string;
  photo: string;
  business: string;
  address: string;
  open: string;
  close: string;
  experience: string;
  specialties: string[];
  level: string;
  moza: boolean;
  mobile: boolean;
  businessPhotos: string[];
  servicePrices: Record<string, number>;
  enabledServices: string[];
};
type State = {
  users: RegisteredUser[];
  partners: Partner[];
  settlements: Settlement[];
  activePartnerIds: { carwash: string; provider: string };
  profile: Profile;
  vehicles: Vehicle[];
  orders: Order[];
  points: number;
  available: boolean;
  transactions: { id: string; label: string; points: number; date: string }[];
  problems: { id: string; message: string }[];
};
const initial: State = {
  users: demoUsers,
  partners: demoPartners,
  settlements: [],
  activePartnerIds: { carwash: "brilho", provider: "provider-demo" },
  profile: {
    name: "Ricardo Santos",
    contact: "+258 84 123 4567",
    photo: "",
    business: "Auto Brilho Matola",
    address: "Av. das Indústrias, Matola",
    open: "08:00",
    close: "18:00",
    experience: "5",
    specialties: ["Lavagem Móvel"],
    level: "Especialista",
    moza: true,
    mobile: false,
    businessPhotos: [],
    servicePrices: {},
    enabledServices: ["complete", "simple", "seats", "polish", "engine"],
  },
  vehicles: [
    {
      id: "vehicle-1",
      brand: "Toyota",
      plate: "AFG-201-MC",
      color: "Branco",
    },
  ],
  orders: demoFinancialOrders,
  points: 1250,
  available: true,
  transactions: [
    {
      id: "initial",
      label: "Auto Brilho Matola",
      points: 60,
      date: "Ontem, 14:20",
    },
  ],
  problems: [],
};
function useStoreValue() {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [challenge, setChallenge] = useState<DemoChallenge | null>(null);
  const lastSaved = useRef("");
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem("lava-ja-demo-v1")
      .then((raw) => {
        if (!raw || !alive) return;
        const saved = JSON.parse(raw);
        if (
          saved.version === 1 &&
          Array.isArray(saved.state?.orders) &&
          Array.isArray(saved.state?.vehicles)
        )
          setState({
            ...initial,
            ...saved.state,
            profile: { ...initial.profile, ...saved.state.profile },
            orders: saved.state.orders.map(migrateOrder),
          });
      })
      .catch(() => {
        if (alive) setStorageError(true);
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const serialized = JSON.stringify({ version: 1, state });
    if (ready && serialized !== lastSaved.current) {
      lastSaved.current = serialized;
      queue.current = queue.current
        .then(() => AsyncStorage.setItem("lava-ja-demo-v1", serialized))
        .catch(() => setStorageError(true));
    }
  }, [state, ready]);
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.addEventListener !== "function"
    )
      return;
    const sync = () => {
      AsyncStorage.getItem("lava-ja-demo-v1")
        .then((raw) => {
          if (!raw || raw === lastSaved.current) return;
          const saved = JSON.parse(raw);
          if (saved.version === 1 && Array.isArray(saved.state?.users)) {
            lastSaved.current = raw;
            setState(saved.state);
          }
        })
        .catch(() => setStorageError(true));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const requestOtp = (phone: string, role: MobileRole) => {
    const now = Date.now();
    if (
      challenge?.phone === phone &&
      challenge.role === role &&
      now < challenge.resendAt
    )
      return false;
    setChallenge(issueDemoOtp(phone, role, now));
    return true;
  };
  const verifyOtp = (code: string) => {
    if (!challenge) return "Pede primeiro um código.";
    const result = checkDemoOtp(challenge, code, Date.now());
    setChallenge(result.challenge);
    return result.error;
  };
  const completeRegistration = (role: MobileRole) => {
    if (
      !challenge?.verified ||
      challenge.role !== role ||
      challenge.phone !== state.profile.contact
    )
      return false;
    const registeredAt = new Date().toISOString();
    const id = `user-${Date.now()}`;
    setState((s) => {
      const existing = s.users.find(
        (u) => u.phone === challenge.phone && u.role === role,
      );
      if (existing)
        return {
          ...s,
          activePartnerIds:
            existing.partnerId && role !== "client"
              ? { ...s.activePartnerIds, [role]: existing.partnerId }
              : s.activePartnerIds,
        };
      const partnerId = role === "client" ? undefined : `partner-${id}`;
      return {
        ...s,
        users: [
          ...s.users,
          {
            id,
            name: s.profile.name,
            phone: challenge.phone,
            role,
            registeredAt,
            verification: "demo",
            partnerId,
          },
        ],
        partners:
          partnerId && role !== "client"
            ? [
                ...s.partners,
                {
                  id: partnerId,
                  userId: id,
                  pillar: role,
                  name:
                    role === "carwash" ? s.profile.business : s.profile.name,
                  registeredAt,
                },
              ]
            : s.partners,
        activePartnerIds: partnerId
          ? { ...s.activePartnerIds, [role]: partnerId }
          : s.activePartnerIds,
      };
    });
    setChallenge({ ...challenge, registered: true });
    return true;
  };
  const updateProfile = (patch: Partial<Profile>) =>
    setState((s) => ({
      ...s,
      profile: { ...s.profile, ...patch },
      partners:
        patch.business && (!challenge?.verified || challenge.registered)
          ? s.partners.map((p) =>
              p.id === s.activePartnerIds.carwash
                ? { ...p, name: patch.business! }
                : p,
            )
          : s.partners,
    }));
  const saveVehicle = (vehicle: Vehicle) =>
    setState((s) => ({
      ...s,
      vehicles: s.vehicles.some((v) => v.id === vehicle.id)
        ? s.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v))
        : [...s.vehicles, vehicle],
    }));
  const createBooking = (
    booking: Omit<Order, "id" | "tasks" | "stage" | "status" | "mine">,
  ) => {
    const id = `LV-${Date.now()}`;
    setState((s) => ({
      ...s,
      orders: [
        {
          ...booking,
          id,
          tasks: [false, false, false, false],
          stage: 0,
          status: "pending",
          mine: true,
          createdAt: new Date().toISOString(),
          partnerId:
            booking.partnerId ||
            (booking.channel === "provider"
              ? state.activePartnerIds.provider
              : "brilho"),
          commissionBps: commissionBps(booking.channel),
        },
        ...s.orders,
      ],
    }));
    return id;
  };
  const updateOrder = (id: string, patch: Partial<Order>) =>
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  const changeStatus = (id: string, status: OrderStatus) =>
    setState((s) => transitionOrder(s, id, status));
  const redeem = (label: string, price: number) => {
    const id = `reward-${Date.now()}`;
    setState((s) => redeemPoints(s, label, price, id));
  };
  return {
    ...state,
    ready,
    storageError,
    updateProfile,
    saveVehicle,
    createBooking,
    updateOrder,
    changeStatus,
    redeem,
    challenge,
    requestOtp,
    verifyOtp,
    completeRegistration,
    washCatalog: state.partners
      .filter((p) => p.pillar === "carwash")
      .map((p) => ({
        ...(washes.find((w) => w.id === p.id) || {
          address: state.profile.address,
          distance: 1.5,
          rating: 0,
          price: 350,
          photo: "blue" as const,
        }),
        id: p.id,
        name: p.name,
        rating: ratingFor(state.orders, p.id).average,
      })),
    confirmClientCompletion: (id: string) => {
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === id && o.mine && o.status === "completed"
            ? { ...o, clientConfirmedAt: o.clientConfirmedAt || now }
            : o,
        ),
      }));
    },
    reviewOrder: (id: string, stars: number, comment: string) => {
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === id ? submitReview(o, stars, comment, now) : o,
        ),
      }));
    },
    settlePartner: (partnerId: string, reference: string) => {
      if (!reference.trim()) return;
      const now = new Date();
      const id = `settlement-${now.getTime()}`;
      const week = periodRange("week", dayKey(now)).start;
      setState((s) => {
        const orders = settlementCandidates(
          s.orders,
          s.settlements,
          partnerId,
          week,
        );
        if (!orders.length) return s;
        const totals = orders.reduce(
          (sum, o) => {
            const a = orderAmounts(o);
            return {
              amount: sum.amount + a.netCents,
              fee: sum.fee + a.feeCents,
            };
          },
          { amount: 0, fee: 0 },
        );
        return {
          ...s,
          settlements: [
            ...s.settlements,
            {
              id,
              partnerId,
              orderIds: orders.map((o) => o.id),
              amountCents: totals.amount,
              commissionCents: totals.fee,
              reference: reference.trim(),
              createdAt: now.toISOString(),
              week,
            },
          ],
        };
      });
    },
    toggleAvailable: () => setState((s) => ({ ...s, available: !s.available })),
    report: (id: string, message: string) =>
      setState((s) => ({ ...s, problems: [...s.problems, { id, message }] })),
  };
}
const Context = createContext<ReturnType<typeof useStoreValue> | null>(null);
export function MobileProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMobile() {
  const value = useContext(Context);
  if (!value) throw new Error("MobileProvider em falta");
  return value;
}
