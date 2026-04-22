import data from "@/data/simba_products.json";

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId: number;
  inStock: boolean;
  image: string;
  unit: string;
};

export const STORE = data.store as {
  name: string;
  tagline: string;
  location: string;
  currency: string;
};

export const PRODUCTS: Product[] = data.products as Product[];

const CATEGORY_META: Record<string, { slug: string; emoji: string; color: string }> = {
  "Alcoholic Drinks": { slug: "alcoholic-drinks", emoji: "🍷", color: "oklch(0.55 0.22 15)" },
  "Cosmetics & Personal Care": { slug: "cosmetics", emoji: "💄", color: "oklch(0.7 0.18 350)" },
  "General": { slug: "general", emoji: "🛒", color: "oklch(0.6 0.18 250)" },
  "Food Products": { slug: "food", emoji: "🍎", color: "oklch(0.65 0.2 60)" },
  "Kitchenware & Electronics": { slug: "kitchenware", emoji: "🍳", color: "oklch(0.6 0.18 200)" },
  "Cleaning & Sanitary": { slug: "cleaning", emoji: "🧴", color: "oklch(0.65 0.18 180)" },
  "Baby Products": { slug: "baby", emoji: "🧸", color: "oklch(0.7 0.18 30)" },
  "Pet Care": { slug: "pet", emoji: "🐾", color: "oklch(0.6 0.18 100)" },
  "Kitchen Storage": { slug: "storage", emoji: "📦", color: "oklch(0.55 0.15 270)" },
  "Sports & Wellness": { slug: "sports", emoji: "⚽", color: "oklch(0.6 0.2 140)" },
};

export type CategoryInfo = {
  name: string;
  slug: string;
  emoji: string;
  color: string;
  count: number;
};

export const CATEGORIES: CategoryInfo[] = Object.entries(
  PRODUCTS.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {}),
).map(([name, count]) => ({
  name,
  count,
  slug: CATEGORY_META[name]?.slug ?? name.toLowerCase().replace(/\s+/g, "-"),
  emoji: CATEGORY_META[name]?.emoji ?? "🛍️",
  color: CATEGORY_META[name]?.color ?? "oklch(0.5 0.2 295)",
}));

export const categoryBySlug = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const productsByCategorySlug = (slug: string) => {
  const cat = categoryBySlug(slug);
  if (!cat) return [];
  return PRODUCTS.filter((p) => p.category === cat.name);
};

export const productById = (id: number) => PRODUCTS.find((p) => p.id === id);

export const formatRWF = (n: number) =>
  new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(n);

export const searchProducts = (q: string) => {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term),
  ).slice(0, 50);
};
