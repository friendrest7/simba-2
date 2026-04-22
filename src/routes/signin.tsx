import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";

type SignInSearch = { redirect?: string };

export const Route = createFileRoute("/signin")({
  component: SignInPage,
  validateSearch: (s: Record<string, unknown>): SignInSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in - Simba Supermarket" }] }),
});

function SignInPage() {
  const { t } = useI18n();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/signin" }) as SignInSearch;
  const [authError, setAuthError] = useState<string | null>(null);
  const [signInData, setSignInData] = useState({ credential: "", password: "" });
  const [signUpData, setSignUpData] = useState({ name: "", email: "", phone: "", password: "" });

  const goNext = () => {
    navigate({ to: (redirect as "/checkout") || "/" });
  };

  const submitSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const result = signIn(signInData);
    if (!result.ok) {
      setAuthError(t(result.error));
      return;
    }
    goNext();
  };

  const submitSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const result = signUp(signUpData);
    if (!result.ok) {
      setAuthError(t(result.error));
      return;
    }
    goNext();
  };

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center px-4 py-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[18%] top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[12%] top-1/3 h-80 w-80 rounded-full bg-brand-yellow/20 blur-3xl" />
      </div>

      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-border bg-[linear-gradient(150deg,rgba(9,61,40,0.98),rgba(9,43,31,0.95))] p-8 text-white shadow-2xl shadow-primary/10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            <Sparkles className="h-4 w-4 text-brand-yellow" />
            Simba 2.0
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">{t("signin.title")}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
            {redirect === "/checkout" ? t("signin.subtitleCheckout") : t("signin.subtitle")}
          </p>

          <div className="mt-8 grid gap-3">
            <Feature title={t("hero.trust.stock")} body={t("home.trust2")} />
            <Feature title={t("hero.trust.orders")} body={t("pickup.instructions")} />
            <Feature title={t("hero.trust.staff")} body={t("home.trust3")} />
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
            <div className="text-sm font-bold text-brand-yellow">{t("auth.demoAccounts")}</div>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <p>{t("auth.managerDemo")}</p>
              <p>{t("auth.staffDemo")}</p>
              <p className="text-white/65">{t("auth.passwordHint")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card/90 p-8 shadow-xl backdrop-blur">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="signin" className="gap-2 rounded-full">
                <LockKeyhole className="h-4 w-4" />
                {t("auth.signInTab")}
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2 rounded-full">
                <UserRound className="h-4 w-4" />
                {t("auth.signUpTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={submitSignIn} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="credential">{t("auth.credential")}</Label>
                  <Input
                    id="credential"
                    required
                    value={signInData.credential}
                    onChange={(e) => setSignInData((current) => ({ ...current, credential: e.target.value }))}
                    placeholder="manager@simba.demo"
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="password">{t("signin.password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={signInData.password}
                    onChange={(e) => setSignInData((current) => ({ ...current, password: e.target.value }))}
                    placeholder={t("ui.passwordPlaceholder")}
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                {authError && <AuthError message={authError} />}
                <Button type="submit" size="lg" className="w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90">
                  {t("signin.cta")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={submitSignUp} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="name">{t("signin.name")}</Label>
                  <Input
                    id="name"
                    required
                    value={signUpData.name}
                    onChange={(e) => setSignUpData((current) => ({ ...current, name: e.target.value }))}
                    placeholder={t("signin.namePh")}
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("signin.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={signUpData.email}
                    onChange={(e) => setSignUpData((current) => ({ ...current, email: e.target.value }))}
                    placeholder={t("signin.emailPh")}
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t("auth.phone")}</Label>
                  <Input
                    id="phone"
                    required
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData((current) => ({ ...current, phone: e.target.value }))}
                    placeholder="0788 000 000"
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">{t("signin.password")}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    required
                    value={signUpData.password}
                    onChange={(e) => setSignUpData((current) => ({ ...current, password: e.target.value }))}
                    placeholder={t("ui.passwordPlaceholder")}
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                {authError && <AuthError message={authError} />}
                <Button type="submit" size="lg" className="w-full rounded-full gradient-brand text-brand-foreground hover:opacity-90">
                  {t("auth.createAccount")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {!redirect && (
            <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <Mail className="h-4 w-4" />
              {t("signin.guest")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="mt-1 text-sm text-white/75">{body}</div>
    </div>
  );
}

function AuthError({ message }: { message: string }) {
  return <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{message}</div>;
}
