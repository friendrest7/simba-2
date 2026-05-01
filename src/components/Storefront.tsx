import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { AIAssistant } from "@/components/AIAssistant";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import {
  CATEGORIES,
  PRODUCTS,
  categoryLabel,
  formatRWF,
  productDescription,
  type Product,
} from "@/lib/products";
import type { ShopSearchParams } from "@/lib/shop-search";

const PRICE_OPTIONS = [
  { id: "all", min: undefined, max: undefined },
  { id: "under-3000", min: undefined, max: 3000 },
  { id: "3000-10000", min: 3000, max: 10000 },
  { id: "10000-30000", min: 10000, max: 30000 },
  { id: "30000-plus", min: 30000, max: undefined },
] as const;

const matchesSearch = (query: string, productText: string) => {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return true;
  }

  return terms.every((term) => productText.includes(term));
};

type AssistantResponse = {
  answer: string;
  suggestedQuery: string;
  productIds: number[];
};

const buildSearchFallback = (message: string, branch: string, candidates: Product[]) => {
  const normalized = message.trim().toLowerCase();
  const shortlist = candidates.slice(0, 6);

  return {
    answer: shortlist.length
      ? `Showing visual matches for ${branch}: ${shortlist.map((product) => product.name).join(", ")}.`
      : `No strong visual matches found for ${branch}. Try a category, budget, or brand.`,
    suggestedQuery: normalized || message.trim(),
    productIds: shortlist.map((product) => product.id),
  };
};

