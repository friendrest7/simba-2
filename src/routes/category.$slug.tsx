import { createFileRoute, Link, notFound, useSearch } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { categoryBySlug, productsByCategorySlug } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  loader: ({ params }) => {
    const cat = categoryBySlug(params.slug);
    if (!cat) throw notFound();
    return { cat, products: productsByCategorySlug(params.slug) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.cat.name ?? "Category"} — Simba Supermarket` },
      {
        name: "description",
        content: `Shop ${loaderData?.cat.name ?? "products"} at Simba Supermarket Rwanda. Fast delivery in Kigali.`,
      },
    ],
  }),
  notFoundComponent: () => <CategoryNotFound />,
});

function CategoryNotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">{t("category.notFound")}</h1>
      <Link to="/" className="mt-4 inline-block text-primary font-semibold">{t("back.home")}</Link>
    </div>
  );
}

function CategoryPage() {
  const { cat, products: allProducts } = Route.useLoaderData();
  const { t } = useI18n();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!q) return allProducts;
    const term = q.trim().toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }, [q, allProducts]);

  const updateSearch = (newQuery: string) => {
    setQ(newQuery);
    // In a real app, you'd update route search params here, e.g., navigate({ search: { q: newQuery } })
  };

  const clearFilters = () => {
    setQ("");
    setShowFilters(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
        <ChevronLeft className="h-4 w-4" /> Back to all Categories
      </Link>

      <div
        className="relative mb-8 overflow-hidden rounded-3xl border border-border p-8 md:p-12 shadow-sm"
        style={{ background: `linear-gradient(135deg, color-mix(in oklab, ${cat.color} 22%, var(--card)), var(--card))` }}
      >
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: cat.color }} />
        <div className="text-6xl">{cat.emoji}</div>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{cat.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{allProducts.length} items</p>
      </div>

      {/* Search and Filter Bar for Category Page */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 z-30 bg-background/90 backdrop-blur py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search within this category..."
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
            <h3 className="text-lg font-semibold mb-3">Sort By</h3>
            <select
              className="h-11 rounded-xl border border-input bg-background px-4 text-base font-medium text-foreground shadow-sm w-full focus:ring-primary/50 focus:border-primary/50"
            >
              <option value="popular">Popular</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 border-t">
          <Button onClick={clearFilters} variant="outline" className="w-1/2 rounded-full h-12 mr-2">Clear All</Button>
          <Button onClick={() => setShowFilters(false)} className="w-1/2 rounded-full h-12 gradient-brand text-brand-foreground">Show Results</Button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No products found in this category.</p>
          <Link to="/products" className="mt-4 inline-block text-primary font-semibold hover:underline">
            Clear search and try again
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
