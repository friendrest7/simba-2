import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS, searchProducts } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";

type Search = { q?: string; cat?: string; sort?: string; inStock?: string };

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    inStock: typeof s.inStock === "string" ? s.inStock : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Products — Simba Supermarket" },
      { name: "description", content: "Search and filter 789+ products at Simba Supermarket Rwanda." },
    ],
  }),
});

function ProductsPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const cat = search.cat ?? "";
  const sort = search.sort ?? "popular";
  const inStockOnly = search.inStock === "1";

  const [showFilters, setShowFilters] = useState(false);

  const updateSearch = (next: Partial<Search>) => {
    navigate({ search: (prev) => ({ ...prev, ...next }) as never });
  };

  const results = useMemo(() => {
    let list = q.trim() ? searchProducts(q) : [...PRODUCTS];
    if (cat) list = list.filter((p) => p.category === cat);
    if (inStockOnly) list = list.filter((p) => p.inStock);
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
      case "popular":
      default:
        // Default sorting or use a 'popular' logic if available
        break;
    }
    return list;
  }, [q, cat, sort, inStockOnly]);

  const clearFilters = () => {
    setQ("");
    updateSearch({ q: undefined, cat: undefined, inStock: undefined });
    setShowFilters(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">{t("section.allProducts")}</h1>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 z-30 bg-background/90 backdrop-blur py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              updateSearch({ q: e.target.value || undefined });
            }}
            placeholder={t("search.placeholder")}
            className="h-12 rounded-full border-input bg-muted/50 pl-10 text-base focus-visible:ring-primary/50"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center justify-center gap-2 h-12 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-5 transition-colors"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="font-semibold">Filters</span>
        </button>

        <div className="hidden md:flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateSearch({ sort: e.target.value })}
            className="h-12 rounded-full border border-input bg-background px-4 text-base font-medium text-foreground shadow-sm focus:ring-primary/50 focus:border-primary/50"
          >
            <option value="popular">Sort by Popular</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filters Mobile View */}
      <div
        className={`fixed inset-0 z-50 bg-background/95 backdrop-blur transition-transform duration-300 ease-in-out md:hidden ${showFilters ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={() => setShowFilters(false)} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateSearch({ cat: undefined })}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${!cat ? "gradient-brand text-brand-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => updateSearch({ cat: cat === c.name ? undefined : c.name })}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${cat === c.name ? "gradient-brand text-brand-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Sort By</h3>
            <select
              value={sort}
              onChange={(e) => updateSearch({ sort: e.target.value })}
              className="h-11 rounded-xl border border-input bg-background px-4 text-base font-medium text-foreground shadow-sm w-full focus:ring-primary/50 focus:border-primary/50"
            >
              <option value="popular">Popular</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>

          <div className="mb-6">
             <label className="flex items-center gap-3 rounded-xl border border-input bg-background p-4 text-base font-medium text-foreground shadow-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateSearch({ inStock: e.target.checked ? "1" : undefined })}
                  className="h-5 w-5 accent-primary rounded border-input"
                />
                In Stock Only
              </label>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 border-t">
          <Button onClick={clearFilters} variant="outline" className="w-1/2 rounded-full h-12 mr-2">Clear All</Button>
          <Button onClick={() => setShowFilters(false)} className="w-1/2 rounded-full h-12 gradient-brand text-brand-foreground">Show Results</Button>
        </div>
      </div>

      {/* Product Grid */}
      {results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
          <Link to="/products" className="mt-4 inline-block text-primary font-semibold hover:underline">
            Clear all filters and try again
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
