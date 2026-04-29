import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, ShoppingBasket, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductCard } from "@/components/ProductCard";
import { BranchReviews } from "@/components/BranchReviews";
import { useCart } from "@/lib/cart";
import { getStoredLang, translate, useI18n } from "@/lib/i18n";
import { PICKUP_BRANCHES, type BranchName } from "@/lib/demo-store";
import { searchProducts } from "@/lib/products";
import simbaLogo from "@/assets/simba-ref.png";
import heroPhoto1 from "../../1.jpg";
import heroPhoto2 from "../../2.jpg";
import heroPhoto3 from "../../3.jpg";
import heroPhoto4 from "../../4.jpg";

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
  const [activeSlide, setActiveSlide] = useState(0);

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
  const heroSlides = [heroPhoto1, heroPhoto2, heroPhoto3, heroPhoto4];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, []);

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = draftPrompt.trim();
    setQ(prompt);
    navigate({ to: "/products", search: prompt ? ({ q: prompt } as never) : undefined });
  };

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#3d225f_0%,#5b347f_34%,#7b4f66_68%,#9c6a45_100%)] text-white">
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, index) => (
            <img
              key={slide}
              src={slide}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,0)_100%)]" />
        <div className="relative z-20 border-b border-white/12 bg-[rgba(52,32,73,0.72)] backdrop-blur-sm">
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
              <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-brand-yellow" />
                {t("hero.badge2")}
              </div>
              <div className="mt-8">
                <div className="text-sm font-bold uppercase tracking-[0.24em] text-brand-yellow/95">
                  {t("hero.welcome")}
                </div>
                <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-balance md:text-6xl">
                  {t("hero.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
                  {t("hero.body2")}
                </p>
                <div className="mt-6 inline-flex items-center gap-4 rounded-[1.6rem] border border-white/14 bg-[rgba(255,248,240,0.08)] p-3 shadow-[0_20px_50px_rgba(25,9,74,0.16)] backdrop-blur-sm">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] bg-white/90 p-2">
                    <img src={simbaLogo} alt="Simba logo" className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-yellow/95">
                      Simba Supermarket
                    </div>
                    <div className="mt-1 text-sm leading-6 text-white/86">
                      Clean grocery shopping, branch stock, and fast pickup in one place.
                    </div>
                  </div>
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
              <div className="mt-6 flex gap-2">
                {heroSlides.map((slide, index) => (
                  <span
                    key={`dot-${slide}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === activeSlide ? "w-10 bg-brand-yellow" : "w-4 bg-white/30"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-4 text-foreground shadow-[0_28px_80px_rgba(25,9,74,0.28)] md:p-7">
              <div className="text-center text-3xl font-black tracking-tight text-primary">
                {t("landing.panelLabel")}
              </div>
              <p className="mt-2 text-center text-sm font-bold text-foreground">
                {t("landing.panelTitle")}
              </p>
              <form className="mt-6 grid gap-4" onSubmit={submitPrompt}>
                <div className="grid gap-3 md:grid-cols-[170px_1fr]">
                  <div className="rounded-2xl border-2 border-border bg-card px-4 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {t("header.chooseBranch")}
                    </div>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value as BranchName)}
                      className="mt-2 h-10 w-full rounded-xl border-0 bg-transparent px-0 text-base font-semibold text-foreground shadow-none focus:outline-none"
                    >
                      {PICKUP_BRANCHES.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border-2 border-primary/35 bg-card px-4 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary/72">
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
                      className="mt-2 min-h-[72px] resize-none border-0 bg-transparent px-0 py-0 text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDraftPrompt(suggestion)}
                      className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/80"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="h-12 rounded-2xl bg-brand-yellow text-base font-black text-black shadow-[0_14px_30px_rgba(255,202,15,0.28)] hover:bg-brand-yellow/92"
                >
                  {t("landing.startShopping")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <HeroMetric label={t("home.trust1")} value="24/7" />
                <HeroMetric label={t("home.trust2")} value="MoMo" />
                <HeroMetric label={t("home.trust3")} value={selectedBranch} />
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}

function HeroPoint({ icon, text }: { icon: React.ReactNode; text: string }) {
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
    <div className="rounded-2xl border border-border bg-secondary px-3 py-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-foreground">{value}</div>
    </div>
  );
}
