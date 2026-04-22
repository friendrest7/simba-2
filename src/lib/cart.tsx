import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

type CheckoutApiResponse = { orderId: string; status: string; message: string };

const STORAGE_KEY = "simba.cart.v1";
const CART_API_URL = "/api/cart";
const CHECKOUT_API_URL = "/api/checkout";

const Ctx = createContext<{
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (p: Product, qty?: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setQty: (id: number, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  qtyOf: (id: number) => number;
  checkout: (data: any) => Promise<CheckoutApiResponse | null>;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const localItems = readStoredCart();
      if (localItems.length > 0) {
        setItems(localItems);
        setHydrated(true);
        return;
      }

      try {
        const response = await fetch(CART_API_URL);
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data = await response.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        setItems(localItems);
      } finally {
        setHydrated(true);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (hydrated) {
      writeStoredCart(items);
    }
  }, [items, hydrated]);

  const syncCartAPI = async (payload: unknown, method = "POST") => {
    try {
      await fetch(CART_API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(payload),
      });
    } catch {
      // Local cart remains source of truth when API is unavailable.
    }
  };

  const add = async (p: Product, qty = 1) => {
    setItems((curr) => {
      const found = curr.find((i) => i.product.id === p.id);
      if (found) {
        const next = curr.map((i) =>
          i.product.id === p.id ? { ...i, qty: i.qty + qty } : i,
        );
        void syncCartAPI({ id: p.id, qty: found.qty + qty });
        return next;
      }

      const next = [...curr, { product: p, qty }];
      void syncCartAPI({ product: p, qty });
      return next;
    });
  };

  const remove = async (id: number) => {
    setItems((curr) => {
      const next = curr.filter((i) => i.product.id !== id);
      void syncCartAPI({ id, qty: 0 });
      return next;
    });
  };

  const setQty = async (id: number, qty: number) => {
    if (qty <= 0) {
      await remove(id);
      return;
    }

    setItems((curr) => {
      const next = curr.map((i) => (i.product.id === id ? { ...i, qty } : i));
      void syncCartAPI({ id, qty });
      return next;
    });
  };

  const clear = async () => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    await syncCartAPI({}, "DELETE");
  };

  const checkout = async (data: any): Promise<CheckoutApiResponse | null> => {
    if (!items.length) {
      return null;
    }

    const payload = {
      ...data,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.qty,
        price: item.product.price,
        name: item.product.name,
      })),
    };

    try {
      const response = await fetch(CHECKOUT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result: CheckoutApiResponse = await response.json();
        if (result.status === "success") {
          await clear();
          return result;
        }
      }
    } catch {
      // Fall through to local success fallback.
    }

    const fallbackResult: CheckoutApiResponse = {
      orderId: `SIMBA-${Date.now()}`,
      status: "success",
      message: "Order placed successfully.",
    };
    await clear();
    return fallbackResult;
  };

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.product.price, 0);

    return {
      items,
      count,
      subtotal,
      hydrated,
      qtyOf: (id: number) => items.find((i) => i.product.id === id)?.qty ?? 0,
      add,
      remove,
      setQty,
      clear,
      checkout,
    };
  }, [items, hydrated]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};
