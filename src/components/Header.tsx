import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, ACCENTS } from "@/lib/theme";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import {
  Languages,
  MapPin,
  Moon,
  Palette,
  Search,
  ShoppingBag,
  Sun,
  Timer,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";

const KIGALI_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Kigali+Rwanda";

export function Header() {
  const { theme, toggle, accent, setAccent } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { count, subtotal } = useCart();
  const { user, signOut } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/products", search: { q: q.trim() } as never });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/94 backdrop-blur supports-[backdrop-filter]:bg-background/88">
      <div className="border-b border-border/60 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--brand-yellow)_92%,white)_0%,var(--brand-yellow)_100%)]">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-black/85">
          <div className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5" />
            <span>{t("ui.fastDeliveryBanner")}</span>
          </div>
          <a
            href={KIGALI_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 md:inline-flex"
          >
            <MapPin className="h-3.5 w-3.5" />
            Kigali, Rwanda
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-md shadow-primary/20">
            S
          </div>
          <div className="hidden min-w-0 sm:block">
            <div className="text-base font-black tracking-tight text-foreground">Simba</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
              Supermarket
            </div>
          </div>
        </Link>

        <form onSubmit={submit} className="min-w-0 flex-1">
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-primary" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search.placeholder")}
              className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </form>

        <div className="hidden items-center gap-1 lg:flex">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full" aria-label={t("ui.colorTheme")}>
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("ui.colorTheme")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ACCENTS.map((a) => (
                <DropdownMenuItem
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  className={accent === a.id ? "font-semibold" : ""}
                >
                  <span
                    className="mr-2 inline-block h-3.5 w-3.5 rounded-full ring-1 ring-border"
                    style={{ background: a.swatch }}
                  />
                  {a.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full" aria-label="Language">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("lang.label")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANGS.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code as Lang)}
                  className={lang === l.code ? "font-semibold text-primary" : ""}
                >
                  <span className="mr-2">{l.flag}</span>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full gap-2 px-2 hover:bg-secondary">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-semibold sm:inline">
                  {user.name.split(" ")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                {t("nav.signout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="ghost" className="rounded-full gap-2 hover:bg-secondary">
            <Link to="/signin">
              <UserIcon className="h-4 w-4 text-primary" />
              <span className="hidden font-semibold sm:inline">{t("nav.signin")}</span>
            </Link>
          </Button>
        )}

        <Button
          asChild
          className="relative h-11 rounded-2xl bg-primary px-4 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/92"
        >
          <Link to="/cart" className="gap-2">
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-bold text-black ring-2 ring-primary">
                  {count}
                </span>
              )}
            </div>
            <span className="hidden font-bold tabular-nums sm:inline">
              {subtotal > 0
                ? new Intl.NumberFormat("en-RW", {
                    style: "currency",
                    currency: "RWF",
                    maximumFractionDigits: 0,
                  }).format(subtotal)
                : t("nav.cart")}
            </span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
