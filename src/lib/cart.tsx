import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "./products";
import {
  PICKUP_BRANCHES,
  type BranchName,
  type OrderRecord,
  type PaymentMethod,
  type SessionUser,
} from "@/lib/demo-store";
import { createPickupOrder, getBranchStockMap, getBranchStockMaps } from "@/lib/data";

export type CartItem = { product: Product; qty: number };

const STORAGE_KEY = "simba.cart.v2";
const BRANCH_STORAGE_KEY = "simba.branch.v1";

const Ctx = createContext<{
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  selectedBranch: BranchName;
  lastOrder: OrderRecord | null;
  add: (p: Product, qty?: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setQty: (id: number, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  qtyOf: (id: number) => number;
  stockOf: (id: number) => number;
  setSelectedBranch: (branch: BranchName) => void;
  overLimitItems: Array<{
    product: Product;
    qty: number;
    stock: number;
    suggestedBranches: Array<{ branch: BranchName; stock: number }>;
  }>;
  checkout: (data: {
    user: SessionUser;
    branch: BranchName;
    pickupDate: string;
    pickupSlot: string;
    paymentMethod: PaymentMethod;
    paymentPhone?: string;
    customerPhone: string;
    notes?: string;
  }) => Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string; productName?: string }>;
} | null>(null);

const readStoredCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeStoredCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const readStoredBranch = (): BranchName => {
  try {
    const raw = localStorage.getItem(BRANCH_STORAGE_KEY) as BranchName | null;
    return raw && PICKUP_BRANCHES.includes(raw) ? raw : "Remera";
  } catch {
    return "Remera";
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selectedBranch, setSelectedBranchState] = useState<BranchName>("Remera");
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);
  const [stockMap, setStockMap] = useState<Record<number, number>>({});
  const [branchStockMaps, setBranchStockMaps] = useState<Record<BranchName, Record<number, number>>>(
    {} as Record<BranchName, Record<number, number>>,
  );

  useEffect(() => {
    setItems(readStoredCart());
    setSelectedBranchState(readStoredBranch());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredCart(items);
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(BRANCH_STORAGE_KEY, selectedBranch);
  }, [selectedBranch, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    void (async () => {
      const nextStockMap = await getBranchStockMap(selectedBranch);
      setStockMap(nextStockMap);
    })();
  }, [selectedBranch, hydrated, lastOrder]);

  useEffect(() => {
    if (!hydrated) return;
    const hasStockConflict = items.some((item) => item.qty > (stockMap[item.product.id] ?? 0));

    if (!hasStockConflict) {
      setBranchStockMaps({} as Record<BranchName, Record<number, number>>);
      return;
    }

    void (async () => {
      setBranchStockMaps(await getBranchStockMaps(PICKUP_BRANCHES.filter((branch) => branch !== selectedBranch)));
    })();
  }, [items, stockMap, selectedBranch, hydrated, lastOrder]);

  const stockOf = (id: number) => stockMap[id] ?? 0;

  const setSelectedBranch = (branch: BranchName) => {
    setSelectedBranchState(branch);
  };

  const add = async (product: Product, qty = 1) => {
    setItems((current) => {
      const currentQty = current.find((item) => item.product.id === product.id)?.qty ?? 0;
      const available = stockOf(product.id);

      if (available <= 0) {
        toast.error(`${product.name} is unavailable at ${selectedBranch}.`);
        return current;
      }

      if (currentQty + qty > available) {
        toast.error(`Only ${available} available at ${selectedBranch}.`);
        return current;
      }

      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + qty } : item,
        );
      }

      return [...current, { product, qty }];
    });
  };

  const remove = async (id: number) => {
    setItems((current) => current.filter((item) => item.product.id !== id));
  };

  const setQty = async (id: number, qty: number) => {
    if (qty <= 0) {
      await remove(id);
      return;
    }

    const available = stockOf(id);
    if (qty > available) {
      toast.error(`Only ${available} available at ${selectedBranch}.`);
      return;
    }

    setItems((current) => current.map((item) => (item.product.id === id ? { ...item, qty } : item)));
  };

  const clear = async () => {
    setItems([]);
    setLastOrder(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const checkout = async (data: {
    user: SessionUser;
    branch: BranchName;
    pickupDate: string;
    pickupSlot: string;
    paymentMethod: PaymentMethod;
    paymentPhone?: string;
    customerPhone: string;
    notes?: string;
  }) => {
    const result = await createPickupOrder({
      ...data,
      items: items.map((item) => ({ productId: item.product.id, quantity: item.qty })),
    });

    if (!result.ok) {
      return result;
    }

    setLastOrder(result.order);
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
    setStockMap(await getBranchStockMap(data.branch));
    return result;
  };

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.product.price, 0);
    const overLimitItems = items
      .map((item) => ({
        product: item.product,
        qty: item.qty,
        stock: stockOf(item.product.id),
        suggestedBranches: PICKUP_BRANCHES.filter((branch) => branch !== selectedBranch)
          .map((branch) => ({
            branch,
            stock: branchStockMaps[branch]?.[item.product.id] ?? 0,
          }))
          .filter((candidate) => candidate.stock >= item.qty)
          .sort((a, b) => b.stock - a.stock)
          .slice(0, 3),
      }))
      .filter((item) => item.qty > item.stock);

    return {
      items,
      count,
      subtotal,
      hydrated,
      selectedBranch,
      lastOrder,
      qtyOf: (id: number) => items.find((item) => item.product.id === id)?.qty ?? 0,
      stockOf,
      setSelectedBranch,
      add,
      remove,
      setQty,
      clear,
      checkout,
      overLimitItems,
    };
  }, [items, hydrated, selectedBranch, lastOrder, branchStockMaps]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};
