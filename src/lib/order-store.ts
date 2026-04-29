import { PRODUCTS, formatRWF, type Product } from "@/lib/products";

export type CartLineInput = {
  product: Product;
  qty: number;
};

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "out-for-delivery"
  | "delivered"
  | "rejected";

export type PaymentMethod = "mobile-money" | "cash-on-delivery";

export type PaymentStatus = "pending" | "processing" | "paid" | "cash-on-delivery" | "rejected";

export type CheckoutOrderInput = {
  customerId?: string;
  customerEmail?: string;
  customerName: string;
  phoneNumber: string;
  deliveryLocation: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  momoNumber?: string;
  paymentStatus?: PaymentStatus;
};

export type CustomerOrder = {
  id: string;
  customerId?: string;
  customerEmail?: string;
  customerName: string;
  phoneNumber: string;
  deliveryLocation: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  momoNumber?: string;
  status: OrderStatus;
  deliveryStatus: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
};

const ORDERS_KEY = "simba.orders.v3";
const LEGACY_ORDERS_KEYS = ["simba.orders.v2", "simba.orders.v1"];
const STOCK_KEY = "simba.stock.v1";
const LAST_ORDER_KEY = "simba.last-order.v1";
const STORE_EVENT = "simba:store-updated";
const DELIVERY_FEE = 1500;
const FREE_DELIVERY_THRESHOLD = 25000;

const hasWindow = () => typeof window !== "undefined";

const emitStoreUpdate = () => {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
};

const safeRead = <T>(key: string, fallback: T): T => {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (!hasWindow()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const buildInitialStockMap = () =>
  Object.fromEntries(
    PRODUCTS.map((product) => {
      const seededStock = product.inStock ? 4 + (product.id % 15) : 0;
      const stock = product.id % 19 === 0 ? 0 : seededStock;
      return [product.id, stock];
    }),
  ) as Record<number, number>;

const normalizeOrderStatus = (status: string | undefined): OrderStatus => {
  switch (status) {
    case "accepted":
    case "preparing":
    case "ready":
    case "out-for-delivery":
    case "delivered":
    case "rejected":
      return status;
    case "confirmed":
      return "accepted";
    case "cancelled":
      return "rejected";
    default:
      return "pending";
  }
};

const normalizePaymentStatus = (
  status: string | undefined,
  method: PaymentMethod,
): PaymentStatus => {
  if (
    status === "pending" ||
    status === "processing" ||
    status === "paid" ||
    status === "rejected"
  ) {
    return status;
  }

  if (status === "cash-on-delivery") {
    return "cash-on-delivery";
  }

  return method === "cash-on-delivery" ? "cash-on-delivery" : "paid";
};

const normalizeOrder = (order: Partial<CustomerOrder> & { id: string }): CustomerOrder => {
  const subtotal =
    typeof order.subtotal === "number"
      ? order.subtotal
      : (order.items ?? []).reduce(
          (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0),
          0,
        );
  const deliveryFee =
    typeof order.deliveryFee === "number" ? order.deliveryFee : getDeliveryFee(subtotal);
  const paymentMethod =
    order.paymentMethod === "cash-on-delivery" ? "cash-on-delivery" : "mobile-money";
  const status = normalizeOrderStatus(order.status);

  return {
    id: order.id,
    customerId: order.customerId,
    customerEmail: order.customerEmail,
    customerName: order.customerName ?? "",
    phoneNumber: order.phoneNumber ?? "",
    deliveryLocation: order.deliveryLocation ?? "",
    deliveryNotes: order.deliveryNotes ?? "",
    paymentMethod,
    paymentStatus: normalizePaymentStatus(order.paymentStatus, paymentMethod),
    momoNumber: order.momoNumber,
    status,
    deliveryStatus: normalizeOrderStatus(order.deliveryStatus ?? order.status),
    subtotal,
    deliveryFee,
    total: typeof order.total === "number" ? order.total : subtotal + deliveryFee,
    createdAt: order.createdAt ?? new Date().toISOString(),
    items: (order.items ?? []).map((item) => ({
      productId: Number(item.productId),
      name: item.name ?? "",
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 0),
      image: item.image ?? "",
    })),
  };
};

const readOrders = (): CustomerOrder[] => {
  const current = safeRead<Array<Partial<CustomerOrder> & { id: string }>>(ORDERS_KEY, []);
  if (current.length > 0) {
    return current.map(normalizeOrder);
  }

  for (const legacyKey of LEGACY_ORDERS_KEYS) {
    const legacy = safeRead<Array<Partial<CustomerOrder> & { id: string }>>(legacyKey, []);
    if (legacy.length > 0) {
      const migrated = legacy.map(normalizeOrder);
      safeWrite(ORDERS_KEY, migrated);
      return migrated;
    }
  }

  return [];
};

const writeOrders = (orders: CustomerOrder[]) => {
  safeWrite(ORDERS_KEY, orders);
  emitStoreUpdate();
};

const writeStockMap = (stockMap: Record<number, number>) => {
  safeWrite(STOCK_KEY, stockMap);
  emitStoreUpdate();
};

export const getDeliveryFee = (subtotal: number) =>
  subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

export const getStockMap = () => {
  const stored = safeRead<Record<number, number>>(STOCK_KEY, {});
  if (Object.keys(stored).length > 0) {
    return stored;
  }

  const initialStock = buildInitialStockMap();
  safeWrite(STOCK_KEY, initialStock);
  return initialStock;
};

export const getStockOf = (productId: number) => getStockMap()[productId] ?? 0;

export const getOrders = () => readOrders();

export const getOrderById = (orderId: string) =>
  getOrders().find((order) => order.id === orderId) ?? null;

export const getOrdersForCustomer = (customer: {
  id?: string | null;
  email?: string | null;
  phone?: string | null;
}) => {
  const normalizedEmail = customer.email?.trim().toLowerCase();
  const normalizedPhone = customer.phone?.replace(/\D/g, "");

  return getOrders().filter((order) => {
    const orderPhone = order.phoneNumber.replace(/\D/g, "");
    return (
      (customer.id && order.customerId === customer.id) ||
      (normalizedEmail && order.customerEmail?.trim().toLowerCase() === normalizedEmail) ||
      (normalizedPhone && orderPhone === normalizedPhone)
    );
  });
};

export const getLastOrder = () => {
  const orderId = safeRead<string | null>(LAST_ORDER_KEY, null);
  return orderId ? getOrderById(orderId) : null;
};

export const subscribeStore = (listener: () => void) => {
  if (!hasWindow()) {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === ORDERS_KEY ||
      LEGACY_ORDERS_KEYS.includes(event.key ?? "") ||
      event.key === STOCK_KEY ||
      event.key === LAST_ORDER_KEY
    ) {
      listener();
    }
  };
  const handleCustomEvent = () => listener();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORE_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORE_EVENT, handleCustomEvent);
  };
};