export function Storefront({
  search,
  basePath,
  titleKey,
}: {
  search: ShopSearchParams;
  basePath: "/products" | "/shop";
  titleKey: string;
}) {
  const { lang, t } = useI18n();
  const { stockOf, selectedBranch } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState(search.q ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiRecommendedIds, setAiRecommendedIds] = useState<number[]>([]);
  const [aiUsedFallback, setAiUsedFallback] = useState(false);

  useEffect(() => {
    setQuery(search.q ?? "");
  }, [search.q]);

  const category = search.cat ?? "";
  const sort = search.sort ?? "popular";
  const inStockOnly = search.inStock === "1";
  const minPrice = search.min;
  const maxPrice = search.max;

  const updateSearch = (next: Partial<ShopSearchParams>) => {
    navigate({
      to: basePath,
      search: (prev) =>
        ({
          ...prev,
          ...next,
        }) as never,
    });
  };

  const clearFilters = () => {
    setQuery("");
    setAiSummary(null);
    setAiRecommendedIds([]);
    setAiUsedFallback(false);
    navigate({
      to: basePath,
      search: {} as never,
    });
    setShowFilters(false);
  };

  const results = useMemo(() => {
    const filtered = PRODUCTS.filter((product) => {
      const searchable =
        `${product.name} ${product.category} ${product.unit} ${productDescription(product, t)}`.toLowerCase();
      if (!matchesSearch(search.q ?? "", searchable)) return false;
      if (category && product.category !== category) return false;
      if (inStockOnly && stockOf(product.id) <= 0) return false;
      if (minPrice !== undefined && product.price < minPrice) return false;
      if (maxPrice !== undefined && product.price > maxPrice) return false;
      return true;
    });

    switch (sort) {
      case "priceAsc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filtered.sort((a, b) => a.id - b.id);
        break;
    }

    return filtered;
  }, [category, inStockOnly, maxPrice, minPrice, search.q, sort, stockOf, t]);

  const resultSummary =
    minPrice !== undefined || maxPrice !== undefined
      ? t("filters.priceSummary")
          .replace("{min}", minPrice !== undefined ? formatRWF(minPrice) : t("filters.anyPrice"))
          .replace("{max}", maxPrice !== undefined ? formatRWF(maxPrice) : t("filters.anyPrice"))
      : t("filters.allPrices");

  const activePriceId =
    PRICE_OPTIONS.find((option) => option.min === minPrice && option.max === maxPrice)?.id ?? "all";
  const assistantProducts = results.slice(0, 12) as Product[];
  const aiVisualResults = useMemo(() => {
    if (!aiRecommendedIds.length) return [];
    const ids = new Set(aiRecommendedIds);
    return PRODUCTS.filter((product) => ids.has(product.id)).slice(0, 6);
  }, [aiRecommendedIds]);

  const runAiSearch = async (message: string) => {
    const candidatePool = PRODUCTS.filter((product) => stockOf(product.id) > 0).slice(0, 18) as Product[];
    const fallback = buildSearchFallback(message, selectedBranch, candidatePool);

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          language: lang,
          cart: [],
          products: candidatePool.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            unit: product.unit,
            stock: stockOf(product.id),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI search failed (${response.status})`);
      }

      const data = (await response.json()) as AssistantResponse;
      const nextQuery = data.suggestedQuery?.trim() || message;
      setAiSummary(data.answer?.trim() || fallback.answer);
      setAiRecommendedIds(
        Array.isArray(data.productIds) && data.productIds.length ? data.productIds : fallback.productIds,
      );
      setAiUsedFallback(false);
      setQuery(nextQuery);
      updateSearch({ q: nextQuery || undefined });
    } catch {
      setAiSummary(fallback.answer);
      setAiRecommendedIds(fallback.productIds);
      setAiUsedFallback(true);
      updateSearch({ q: fallback.suggestedQuery || message || undefined });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {t("ui.searchStore")}
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">{t(titleKey)}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("products.storefrontBody")}</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/dashboard">{t("nav.marketRepDashboard")}</Link>
        </Button>
      </div>

      <div className="mt-6">
        <div className="rounded-[2rem] border border-border bg-card p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Branch focus
          </div>
          <div className="mt-2 text-lg font-black">{selectedBranch}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {results.length} filtered products ready for search, cart updates, and quick pickup.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-[2rem] border border-border bg-card p-4 shadow-sm">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const nextQuery = query.trim();
            if (!nextQuery) {
              setAiSummary(null);
              setAiRecommendedIds([]);
              setAiUsedFallback(false);
              updateSearch({ q: undefined });
              return;
            }
            await runAiSearch(nextQuery);
          }}
          className="grid gap-4"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (!event.target.value.trim()) {
                    setAiSummary(null);
                    setAiRecommendedIds([]);
                    setAiUsedFallback(false);
                  }
                }}
                placeholder={t("search.placeholder")}
                className="h-12 rounded-full pl-11"
              />
            </div>
            <Button type="submit" className="h-12 rounded-full px-5 font-bold">
              {aiLoading ? t("ui.processing") : t("ui.searchButton")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full md:hidden"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t("ui.filters")}
            </Button>
          </div>

          <div className="hidden gap-3 md:flex md:flex-wrap">
            <FilterControls
              activeCategory={category}
              activePriceId={activePriceId}
              inStockOnly={inStockOnly}
              sort={sort}
              updateSearch={updateSearch}
            />
          </div>
        </form>
      </div>

      {(aiSummary || aiVisualResults.length > 0) && (
        <div className="mt-6 rounded-[2rem] border border-primary/15 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand)_6%,white),white)] p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI Visual Results
              </div>
              {aiSummary && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{aiSummary}</p>}
              {aiUsedFallback && (
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  AI fallback mode is active. Showing the closest local picture matches.
                </p>
              )}
            </div>
            {search.q && (
              <div className="text-sm font-semibold text-primary">
                {t("search.showingMatchesFor").replace("{branch}", selectedBranch)}
              </div>
            )}
          </div>

          {!!aiVisualResults.length && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {aiVisualResults.map((product) => (
                <ProductCard key={`ai-${product.id}`} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <AIAssistant
          branch={selectedBranch}
          candidates={assistantProducts.length ? assistantProducts : (PRODUCTS.slice(0, 12) as Product[])}
          onUseSuggestedQuery={(nextQuery) =>
            updateSearch({ q: nextQuery || undefined, cat: undefined, min: undefined, max: undefined })
          }
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-card/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">
            {t("products.resultsCount").replace("{count}", String(results.length))}
          </div>
          <div className="text-sm text-muted-foreground">{resultSummary}</div>
        </div>
        <Button
          variant="ghost"
          className="justify-start rounded-full px-0 text-primary hover:bg-transparent"
          onClick={clearFilters}
        >
          {t("ui.clearAll")}
        </Button>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-background/95 p-4 backdrop-blur md:hidden ${
          showFilters ? "translate-y-0" : "pointer-events-none translate-y-full"
        } transition-transform duration-300`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t("ui.filters")}</h2>
          <button type="button" onClick={() => setShowFilters(false)} aria-label={t("back")}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          <FilterControls
            activeCategory={category}
            activePriceId={activePriceId}
            inStockOnly={inStockOnly}
            sort={sort}
            updateSearch={updateSearch}
            mobile
          />
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-full" onClick={clearFilters}>
            {t("ui.clearAll")}
          </Button>
          <Button className="flex-1 rounded-full" onClick={() => setShowFilters(false)}>
            {t("ui.showResults")}
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto max-w-lg rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight">{t("products.emptyTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("products.emptyBody")}</p>
            <Button className="mt-6 rounded-full" onClick={clearFilters}>
              {t("ui.clearFiltersTryAgain")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterControls({
  activeCategory,
  activePriceId,
  inStockOnly,
  sort,
  updateSearch,
  mobile = false,
}: {
  activeCategory: string;
  activePriceId: string;
  inStockOnly: boolean;
  sort: string;
  updateSearch: (next: Partial<ShopSearchParams>) => void;
  mobile?: boolean;
}) {
  const { t } = useI18n();

  return (
    <>
      <div className="space-y-3">
        <div className="text-sm font-semibold">{t("nav.categories")}</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateSearch({ cat: undefined })}
            className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
              !activeCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {t("filter.all")}
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() =>
                updateSearch({ cat: activeCategory === category.name ? undefined : category.name })
              }
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                activeCategory === category.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {categoryLabel(category.name, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold">{t("filters.priceTitle")}</div>
        <div className="flex flex-wrap gap-2">
          {PRICE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => updateSearch({ min: option.min, max: option.max })}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                activePriceId === option.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t(`filters.price.${option.id}`)}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid gap-3 ${mobile ? "" : "md:grid-cols-[minmax(0,240px)_minmax(0,200px)]"}`}
      >
        <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => updateSearch({ inStock: event.target.checked ? "1" : undefined })}
            className="h-4 w-4 accent-primary"
          />
          {t("filter.inStock")}
        </label>

        <select
          value={sort}
          onChange={(event) => updateSearch({ sort: event.target.value })}
          className="h-12 rounded-2xl border border-input bg-background px-4 text-sm"
        >
          <option value="popular">{t("sort.popular")}</option>
          <option value="priceAsc">{t("sort.priceAsc")}</option>
          <option value="priceDesc">{t("sort.priceDesc")}</option>
          <option value="name">{t("sort.name")}</option>
        </select>
      </div>
    </>
  );
}
