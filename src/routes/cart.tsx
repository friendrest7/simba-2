import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatRWF } from "@/lib/products";
import { useState } from "react";
import { Lock, Minus, Package2, Plus, ShoppingBag, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Your cart - Simba Supermarket" }] }),
});

function CartPage() {
  const { items, subtotal, count, setQty, remove } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const delivery = subtotal === 0 || subtotal >= 30000 ? 0 : 1500;
  const total = subtotal + delivery;

  if (count === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold">{t("cart.empty")}</h1>
        <p className="mt-2 text-muted-foreground">{t("cart.emptyHint")}</p>
        <Button asChild size="lg" className="mt-6 rounded-full gradient-brand text-brand-foreground hover:opacity-90">
          <Link to="/products">{t("cart.continue")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">{t("cart.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {count} {count === 1 ? t("cart.item") : t("cart.items")}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map(({ product, qty }) => (
            <CartLine
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image}
              price={product.price}
              unit={product.unit}
              qty={qty}
              removeLabel={t("cart.remove")}
              decreaseLabel={t("card.decrease")}
              increaseLabel={t("card.increase")}
              onInc={() => setQty(product.id, qty + 1)}
              onDec={() => setQty(product.id, qty - 1)}
              onRemove={() => remove(product.id)}
            />
          ))}
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
          {user ? (
            <Button asChild size="lg" className="mt-6 w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90 glow-primary">
              <Link to="/checkout">{t("ui.proceedToCheckout")}</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="mt-6 w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90 gap-2">
              <Link to="/signin" search={{ redirect: "/checkout" } as never}>
                <Lock className="h-4 w-4" />
                {t("cart.signinToCheckout")}
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
            <Link to="/products">{t("ui.continueShopping")}</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

function CartLine(p: {
  id: number;
  name: string;
  image: string;
  price: number;
  unit: string;
  qty: number;
  removeLabel: string;
  decreaseLabel: string;
  increaseLabel: string;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const [err, setErr] = useState(false);
  const lineTotal = p.qty * p.price;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary/40">
        {!err ? (
          <img src={p.image} alt={p.name} onError={() => setErr(true)} className="h-full w-full object-contain p-2" />
        ) : (
          <Package2 className="h-8 w-8 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-base font-semibold leading-tight text-foreground">{p.name}</div>
        <div className="mt-1 text-xs tabular-nums text-muted-foreground">
          {formatRWF(p.price)} / {p.unit}
        </div>
        <div className="mt-1.5 text-sm font-bold tabular-nums text-primary">
          {t("card.lineTotal")}: {formatRWF(lineTotal)}
        </div>
      </div>
      <div className="flex h-10 items-center rounded-xl border border-primary/40 bg-primary/8 px-2">
        <button onClick={p.onDec} className="px-2 text-primary transition-colors enabled:hover:bg-white/15 disabled:text-muted-foreground" aria-label={p.decreaseLabel}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-2 text-sm font-bold tabular-nums text-primary">{p.qty}</span>
        <button onClick={p.onInc} className="px-2 text-primary transition-colors enabled:hover:bg-white/15" aria-label={p.increaseLabel}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button onClick={p.onRemove} className="rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive" aria-label={p.removeLabel}>
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
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
