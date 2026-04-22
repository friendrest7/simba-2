import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Mail, Phone, Sparkles } from "lucide-react";

type SignInSearch = { redirect?: string };

export const Route = createFileRoute("/signin")({
  component: SignInPage,
  validateSearch: (s: Record<string, unknown>): SignInSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in - Simba Supermarket" }] }),
});

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function SignInPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/signin" }) as SignInSearch;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const finish = (user: { name: string; email: string }) => {
    signIn(user);
    navigate({ to: (redirect as "/checkout") || "/" });
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    finish({ name: name || email.split("@")[0], email });
  };

  const submitGoogle = () => {
    finish({ name: "Google User", email: "user@gmail.com" });
  };

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length >= 9) setOtpSent(true);
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) finish({ name: `Simba ${phone.slice(-4)}`, email: `${phone}@phone.simba` });
  };

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="w-full rounded-3xl border border-border bg-card/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Simba</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{t("signin.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {redirect === "/checkout" ? t("signin.subtitleCheckout") : t("signin.subtitle")}
        </p>

        <Button onClick={submitGoogle} variant="outline" size="lg" className="mt-6 h-11 w-full gap-2 rounded-full font-semibold">
          <GoogleIcon className="h-4 w-4" />
          {t("signin.google")}
        </Button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{t("signin.or")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="email">
          <TabsList className="grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="email" className="gap-1.5 rounded-full">
              <Mail className="h-3.5 w-3.5" /> {t("signin.tab.email")}
            </TabsTrigger>
            <TabsTrigger value="phone" className="gap-1.5 rounded-full">
              <Phone className="h-3.5 w-3.5" /> {t("signin.tab.phone")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <form onSubmit={submitEmail} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="name">{t("signin.name")}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("signin.namePh")} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="email">{t("signin.email")}</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("signin.emailPh")} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="password">{t("signin.password")}</Label>
                <Input id="password" type="password" required placeholder={t("ui.passwordPlaceholder")} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90 glow-primary">
                {t("signin.cta")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            {!otpSent ? (
              <form onSubmit={sendOtp} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="phone">{t("signin.phoneLabel")}</Label>
                  <div className="mt-1.5 flex gap-2">
                    <span className="inline-flex h-11 items-center rounded-xl border border-border bg-secondary px-3 text-sm font-semibold">+250</span>
                    <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder={t("signin.phonePh")} className="h-11 flex-1 rounded-xl" />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{t("signin.phoneHint")}</p>
                </div>
                <Button type="submit" size="lg" className="w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90">
                  {t("signin.sendCode")}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="otp">{t("signin.otpLabel")}</Label>
                  <Input id="otp" inputMode="numeric" required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="mt-1.5 h-11 rounded-xl text-center font-mono tracking-[0.5em]" />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {t("signin.otpHint")} +250 {phone}.{" "}
                    <button type="button" onClick={() => setOtpSent(false)} className="text-primary hover:underline">
                      {t("signin.changeNumber")}
                    </button>
                  </p>
                </div>
                <Button type="submit" size="lg" className="w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90">
                  {t("signin.verifyCta")}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        {!redirect && (
          <Link to="/" className="mt-5 block text-center text-xs text-muted-foreground hover:text-primary">
            {t("signin.guest")} {"->"}
          </Link>
        )}
      </div>
    </div>
  );
}
