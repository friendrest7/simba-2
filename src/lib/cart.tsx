import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

// Mock API response types
type CartApiResponse = { items: CartItem[]; subtotal: number };
type CheckoutApiResponse = { orderId: string; status: string; message: string };

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
  checkout: (data: any) => Promise<CheckoutApiResponse | null>; // Added checkout function
} | null>(null);

const CART_API_URL = "/api/cart";
const CHECKOUT_API_URL = "/api/checkout";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Fetch cart data from API on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(CART_API_URL);
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data: CartApiResponse = await response.json();
        setItems(data.items);
      } catch (error) {
        console.error("Error fetching cart:", error);
        // Fallback to localStorage if API fails or is not available
        try {
          const raw = localStorage.getItem("simba.cart.v1");
          if (raw) setItems(JSON.parse(raw));
        } catch {}
      } finally {
        setHydrated(true);
      }
    };
    fetchCart();
  }, []);

  // Function to update cart via API
  const updateCartAPI = async (newItem: CartItem | { id: number; qty: number }) => {
    try {
      const response = await fetch(CART_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) {
        console.error("Failed to update cart item");
        // Optionally re-sync from localStorage or a fallback
        return;
      }
      // If API returns updated cart, sync state. For now, just assume success.
      // const updatedCartData: CartApiResponse = await response.json();
      // setItems(updatedCartData.items);
    } catch (error) {
      console.error("Error updating cart item:", error);
      // Fallback to localStorage for optimistic updates if API fails
      // (This part needs careful handling for state consistency)
    }
  };

  // Add item to cart
  const add = async (p: Product, qty = 1) => {
    const newItem = { product: p, qty };
    setItems((curr) => {
      const found = curr.find((i) => i.product.id === p.id);
      if (found) {
        const updatedItems = curr.map((i) =>
          i.product.id === p.id ? { ...i, qty: i.qty + qty } : i,
        );
        updateCartAPI({ id: p.id, qty: found.qty + qty }); // API call
        return updatedItems;
      } else {
        updateCartAPI(newItem); // API call for new item
        return [...curr, newItem];
      }
    });
  };

  // Remove item from cart
  const remove = async (id: number) => {
    setItems((curr) => {
      const updatedItems = curr.filter((i) => i.product.id !== id);
      updateCartAPI({ id, qty: 0 }); // API call to remove (qty: 0)
      return updatedItems;
    });
  };

  // Set item quantity
  const setQty = async (id: number, qty: number) => {
    if (qty <= 0) {
      remove(id);
    } else {
      setItems((curr) => {
        const updatedItems = curr.map((i) =>
          i.product.id === id ? { ...i, qty } : i,
        );
        updateCartAPI({ id, qty }); // API call
        return updatedItems;
      });
    }
  };

  // Clear cart
  const clear = async () => {
    setItems([]);
    try {
      // Make a DELETE or POST request to clear the cart on the server
      // For mock, we'll assume a POST with empty payload or specific clear action
      await fetch(CART_API_URL, { method: "DELETE" }); // Assuming DELETE to clear
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Fallback: clear localStorage manually if API fails
      localStorage.removeItem("simba.cart.v1");
    }
  };

  // Checkout
  const checkout = async (data: any): Promise<CheckoutApiResponse | null> => {
    try {
      const response = await fetch(CHECKOUT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, items: items }), // Send cart items with checkout data
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Checkout failed:", errorData);
        return null; // Return null or throw error
      }
      const result: CheckoutApiResponse = await response.json();
      if (result.status === "success") {
        clear(); // Clear cart on successful checkout
      }
      return result;
    } catch (error) {
      console.error("Error during checkout process:", error);
      return null;
    }
  };

  const value = useMemo<Omit<CartCtx, "add" | "remove" | "setQty" | "clear" | "checkout"> & {
    add: (p: Product, qty?: number) => void;
    remove: (id: number) => void;
    setQty: (id: number, qty: number) => void;
    clear: () => void;
    checkout: (data: any) => Promise<CheckoutApiResponse | null>;
  }>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.product.price, 0);
    return {
      items,
      count,
      subtotal,
      hydrated,
      qtyOf: (id) => items.find((i) => i.product.id === id)?.qty ?? 0,
      add: (p, qty = 1) => add(p, qty), // Call the async add function
      remove: (id) => remove(id),     // Call the async remove function
      setQty: (id, qty) => setQty(id, qty), // Call the async setQty function
      clear: () => clear(),           // Call the async clear function
      checkout,
    };
  }, [items, hydrated]); // Add hydrated to dependency array

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};
