import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { getStoredLang, translate, useI18n } from "@/lib/i18n";
import { formatRWF } from "@/lib/products";
import { formatOrderStatus, formatPaymentStatus } from "@/lib/order-store";

export const Route = createFileRoute("/order-confirmation")({
  component: OrderConfirmationPage,
  head: () => ({
    meta: [{ title: translate(getStoredLang(), "meta.orderConfirmationTitle") }],
  }),
});

function OrderConfirmationPage() {
  const { lastOrder, clear } = useCart();
  const { t } = useI18n();

  if (!lastOrder) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-3xl font-bold">{t("order.confirmationMissing")}</h1>
        <p className="mb-6 text-muted-foreground">{t("order.confirmationMissingHint")}</p>
        <Button asChild variant="outline">
          <Link to="/cart">{t("ui.backToCart")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-lg border bg-background p-8 shadow-md">
        <div className="mb-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-20 w-20 text-green-500" />
          <h1 className="mb-2 text-4xl font-bold text-foreground">{t("order.confirmationTitle")}</h1>
          <p className="text-lg text-muted-foreground">{t("order.confirmationBody")}</p>
        </div>

        <div className="mt-6 rounded-lg border bg-secondary p-6">
          <h2 className="mb-4 text-2xl font-bold text-foreground">{t("ui.orderSummary")}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t("order.orderId")}</p>
              <p className="break-all font-semibold text-foreground">{lastOrder.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("order.statusLabel")}</p>
              <p className="font-semibold text-foreground">{formatOrderStatus(lastOrder.status, t)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("checkout.customerInfo")}</p>
              <p className="font-semibold text-foreground">{lastOrder.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("checkout.phone")}</p>
              <p className="font-semibold text-foreground">{lastOrder.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("checkout.deliveryLocation")}</p>
              <p className="font-semibold text-foreground">{lastOrder.deliveryLocation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("checkout.paymentMethod")}</p>
              <p className="font-semibold text-foreground">
                {formatPaymentStatus(lastOrder.paymentStatus, t)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("pickup.branch")}</p>
              <p className="font-semibold text-foreground">{lastOrder.branchName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("order.paymentStatusLabel")}</p>
              <p className="font-semibold text-foreground">
                {formatPaymentStatus(lastOrder.paymentStatus, t)}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">{t("ui.orderSummary")}</p>
              <ul className="mt-2 space-y-2">
                {lastOrder.items.map((item) => (
                  <li key={`${lastOrder.id}-${item.productId}`} className="flex justify-between text-sm font-medium">
                    <span>
                      {item.quantity} x {item.name}
                    </span>
                    <span>{formatRWF(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2 flex justify-between border-t pt-4 font-bold text-foreground">
              <span>{t("cart.total")}</span>
              <span>{formatRWF(lastOrder.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => void clear()} asChild variant="link" className="text-muted-foreground hover:text-primary">
            <Link to="/">{t("ui.backHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
