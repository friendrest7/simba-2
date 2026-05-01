import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCENTS, useTheme } from "@/lib/theme";
import { CURRENCY_OPTIONS, useCurrency } from "@/lib/currency";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { PICKUP_BRANCHES, type BranchName } from "@/lib/demo-store";
import { getBranchMapUrl } from "@/lib/branchLocations";
import { formatRWF } from "@/lib/products";
import { cn } from "@/lib/utils";
import {
  Check,
  Globe2,
  MapPin,
  Moon,
  Search,
  ShoppingBag,
  Palette,
  Sun,
  User as UserIcon,
  Menu,
} from "lucide-react";
import { useState } from "react";
import logoImage from "@/assets/logo1.png";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

export function Header() {
  const { theme, toggle, accent, setAccent } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { t, lang, setLang } = useI18n();
  const { count, subtotal, selectedBranch, setSelectedBranch } = useCart();
  const { user, signOut } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const selectedBranchMapUrl = getBranchMapUrl(selectedBranch);
  const dashboardRoute =
    user?.role === "manager" || user?.role === "staff" ? "/dashboard" : "/client-dashboard";
  const dashboardLabel =
    user?.role === "manager" || user?.role === "staff"
      ? t("nav.marketRepDashboard")
      : t("client.dashboard");
  const signInRedirect =
    typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/";
  const ordersRoute = user ? dashboardRoute : "/signin";
  const ordersSearch = user
    ? undefined
    : ({ redirect: "/client-dashboard", intent: "client" } as never);

  const primaryNavItems = [
    { to: "/" as const, label: t("nav.home") },
    { to: "/products" as const, label: t("nav.shop") },
    { to: ordersRoute, label: t("nav.orders"), search: ordersSearch },
  ];

  const adminNavItems = user?.role === "manager" || user?.role === "staff" 
    ? [{ to: "/dashboard" as const, label: t("nav.marketRepDashboard") }]
    : [];

  const allNavItems = [...primaryNavItems, ...adminNavItems];

  const trustNavItems = [
    { to: "/products" as const, label: t("hero.trust.stock"), icon: Check },
    { to: ordersRoute, label: t("hero.trust.orders"), icon: MapPin, search: ordersSearch },
    { to: dashboardRoute, label: t("hero.trust.staff"), icon: UserIcon },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/products", search: { q: q.trim() } as never });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-primary/15 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--brand)_96%,black_4%),color-mix(in_oklab,var(--brand)_86%,black_14%))] text-primary-foreground shadow-[0_8px_20px_rgba(71,20,6,0.16)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1.5">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden text-primary-foreground hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
            <SheetHeader className="p-6 border-b text-left">
              <SheetTitle className="flex items-center gap-2">
                <img src={logoImage} alt="Simba" className="h-6 w-6 object-contain" />
                <span>Simba Market</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col py-2">
              <div className="px-6 py-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t("nav.shop")}</label>
              </div>
              {primaryNavItems.map((item) => (
                <Link
                  key={`mobile-${item.label}`}
                  to={item.to}
                  search={item.search}
                  className="px-6 py-3 text-sm font-semibold hover:bg-accent transition flex items-center justify-between"
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="mt-4 px-6 py-2 border-t">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Management</label>
              </div>
              {trustNavItems.map((item) => (
                <Link
                  key={`mobile-trust-${item.label}`}
                  to={item.to}
                  search={item.search}
                  className="px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="flex-1 leading-snug">{item.label}</span>
                </Link>
              ))}

              {adminNavItems.length > 0 && (
                <>
                  <div className="mt-4 px-6 py-2 border-t">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Admin</label>
                  </div>
                  {adminNavItems.map((item) => (
                    <Link
                      key={`mobile-admin-${item.label}`}
                      to={item.to}
                      className="px-6 py-3 text-sm font-semibold hover:bg-accent transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
              <div className="mt-4 px-6 pt-4 border-t space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("header.chooseBranch")}</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value as BranchName)}
                      className="w-full h-10 rounded-lg border bg-background pl-10 pr-3 text-sm font-medium"
                    >
                      {PICKUP_BRANCHES.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("lang.label")}</label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value as Lang)}
                      className="w-full h-10 rounded-lg border bg-background px-3 text-sm font-medium"
                    >
                      {LANGS.map((l) => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("ui.currency")}</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="w-full h-10 rounded-lg border bg-background px-3 text-sm font-medium"
                    >
                      {CURRENCY_OPTIONS.map((o) => (
                        <option key={o.code} value={o.code}>{o.code}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pt-2 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("ui.colorTheme")}</label>
                    <select
                      aria-label={t("ui.colorTheme")}
                      value={accent}
                      onChange={(e) => setAccent(e.target.value as (typeof ACCENTS)[number]["id"])}
                      className="w-full h-10 rounded-lg border bg-background px-3 text-sm font-medium"
                    >
                      {ACCENTS.map((themeAccent) => (
                        <option key={themeAccent.id} value={themeAccent.id}>
                          {t(`accent.${themeAccent.id}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button variant="outline" className="w-full justify-start gap-2 h-10" onClick={toggle}>
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{t("ui.toggleTheme")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[0.85rem] border border-white/18 bg-white p-1 shadow-sm">
            <img src={logoImage} alt="Simba Supermarket" className="h-full w-full object-contain" />
          </div>
          <div className="hidden sm:block min-w-0">
            <div className="display-brand text-[1.02rem] leading-none tracking-tight text-white">
              Simba
            </div>
            <div className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-primary-foreground/74">
              Market
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {allNavItems.map((item) => (
            <Link
              key={`${item.to}-${item.label}`}
              to={item.to}
              activeProps={{ className: "bg-white text-primary shadow-sm" }}
              className={cn(
                "inline-flex h-7 items-center rounded-full border border-white/12 px-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-primary-foreground/90 transition",
                "bg-white/8 hover:bg-white/16 hover:text-primary-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="flex-1 max-w-[200px] xl:max-w-xs ml-auto lg:ml-0">
          <div className="flex items-center gap-2 rounded-full border border-white/22 bg-white/10 px-3 py-1.5 transition-all focus-within:bg-white focus-within:text-foreground">
            <Search className="h-3 w-3 text-primary-foreground/70 group-focus-within:text-primary" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search.placeholder")}
              className="h-4 border-0 bg-transparent px-0 text-[11px] font-medium text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-0 focus-visible:text-foreground"
            />
          </div>
        </form>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Settings available on lg+ screens */}
          <div className="hidden lg:flex items-center gap-1.5">
            <div className="relative">
              <Globe2 className="pointer-events-none absolute left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-primary" />
              <select
                aria-label={t("lang.label")}
                value={lang}
                onChange={(event) => setLang(event.target.value as Lang)}
                className="h-7 min-w-[3.5rem] rounded-full border border-white/20 bg-white pl-5 pr-1 text-[9px] font-bold text-foreground"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Palette className="pointer-events-none absolute left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-primary" />
              <select
                aria-label={t("ui.colorTheme")}
                value={accent}
                onChange={(event) => setAccent(event.target.value as (typeof ACCENTS)[number]["id"])}
                className="h-7 min-w-[3.5rem] rounded-full border border-white/20 bg-white pl-5 pr-1 text-[9px] font-bold text-foreground"
              >
                {ACCENTS.map((themeAccent) => (
                  <option key={themeAccent.id} value={themeAccent.id}>
                    {t(`accent.${themeAccent.id}`)}
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              className="h-7 w-7 rounded-full border border-white/14 bg-white/8 text-primary-foreground hover:bg-white/14"
            >
              {theme === "dark" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            </Button>

            {/* Extra settings on xl+ screens (Branch, Currency) */}
            <div className="hidden xl:flex items-center gap-1.5">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-primary" />
                <select
                  aria-label={t("header.chooseBranch")}
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value as BranchName)}
                  className="h-7 min-w-[6.5rem] rounded-full border border-white/20 bg-white pl-5 pr-2 text-[9px] font-bold text-foreground"
                >
                  {PICKUP_BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <select
                aria-label={t("ui.currency")}
                value={currency}
                onChange={(event) => setCurrency(event.target.value as any)}
                className="h-7 rounded-full border border-white/20 bg-white px-2 text-[9px] font-bold text-foreground"
              >
                {CURRENCY_OPTIONS.map((o) => (
                  <option key={o.code} value={o.code}>{o.code}</option>
                ))}
              </select>
            </div>
          </div>


          <div className="flex items-center gap-1.5">
            {user ? (
              <Button
                variant="ghost"
                className="h-8 rounded-full gap-1.5 border border-white/12 bg-white/8 px-2 text-primary-foreground hover:bg-white/12"
                onClick={() => void signOut()}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-[10px] font-bold uppercase lg:inline">{t("nav.signout")}</span>
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="h-8 rounded-full border border-white/12 bg-white/8 px-2 text-primary-foreground hover:bg-white/12"
              >
                <Link to="/signin">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="hidden text-[10px] font-bold uppercase lg:inline">{t("nav.signin")}</span>
                </Link>
              </Button>
            )}

            <Button
              asChild
              className="relative h-8 rounded-full bg-[linear-gradient(180deg,#fff4d6,#ffd665)] px-3 text-[#4b1a00] shadow-sm hover:bg-[linear-gradient(180deg,#fff0c5,#ffcd4d)]"
            >
              <Link to="/cart" className="gap-2">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold tabular-nums">
                  {count > 0 ? formatRWF(subtotal) : t("nav.cart")}
                </span>
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[8px] font-bold text-brand-foreground ring-2 ring-[#ffd665]">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
