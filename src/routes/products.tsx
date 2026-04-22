import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS, categoryLabel } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { conversationalSearch } from "@/lib/demo-store";
import { useCart } from "@/lib/cart";
import { Search, SlidersHorizontal, X } from "lucide-react";

type SearchParams = { q?: string; cat?: string; sort?: string; inStock?: string };

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    inStock: typeof s.inStock === "string" ? s.inStock : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Products - Simba Supermarket" },
      { name: "description", content: "Search and filter products at Simba Supermarket Rwanda." },
    ],
  }),
});

function ProductsPage() {
  const { t } = useI18n();
  const { selectedBranch, stockOf } = useCart();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const cat = search.cat ?? "";
  const sort = search.sort ?? "popular";
  const inStockOnly = search.inStock === "1";
  const [showFilters, setShowFilters] = useState(false);

  const updateSearch = (next: Partial<SearchParams>) => {
    navigate({ search: (prev) => ({ ...prev, ...next }) as never });
  };

  const results = useMemo(() => {
    let list = q.trim() ? conversationalSearch(q, selectedBranch).products : [...PRODUCTS];
    if (cat) list = list.filter((p) => p.category === cat);
    if (inStockOnly) list = list.filter((p) => stockOf(p.id) > 0);
    switch (sort) {
      case "priceAsc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }, [q, cat, sort, inStockOnly, selectedBranch, stockOf]);

  const clearFilters = () => {
    setQ("");
    updateSearch({ q: undefined, cat: undefined, sort: "popular", inStock: undefined });
    setShowFilters(false);
  };

  const searchExplanation = useMemo(() => conversationalSearch(q || "popular essentials", selectedBranch).explanation, [q, selectedBranch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight md:text-4xl">{t("section.allProducts")}</h1>

      <div className="mb-6 rounded-[2rem] border border-border bg-card p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t("products.aiTitle")}</div>
        <h2 className="mt-1 text-2xl font-black tracking-tight">{selectedBranch}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("products.aiBody")}</p>
        <p className="mt-2 text-sm text-primary">{searchExplanation}</p>
        <p className="mt-2 text-xs text-muted-foreground">{t("products.aiExamples")}</p>
      </div>

      <div className="sticky top-16 z-30 mb-8 flex flex-col gap-4 bg-background/90 py-4 backdrop-blur md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              updateSearch({ q: e.target.value || undefined });
            }}
            placeholder={t("hero.searchHint2")}
            className="h-12 rounded-full border-input bg-muted/50 pl-10 text-base focus-visible:ring-primary/50"
          />
        </div>

        <button onClick={() => setShowFilters(!showFilters)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-secondary px-5 text-secondary-foreground transition-colors hover:bg-secondary/80 md:hidden">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="font-semibold">{t("ui.filters")}</span>
        </button>

        <div className="hidden items-center gap-3 md:flex">
          <select value={sort} onChange={(e) => updateSearch({ sort: e.target.value })} className="h-12 rounded-full border border-input bg-background px-4 text-base font-medium text-foreground shadow-sm focus:border-primary/50 focus:ring-primary/50">
            <option value="popular">{t("sort.popular")}</option>
            <option value="priceAsc">{t("sort.priceAsc")}</option>
            <option value="priceDesc">{t("sort.priceDesc")}</option>
            <option value="name">{t("sort.name")}</option>
          </select>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 bg-background/95 backdrop-blur transition-transform duration-300 ease-in-out md:hidden ${showFilters ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-xl font-bold">{t("ui.filters")}</h2>
          <button onClick={() => setShowFilters(false)} className="p-2" aria-label={t("back")}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold">{t("nav.categories")}</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => updateSearch({ cat: undefined })} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${!cat ? "gradient-brand text-brand-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {t("filter.all")}
              </button>
              {CATEGORIES.map((c) => (
                <button key={c.slug} onClick={() => updateSearch({ cat: cat === c.name ? undefined : c.name })} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${cat === c.name ? "gradient-brand text-brand-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                  {c.emoji} {categoryLabel(c.name, t)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold">{t("ui.sortBy")}</h3>
            <select value={sort} onChange={(e) => updateSearch({ sort: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-4 text-base font-medium text-foreground shadow-sm focus:border-primary/50 focus:ring-primary/50">
              <option value="popular">{t("sort.popular")}</option>
              <option value="priceAsc">{t("sort.priceAsc")}</option>
              <option value="priceDesc">{t("sort.priceDesc")}</option>
              <option value="name">{t("sort.name")}</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-background p-4 text-base font-medium text-foreground shadow-sm">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => updateSearch({ inStock: e.target.checked ? "1" : undefined })} className="h-5 w-5 rounded border-input accent-primary" />
              {t("filter.inStock")}
            </label>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 p-4">
          <div className="flex gap-2">
            <Button onClick={clearFilters} variant="outline" className="h-12 flex-1 rounded-full">{t("ui.clearAll")}</Button>
            <Button onClick={() => setShowFilters(false)} className="h-12 flex-1 rounded-full gradient-brand text-brand-foreground">{t("ui.showResults")}</Button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto max-w-md rounded-[1.75rem] border border-border/70 bg-card p-8 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-foreground">{t("products.emptyTitle")}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{t("ui.noProductsMatch")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("products.emptyBody")}
            </p>
          </div>
          <Link to="/products" className="mt-4 inline-block font-semibold text-primary hover:underline">
            {t("ui.clearFiltersTryAgain")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
