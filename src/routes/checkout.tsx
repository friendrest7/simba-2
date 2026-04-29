import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type HTMLAttributes, type HTMLInputTypeAttribute } from "react";
import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPin,
  Smartphone,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { getStoredLang, translate, useI18n } from "@/lib/i18n";
import { formatRWF } from "@/lib/products";
import type { PaymentMethod, PaymentStatus } from "@/lib/order-store";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: translate(getStoredLang(), "meta.checkoutTitle") }] }),
});

type PaymentStage = "idle" | "processing" | "success" | "failure";

function CheckoutPage() {
  const { items, subtotal, deliveryFee, total, count, checkout, selectedBranch } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile-money");
  const [paymentStage, setPaymentStage] = useState<PaymentStage>("idle");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    deliveryLocation: "",
    deliveryNotes: "",
    momoNumber: "",
  });
  const normalizedPhoneNumber = formData.phoneNumber.replace(/[^\d+]/g, "");
  const normalizedMomoNumber = formData.momoNumber.replace(/[^\d+]/g, "");

  useEffect(() => {
    if (count === 0) {
      navigate({ to: "/cart" });
    }
  }, [count, navigate]);

  if (count === 0) {
    return null;
  }

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (
      !formData.customerName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.deliveryLocation.trim()
    ) {
      setError(t("checkout.error.completeDetails"));
      return;
    }

    if (!isValidPhoneNumber(normalizedPhoneNumber)) {
      setError(t("checkout.error.phone"));
      return;
    }

    if (paymentMethod === "mobile-money" && !isValidPhoneNumber(normalizedMomoNumber)) {
      setError(t("checkout.error.momo"));
      return;
    }

    setSubmitting(true);

    let nextPaymentStatus: PaymentStatus = "cash-on-delivery";

    if (paymentMethod === "mobile-money") {
      setPaymentStage("processing");
      setPaymentStatus("processing");
      await delay(1200);
      await delay(800);
      if (shouldRejectMomoNumber(normalizedMomoNumber)) {
        setSubmitting(false);
        setPaymentStage("failure");
        setPaymentStatus("pending");
        setError(t("checkout.paymentFailed"));
        return;
      }
      setPaymentStage("success");
      setPaymentStatus("paid");
      nextPaymentStatus = "paid";
      await delay(500);
    }

    const result = await checkout({
      customerId: user?.id,
      customerEmail: user?.email,
      customerName: formData.customerName.trim(),
      phoneNumber: normalizedPhoneNumber,
      deliveryLocation: formData.deliveryLocation.trim(),
      deliveryNotes: formData.deliveryNotes.trim(),
      paymentMethod,
      momoNumber: paymentMethod === "mobile-money" ? normalizedMomoNumber : undefined,
      paymentStatus: nextPaymentStatus,
    });

    setSubmitting(false);

    if (!result.ok) {
      setPaymentStage("idle");
      setPaymentStatus("pending");
      setError(
        result.productName
          ? `${t("checkout.error.stockUnavailable")} ${result.productName}.`
          : t(result.error),
      );
      return;
    }

    navigate({
      to: "/order-confirmation",
      search: { orderId: result.order.id } as never,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {t("checkout.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {t("checkout.subtitleShort")}
        </p>
      </div>

      <form onSubmit={submitOrder} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{t("checkout.customerDetails")}</h2>
                <p className="text-sm text-muted-foreground">{t("checkout.customerDetailsHint")}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                id="customer-name"
                label={t("checkout.name")}
                value={formData.customerName}
                onChange={(value) =>
                  setFormData((current) => ({ ...current, customerName: value }))
                }
              />
              <Field
                id="phone-number"
                label={t("checkout.phone")}
                value={formData.phoneNumber}
                onChange={(value) => setFormData((current) => ({ ...current, phoneNumber: value }))}
                type="tel"
                inputMode="tel"
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{t("checkout.deliveryLocationLabel")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("checkout.deliveryLocationHint")}
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              <Field
                id="delivery-location"
                label={t("checkout.deliveryLocationLabel")}
                value={formData.deliveryLocation}
                onChange={(value) =>
                  setFormData((current) => ({ ...current, deliveryLocation: value }))
                }
                placeholder={t("checkout.addressPh")}
              />
              <TextAreaField
                id="delivery-notes"
                label={t("checkout.deliveryNotes")}
                value={formData.deliveryNotes}
                onChange={(value) =>
                  setFormData((current) => ({ ...current, deliveryNotes: value }))
                }
                placeholder={t("checkout.deliveryNotesHint")}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{t("ui.paymentMethod")}</h2>
                <p className="text-sm text-muted-foreground">{t("checkout.paymentHint")}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <PaymentOption
                active={paymentMethod === "mobile-money"}
                onClick={() => {
                  setPaymentMethod("mobile-money");
                  setPaymentStage("idle");
                  setPaymentStatus("pending");
                }}
                label={t("checkout.mobileMoney")}
                hint={t("checkout.mobileMoneyHint")}
                icon={<Smartphone className="h-4 w-4" />}
              />
              <PaymentOption
                active={paymentMethod === "cash-on-delivery"}
                onClick={() => {
                  setPaymentMethod("cash-on-delivery");
                  setPaymentStage("idle");
                  setPaymentStatus("cash-on-delivery");
                }}
                label={t("checkout.cashOnDelivery")}
                hint={t("checkout.cashOnDeliveryHint")}
                icon={<CreditCard className="h-4 w-4" />}
              />
            </div>
            {paymentMethod === "mobile-money" ? (
              <div className="mt-4 grid gap-4">
                <Field
                  id="momo-number"
                  label={t("ui.mobileMoneyNumber")}
                  value={formData.momoNumber}
                  onChange={(value) =>
                    setFormData((current) => ({ ...current, momoNumber: value }))
                  }
                  type="tel"
                  inputMode="tel"
                  placeholder={t("signin.phonePh")}
                />
                <PaymentStateCard stage={paymentStage} />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                {t("checkout.cashInstruction")}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-[2rem] border border-border bg-card p-6 shadow-sm lg:sticky lg:top-20">
          <h2 className="mb-4 text-xl font-extrabold">{t("ui.orderSummary")}</h2>
          <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/6 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {t("checkout.reviewOrder")}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{selectedBranch}</div>
          </div>
          <div className="space-y-3">
            {items.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm"
              >
                <div>
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {qty} x {formatRWF(product.price)}
                  </div>
                </div>
                <div className="font-semibold">{formatRWF(product.price * qty)}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2.5 text-sm">
            <SummaryRow label={t("cart.subtotal")} value={formatRWF(subtotal)} />
            <SummaryRow
              label={t("cart.delivery")}
              value={deliveryFee === 0 ? t("cart.free") : formatRWF(deliveryFee)}
            />
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-semibold">{t("cart.total")}</span>
            <span className="text-2xl font-black text-primary">{formatRWF(total)}</span>
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm">
            <div className="font-semibold text-foreground">{t("order.paymentStatusLabel")}</div>
            <div className="mt-1 text-muted-foreground">
              {t(
                `order.payment.${
                  paymentMethod === "cash-on-delivery" ? "cash-on-delivery" : paymentStatus
                }`,
              )}
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full rounded-full"
            disabled={submitting}
          >
            {submitting
              ? t("ui.processing")
              : paymentMethod === "mobile-money"
                ? t("checkout.payWithMomo")
                : t("checkout.placeOrder")}
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
            <Link to="/cart">{t("ui.backToCart")}</Link>
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 rounded-xl"
      />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 min-h-28 rounded-xl"
      />
    </div>
  );
}

function PaymentOption({
  active,
  onClick,
  label,
  hint,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-primary bg-primary/8 shadow-md"
          : "border-border bg-background hover:border-primary/40"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </button>
  );
}

function PaymentStateCard({ stage }: { stage: PaymentStage }) {
  const { t } = useI18n();

  if (stage === "idle") {
    return (
      <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
        {t("checkout.momoInstruction")}
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          {t("checkout.paymentSuccess")}
        </div>
        <div className="mt-1 text-emerald-700/80">{t("checkout.paymentSuccessHint")}</div>
      </div>
    );
  }

  if (stage === "failure") {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        <div className="font-semibold">{t("checkout.paymentFailed")}</div>
        <div className="mt-1 text-destructive/80">{t("checkout.paymentFailedHint")}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/8 p-4 text-sm text-primary">
      <div className="flex items-center gap-2 font-semibold">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        {t("checkout.paymentProcessing")}
      </div>
      <div className="mt-1 text-primary/80">{t("checkout.paymentProcessingHint")}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function isValidPhoneNumber(phoneNumber: string) {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return digitsOnly.length >= 9 && digitsOnly.length <= 15;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function shouldRejectMomoNumber(phoneNumber: string) {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return digitsOnly.endsWith("000") || digitsOnly.endsWith("999");
}
