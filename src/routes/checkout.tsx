import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatRWF } from "@/lib/products";
import { useEffect, useState } from "react";
import { Smartphone, Banknote, CheckCircle2, Lock, ShoppingBag, Trash2, Plus, Minus, Search, MapPin, Mail, UserIcon } from "lucide-react";

type SignInSearch = { redirect?: string };

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  validateSearch: (s: Record<string, unknown>): SignInSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Checkout — Simba Supermarket" }] }),
});

function CheckoutPage() {
  const { items, subtotal, count, clear, checkout } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [pay, setPay] = useState<'momo' | 'cod'>('momo');
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const checkoutData = {
      ...formData,
      paymentMethod: pay,
      phone: pay === 'momo' ? formData.momoNumber : formData.phone,
      items: items.map(item => ({ productId: item.product.id, quantity: item.qty }))
    };

    const result = await checkout(checkoutData);

    if (result) {
      setOrderSuccess(true);
      setLoading(false);
    } else {
      // Handle error, e.g., show a toast message
      console.error("Checkout failed");
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <h1 className="text-3xl font-extrabold">Order Placed Successfully!</h1>
        <p className="mt-2 text-muted-foreground">Your order #{' '} /* TODO: Display order ID from checkout result */ 123456789 has been placed. You will receive an email confirmation shortly.</p>
        <Button asChild size="lg" className="mt-6 rounded-full gradient-brand text-brand-foreground hover:opacity-90">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex h-11 items-center rounded-xl border border-border bg-secondary px-3 text-sm font-semibold">+250</span>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                    required
                    placeholder="07XXXXXXXX"
                    className="h-11 rounded-xl flex-1"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your delivery address"
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <PayOption
                active={pay === 'momo'}
                onClick={() => setPay('momo')}
                icon={<Smartphone className="h-5 w-5" />}
                label="Mobile Money"
                hint="Pay with MTN MoMo or Airtel Money"
              />
              <PayOption
                active={pay === 'cod'}
                onClick={() => setPay('cod')}
                icon={<Banknote className="h-5 w-5" />}
                label="Cash on Delivery"
                hint="Pay with cash upon receiving your order"
              />
            </div>
            {pay === 'momo' && (
              <div className="mt-4">
                <Label htmlFor="momoNumber">Mobile Money Number</Label>
                <Input
                  id="momoNumber"
                  type="tel"
                  value={formData.momoNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="07XXXXXXXX"
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
            )}
          </section>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-6 h-fit lg:sticky lg:top-20 shadow-sm">
          <h2 className="font-extrabold text-xl mb-4">Order Summary</h2>
          <div className="space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatRWF(subtotal)} />
            <Row label="Delivery" value={delivery === 0 ? "Free" : formatRWF(delivery)} />
          </div>
          <div className="mt-4 border-t border-border pt-4 flex items-baseline justify-between font-bold">
            <span>Total</span>
            <span className="text-2xl text-primary tabular-nums">
              {formatRWF(total)}
            </span>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90 glow-primary"
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order"}
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
            <Link to="/cart">Back to Cart</Link>
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
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${active ? "border-primary bg-primary/8 shadow-md" : "border-border bg-background hover:border-primary/40"}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">
          {label}
        </div>
        <div className="text-xs text-muted-foreground">
          {hint}
        </div>
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
