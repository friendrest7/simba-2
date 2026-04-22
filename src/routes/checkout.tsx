import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatRWF } from "@/lib/products";
import { useEffect, useState, type ReactNode } from "react";
import { Banknote, CheckCircle2, Smartphone } from "lucide-react";

type SignInSearch = { redirect?: string };

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  validateSearch: (s: Record<string, unknown>): SignInSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Checkout - Simba Supermarket" }] }),
});

function CheckoutPage() {
  const { items, subtotal, count, checkout } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pay, setPay] = useState<"momo" | "cod">("momo");
  const delivery = subtotal === 0 || subtotal >= 30000 ? 0 : 1500;
  const total = subtotal + delivery;
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    momoNumber: "",
  });

  useEffect(() => {
    if (!user && !orderSuccess) {
      navigate({ to: "/signin", search: { redirect: "/checkout" } as never });
    } else if (count === 0 && !orderSuccess) {
      navigate({ to: "/cart" });
    }
  }, [user, count, orderSuccess, navigate]);

  if (!user || (count === 0 && !orderSuccess)) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim()) {
      setError("Please complete all required customer details.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (pay === "momo" && !formData.momoNumber.trim()) {
      setError("Please enter your Mobile Money number.");
      return;
    }

    setLoading(true);
    const result = await checkout({
      ...formData,
      paymentMethod: pay,
      phone: pay === "momo" ? formData.momoNumber : formData.phone,
      items: items.map((item) => ({ productId: item.product.id, quantity: item.qty })),
    });

    if (result) {
      setOrderId(result.orderId);
      setOrderSuccess(true);
    } else {
      setError("We could not place your order. Please try again.");
    }
    setLoading(false);
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <h1 className="text-3xl font-extrabold">{t("ui.orderPlaced")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("ui.orderPlacedHint")} {orderId ? `#${orderId}` : ""}
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full gradient-brand text-brand-foreground hover:opacity-90">
          <Link to="/">{t("ui.backHome")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight md:text-4xl">{t("checkout.title")}</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">{t("ui.contactInformation")}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{t("checkout.name")}</Label>
                <Input id="name" value={formData.name} onChange={handleInputChange} required placeholder={t("checkout.name")} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="email">{t("ui.emailAddress")}</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder={t("signin.emailPh")} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">{t("checkout.phone")}</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex h-11 items-center rounded-xl border border-border bg-secondary px-3 text-sm font-semibold">+250</span>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 9) }))} required placeholder="07XXXXXXXX" className="h-11 flex-1 rounded-xl" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">{t("ui.deliveryAddress")}</Label>
                <Input id="address" value={formData.address} onChange={handleInputChange} required placeholder={t("checkout.addressPh")} className="mt-1.5 h-11 rounded-xl" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">{t("ui.paymentMethod")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <PayOption active={pay === "momo"} onClick={() => setPay("momo")} icon={<Smartphone className="h-5 w-5" />} label={t("ui.mobileMoney")} hint={t("ui.mobileMoneyHint")} />
              <PayOption active={pay === "cod"} onClick={() => setPay("cod")} icon={<Banknote className="h-5 w-5" />} label={t("ui.cashOnDelivery")} hint={t("ui.cashOnDeliveryHint")} />
            </div>
            {pay === "momo" && (
              <div className="mt-4">
                <Label htmlFor="momoNumber">{t("ui.mobileMoneyNumber")}</Label>
                <Input id="momoNumber" type="tel" value={formData.momoNumber} onChange={handleInputChange} required placeholder="07XXXXXXXX" className="mt-1.5 h-11 rounded-xl" />
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-20">
          <h2 className="mb-4 text-xl font-extrabold">{t("ui.orderSummary")}</h2>
          <div className="space-y-2.5 text-sm">
            <Row label={t("cart.subtotal")} value={formatRWF(subtotal)} />
            <Row label={t("cart.delivery")} value={delivery === 0 ? t("cart.free") : formatRWF(delivery)} />
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4 font-bold">
            <span>{t("cart.total")}</span>
            <span className="text-2xl tabular-nums text-primary">{formatRWF(total)}</span>
          </div>
          {error && (
            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" size="lg" className="mt-6 w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90 glow-primary" disabled={loading}>
            {loading ? t("ui.processing") : t("ui.placeOrder")}
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
            <Link to="/cart">{t("ui.backToCart")}</Link>
          </Button>
        </aside>
      </form>
    </div>
  );
}

function PayOption({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${active ? "border-primary bg-primary/8 shadow-md" : "border-border bg-background hover:border-primary/40"}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