export const formatOrderStatus = (status: OrderStatus, t: (key: string) => string) =>
  t(`order.status.${status}`);

export const formatPaymentStatus = (status: PaymentStatus, t: (key: string) => string) =>
  t(`order.payment.${status}`);

export const getDeliveryStatusText = (status: OrderStatus, t: (key: string) => string) =>
  t(`order.delivery.${status}`);

export const placeOrder = (input: CheckoutOrderInput, items: CartLineInput[]) => {
  const stockMap = getStockMap();

  for (const item of items) {
    const available = stockMap[item.product.id] ?? 0;
    if (available < item.qty) {
      return {
        ok: false as const,
        error: "checkout.error.stockUnavailable",
        productName: item.product.name,
      };
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const deliveryFee = getDeliveryFee(subtotal);
  const paymentMethod = input.paymentMethod;
  const paymentStatus =
    input.paymentStatus ?? (paymentMethod === "cash-on-delivery" ? "cash-on-delivery" : "paid");

  const order: CustomerOrder = {
    id: `SIM-${Date.now().toString(36).toUpperCase()}`,
    customerId: input.customerId?.trim() || undefined,
    customerEmail: input.customerEmail?.trim().toLowerCase() || undefined,
    customerName: input.customerName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    deliveryLocation: input.deliveryLocation.trim(),
    deliveryNotes: input.deliveryNotes?.trim() || "",
    paymentMethod,
    paymentStatus,
    momoNumber: input.momoNumber?.trim() || undefined,
    status: "pending",
    deliveryStatus: "pending",
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    createdAt: new Date().toISOString(),
    items: items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.qty,
      image: item.product.image,
    })),
  };

  const nextStockMap = { ...stockMap };
  for (const item of items) {
    nextStockMap[item.product.id] = Math.max(0, (nextStockMap[item.product.id] ?? 0) - item.qty);
  }

  writeStockMap(nextStockMap);
  writeOrders([order, ...getOrders()]);
  safeWrite(LAST_ORDER_KEY, order.id);
  emitStoreUpdate();

  return { ok: true as const, order };
};

export const updateOrderStatus = (orderId: string, status: OrderStatus) => {
  const updatedOrders = getOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
          deliveryStatus: status,
          paymentStatus: status === "rejected" ? "rejected" : order.paymentStatus,
        }
      : order,
  );
  writeOrders(updatedOrders);
  return updatedOrders.find((order) => order.id === orderId) ?? null;
};

export const updateOrderPaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
  const updatedOrders = getOrders().map((order) =>
    order.id === orderId
      ? {
          ...order,
          paymentStatus,
        }
      : order,
  );
  writeOrders(updatedOrders);
  return updatedOrders.find((order) => order.id === orderId) ?? null;
};

export const getRevenue = (orders: CustomerOrder[]) =>
  orders
    .filter((order) => order.status !== "rejected")
    .reduce((sum, order) => sum + order.total, 0);

export const getOrderSummaryLines = (order: CustomerOrder) => [
  { label: "cart.subtotal", value: formatRWF(order.subtotal) },
  {
    label: "cart.delivery",
    value: order.deliveryFee === 0 ? "cart.free" : formatRWF(order.deliveryFee),
  },
  { label: "cart.total", value: formatRWF(order.total) },
];
