import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { getStoredLang, translate, useI18n } from "@/lib/i18n";
import { formatRWF } from "@/lib/products";
import type { PaymentMethod } from "@/lib/order-store";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: translate(getStoredLang(), "meta.checkoutTitle") }] }),
});

type FormData = {
  customerName: string;
  phoneNumber: string;
  deliveryLocation: string;
  deliveryNotes: string;
  paymentMethod: PaymentMethod;
  momoNumber: string;
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const { count, subtotal, deliveryFee, total, checkout, overLimitItems, selectedBranch } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: user?.name ?? "",
    phoneNumber: user?.phone ?? "",
    deliveryLocation: "",
    deliveryNotes: "",
    paymentMethod: "mobile-money",
    momoNumber: user?.phone ?? "",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.customerName || !formData.phoneNumber || !formData.deliveryLocation) {
      toast.error(t("checkout.error.completeDetails"));
      return;
    }

    if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      toast.error(t("checkout.error.phone"));
      return;
    }

    if (formData.paymentMethod === "mobile-money" && !formData.momoNumber.trim()) {
      toast.error(t("checkout.error.momo"));
      return;
    }

    if (overLimitItems.length > 0) {
      const names = overLimitItems.map((item) => item.product.name).join(", ");
      toast.error(`${t("checkout.error.stockUnavailable")} ${names}`);
      void navigate({ to: "/cart" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await checkout({
        customerId: user?.id,
        customerEmail: user?.email ?? undefined,
        branchName: selectedBranch,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        deliveryLocation: formData.deliveryLocation,
        deliveryNotes: formData.deliveryNotes,
        paymentMethod: formData.paymentMethod,
        momoNumber: formData.paymentMethod === "mobile-money" ? formData.momoNumber : undefined,
      });

      if (result.ok) {
        toast.success(t("ui.orderPlaced"));
        await navigate({ to: "/order-confirmation" });
        return;
      }

      const productMessage = result.productName ? ` ${result.productName}` : "";
      toast.error(`${t(result.error)}${productMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-4xl font-bold text-foreground">{t("checkout.title")}</h1>
      <p className="mb-8 text-lg text-muted-foreground">{t("checkout.subtitleShort")}</p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <aside className="rounded-lg border bg-background p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-2xl font-bold text-foreground">{t("ui.orderSummary")}</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-muted-foreground">
              <span>
                {count} {t(count === 1 ? "cart.item" : "cart.items")}
              </span>
              <span>{formatRWF(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t("cart.delivery")}</span>
              <span>{deliveryFee === 0 ? t("cart.free") : formatRWF(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-bold text-foreground">
              <span>{t("cart.total")}</span>
              <span>{formatRWF(total)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{t("checkout.orderSummaryHint")}</p>
          <div className="mt-4 rounded-xl bg-secondary p-4 text-sm">
            <div className="font-semibold text-foreground">{t("pickup.branch")}</div>
            <div className="mt-1 text-primary">{selectedBranch}</div>
          </div>
          <Button asChild variant="link" className="mt-4 px-0 text-sm text-muted-foreground hover:text-primary">
            <Link to="/cart">{t("ui.backToCart")}</Link>
          </Button>
        </aside>

        <div className="rounded-lg border bg-background p-6 shadow-sm lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <section className="mb-8">
              <h2 className="mb-4 border-b pb-2 text-2xl font-bold text-foreground">
                {t("checkout.customerDetails")}
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">{t("checkout.customerInfo")}</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder={t("signin.namePh")}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">{t("checkout.phone")}</Label>
                  <div className="relative">
                    <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder={t("signin.phonePh")}
                      required
                      className="mt-1 pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deliveryLocation">{t("checkout.deliveryLocationLabel")}</Label>
                  <Input
                    id="deliveryLocation"
                    name="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={handleInputChange}
                    placeholder={t("checkout.deliveryLocationHint")}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryNotes">{t("checkout.deliveryNotes")}</Label>
                  <Input
                    id="deliveryNotes"
                    name="deliveryNotes"
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                    placeholder={t("checkout.deliveryNotesHint")}
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 border-b pb-2 text-2xl font-bold text-foreground">
                {t("checkout.paymentMethod")}
              </h2>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value as PaymentMethod }))
                }
              >
                <div className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value="mobile-money" id="mobile-money" />
                  <Label htmlFor="mobile-money" className="flex cursor-pointer flex-col space-y-1">
                    <span className="font-semibold text-foreground">{t("checkout.mobileMoney")}</span>
                    <span className="text-xs text-muted-foreground">{t("checkout.mobileMoneyHint")}</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
                  <Label htmlFor="cash-on-delivery" className="flex cursor-pointer flex-col space-y-1">
                    <span className="font-semibold text-foreground">
                      {t("checkout.payment.cash-on-delivery")}
                    </span>
                    <span className="text-xs text-muted-foreground">{t("ui.cashOnDeliveryHint")}</span>
                  </Label>
                </div>
              </RadioGroup>
              {formData.paymentMethod === "mobile-money" ? (
                <div className="mt-4">
                  <Label htmlFor="momoNumber">{t("ui.mobileMoneyNumber")}</Label>
                  <Input
                    id="momoNumber"
                    name="momoNumber"
                    value={formData.momoNumber}
                    onChange={handleInputChange}
                    placeholder={t("signin.phonePh")}
                    className="mt-1"
                  />
                </div>
              ) : null}
              <p className="mt-4 text-xs text-muted-foreground">{t("checkout.paymentHint")}</p>
            </section>

            <Button
              type="submit"
              className="h-12 w-full text-lg font-bold"
              disabled={count === 0 || overLimitItems.length > 0 || isSubmitting}
            >
              {isSubmitting ? t("ui.processing") : t("ui.placeOrder")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
