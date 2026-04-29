import type { ReactNode } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PackageCheck, ShoppingBag, Truck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getStoredLang, translate, useI18n } from "@/lib/i18n";
import {
  formatOrderStatus,
  formatPaymentStatus,
  getOrdersForCustomer,
  subscribeStore,
  type CustomerOrder,
} from "@/lib/order-store";
import { formatRWF } from "@/lib/products";
import cartIcon from "@/assets/cart-icon.png";

export const Route = createFileRoute("/client-dashboard")({
  component: ClientDashboardPage,
  head: () => ({ meta: [{ title: translate(getStoredLang(), "meta.clientDashboardTitle") }] }),
});

function ClientDashboardPage() {
  const { user, hydrated } = useAuth();
  const { t } = useI18n();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const activeOrders = useMemo(
    () => orders.filter((order) => !["delivered", "rejected"].includes(order.status)).length,
    [orders],
  );

  useEffect(() => {
    if (!user) return;

    const sync = () =>
      setOrders(
        getOrdersForCustomer({
          id: user.id,
          email: user.email,
          phone: user.phone,
        }),
      );

    sync();
    return subscribeStore(sync);
  }, [user]);

  if (!hydrated) return null;
  if (!user) return <Navigate to="/signin" search={{ redirect: "/client-dashboard" } as never} />;
  if (user.role === "manager" || user.role === "staff") return <Navigate to="/dashboard" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_18%,var(--card)),var(--card)_58%,color-mix(in_oklab,var(--brand-yellow)_18%,var(--card)))] p-6 shadow-sm md:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-8 hidden h-32 w-32 rounded-full bg-brand-yellow/20 blur-2xl md:block" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/40 bg-white/85 p-3 shadow-lg shadow-primary/10">
              <img src={cartIcon} alt="" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {t("client.dashboard")}
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{user.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full gradient-brand text-brand-foreground shadow-lg shadow-primary/20 hover:opacity-90"
            >
              <Link to="/products">{t("cart.continue")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/cart">{t("ui.viewCart")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat
          icon={<ShoppingBag className="h-5 w-5" />}
          label={t("client.totalOrders")}
          value={String(orders.length)}
        />
        <Stat
          icon={<PackageCheck className="h-5 w-5" />}
          label={t("client.activeOrders")}
          value={String(activeOrders)}
        />
        <Stat
          icon={<CheckCircle2 className="h-5 w-5" />}
          label={t("order.status.delivered")}
          value={String(orders.filter((order) => order.status === "delivered").length)}
        />
        <Stat
          icon={<UserRound className="h-5 w-5" />}
          label={t("client.customer")}
          value={t("auth.signInTab")}
        />
      </div>

      <section className="mt-8 rounded-[2rem] border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t("pickup.summary")}
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{t("client.recentOrders")}</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            {activeOrders} {t("client.activeOrders").toLowerCase()}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/60 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div className="text-sm text-muted-foreground">{t("client.noOrders")}</div>
            </div>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </section>
    </div>
  );
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-border bg-background/55 p-4 transition hover:border-primary/35 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="font-bold">#{order.id}</div>
          <div className="mt-1 text-sm text-muted-foreground">{order.deliveryLocation}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            {formatOrderStatus(order.status, t)}
          </span>
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {formatPaymentStatus(order.paymentStatus, t)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Info label={t("dashboard.totalColumn")} value={formatRWF(order.total)} />
        <Info
          label={t("dashboard.paymentColumn")}
          value={t(`checkout.payment.${order.paymentMethod}`)}
        />
        <Info
          label={t("order.deliveryStatusLabel")}
          value={formatOrderStatus(order.deliveryStatus, t)}
          icon={<Truck className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
            <span>
              {item.name} x{item.quantity}
            </span>
            <span className="font-semibold">{formatRWF(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 font-semibold text-foreground">{value}</div>
    </div>
  );
}
