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
  Moon,
  Sun,
  Languages,
  User as UserIcon,
  Search,
  MapPin,
  Palette,
  Zap,
  ShoppingBag,
} from "lucide-react";
import cartIcon from "@/assets/cart-icon.png";
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
    if (q.trim()) navigate({ to: "/products", search: { q: q.trim() } as never });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:gap-5">
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition-transform group-hover:scale-105">
            <span className="text-xl font-black text-primary-foreground">S</span>
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-base font-extrabold tracking-tight text-foreground">
              Simba
            </span>
            <span className="text-[10px] font-bold text-primary -mt-1 tracking-widest uppercase">
              Supermarket
            </span>
          </div>
        </Link>

        <a
          href={KIGALI_MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80 transition-colors"
          aria-label="Open Simba Supermarket on Google Maps"
        >
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{t("nav.location")}</span>
        </a>

        <form onSubmit={submit} className="relative flex-1 max-w-md ml-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            className="h-10 rounded-full border-input bg-muted/50 pl-9 pr-4 text-sm focus-visible:ring-primary/50"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden lg:flex items-center gap-1 mr-2">
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  aria-label="Color theme"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Color theme</DropdownMenuLabel>
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  aria-label="Language"
                >
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold">
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
            <Button
              asChild
              variant="ghost"
              className="rounded-full gap-2 hover:bg-secondary"
            >
              <Link to="/signin">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline font-semibold">{t("nav.signin")}</span>
              </Link>
            </Button>
          )}

          <Button
            asChild
            className="relative h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-4 shadow-lg shadow-primary/20"
          >
            <Link to="/cart">
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-bold text-black border-2 border-primary">
                    {count}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline tabular-nums font-bold">
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
      </div>
    </header>
  );
}
