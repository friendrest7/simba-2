import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, ShoppingBasket, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductCard } from "@/components/ProductCard";
import { BranchReviews } from "@/components/BranchReviews";
import { CategoryGrid } from "@/components/CategoryGrid";
import { AIAssistant } from "@/components/AIAssistant";
import { useCart } from "@/lib/cart";
import { getStoredLang, translate, useI18n } from "@/lib/i18n";
import { PICKUP_BRANCHES, type BranchName } from "@/lib/demo-store";
import { searchProducts } from "@/lib/products";

const heroImage = "/assets/images/home/1.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: translate(getStoredLang(), "meta.siteTitle") },
      {
        name: "description",
        content: translate(getStoredLang(), "meta.siteDescription"),
      },
    ],
  }),
});

function HomePage() {
  const { t } = useI18n();
  const { selectedBranch, setSelectedBranch } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [draftPrompt, setDraftPrompt] = useState("");

  const featuredResults = useMemo(
    () => searchProducts(q || t("landing.defaultSearch")).slice(0, 10),
    [q, t],
  );
  const promptSuggestions = t("landing.suggestions")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  const heroTabs = [
    t("nav.shop"),
    t("hero.trust.stock"),
    t("hero.trust.orders"),
    t("hero.trust.staff"),
  ];

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = draftPrompt.trim();
    setQ(prompt);
    navigate({ to: "/products", search: prompt ? ({ q: prompt } as never) : undefined });
  };

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#5f1803_0%,#b22d04_45%,#dc5a10_100%)] text-white">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(15,8,4,0.82)_0%,rgba(15,8,4,0.58)_42%,rgba(15,8,4,0.16)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(38,10,3,0.3),rgba(38,10,3,0.65))]" />

        <div className="relative z-20 border-b border-white/12 bg-[rgba(92,28,8,0.58)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {heroTabs.map((tab, index) => (
              <div
                key={tab}
                className={`rounded-t-2xl px-5 py-3 text-sm font-extrabold whitespace-nowrap transition ${
                  index === 0
                    ? "bg-[rgba(255,255,255,0.08)] text-brand-yellow shadow-[inset_0_-2px_0_rgba(255,210,65,0.35)]"
                    : "text-white/80"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div className="max-w-3xl">
              <div className="mt-8">
                <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-yellow/95">
                  {t("hero.welcome")}
                </div>
                <h1 className="display-brand mt-4 max-w-3xl text-5xl leading-none tracking-tight text-balance md:text-7xl">
                  {t("hero.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
                  {t("hero.body2")}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="h-12 rounded-2xl bg-brand-yellow px-6 text-base font-black text-black shadow-[0_14px_30px_rgba(255,202,15,0.28)] hover:bg-brand-yellow/92"
                  >
                    <Link to="/products">
                      {t("landing.startShopping")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-2xl border-white/26 bg-white/10 px-6 text-base font-bold text-white hover:bg-white/14"
                  >
                    <Link to="/shop">{t("nav.shop")}</Link>
                  </Button>
                </div>
              </div>

              <div className="mt-14 grid gap-3 sm:grid-cols-3">
                <HeroPoint
                  icon={<ShoppingBasket className="h-4 w-4" />}
                  text={t("hero.trust.stock")}
                />
                <HeroPoint icon={<Truck className="h-4 w-4" />} text={t("hero.trust.orders")} />
                <HeroPoint
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  text={t("hero.trust.staff")}
                />
              </div>

              <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                <HeroMetric label="Open daily" value="07:00 - 23:00" />
                <HeroMetric label={t("home.trust2")} value="MoMo + card" />
                <HeroMetric label={t("home.trust3")} value={selectedBranch} />
              </div>
            </div>

            <div className="rounded-[1.3rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,241,0.96))] p-3 text-foreground shadow-[0_18px_42px_rgba(25,9,74,0.18)] md:p-3.5">
              <div className="text-center text-[1.18rem] font-black tracking-tight text-primary md:text-[1.35rem]">
                {t("landing.panelLabel")}
              </div>
              <p className="mt-0.5 text-center text-[10px] font-semibold text-foreground md:text-[11px]">
                {t("landing.panelTitle")}
              </p>

              <form className="mt-3 grid gap-2" onSubmit={submitPrompt}>
                <div className="grid gap-2 md:grid-cols-[128px_1fr]">
                  <div className="rounded-[1rem] border border-border bg-card px-2.5 py-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {t("header.chooseBranch")}
                    </div>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value as BranchName)}
                      className="mt-0.5 h-6.5 w-full rounded-xl border-0 bg-transparent px-0 text-[12px] font-semibold text-foreground shadow-none focus:outline-none"
                    >
                      {PICKUP_BRANCHES.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-[1rem] border border-primary/25 bg-card px-2.5 py-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/72">
                      {t("landing.label")}
                    </div>
                    <Textarea
                      value={draftPrompt}
                      onChange={(e) => setDraftPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          e.currentTarget.form?.requestSubmit();
                        }
                      }}
                      placeholder={t("landing.placeholder")}
                      rows={2}
                      className="mt-0.5 min-h-[44px] resize-none border-0 bg-transparent px-0 py-0 text-[12px] text-foreground shadow-none placeholder:text-[11px] placeholder:text-muted-foreground focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {promptSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDraftPrompt(suggestion)}
                      className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-secondary-foreground transition hover:bg-secondary/80"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <Button type="submit" className="h-8 rounded-[0.95rem] bg-primary text-[12px] font-black text-primary-foreground hover:bg-primary/92">
                  {t("landing.startShopping")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-2.5 grid gap-1.5 sm:grid-cols-3">
                <HeroMetric label={t("home.trust1")} value="Pickup" />
                <HeroMetric label={t("home.trust2")} value="MoMo" />
                <HeroMetric label={t("home.trust3")} value={selectedBranch} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <CategoryGrid />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {t("products.aiTitle")}
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                {t("products.resultsForBranch")} {selectedBranch}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("products.aiExamples")}</p>
            </div>
            <Link
              to="/products"
              search={{ q } as never}
              className="text-sm font-bold text-primary hover:underline"
            >
              {t("ui.browseAll")}
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {featuredResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2">
        <BranchReviews branch={selectedBranch} />
      </section>

      <AIAssistant
        branch={selectedBranch}
        candidates={featuredResults.length ? featuredResults : searchProducts(t("landing.defaultSearch")).slice(0, 12)}
        onUseSuggestedQuery={(nextQuery) =>
          navigate({ to: "/products", search: nextQuery ? ({ q: nextQuery } as never) : undefined })
        }
      />
    </div>
  );
}

function HeroPoint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-[rgba(255,248,240,0.08)] p-3 text-sm text-white/90 backdrop-blur-sm">
      <div className="flex items-center gap-2 font-semibold">
        <span className="text-brand-yellow">{icon}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.95rem] border border-border bg-secondary px-2 py-2">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-[12px] font-extrabold text-foreground">{value}</div>
    </div>
  );
}
