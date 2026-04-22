import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, PRODUCTS, STORE, formatRWF } from "@/lib/products";
import {
  ArrowRight,
  Clock,
  Truck,
  ShieldCheck,
  ShoppingBag,
  Star,
  Search,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Simba Supermarket — Rwanda's #1 Online Supermarket in Kigali" },
      {
        name: "description",
        content:
          "Welcome to Simba Supermarket. 789+ real products across 10 categories, delivered fast in Kigali. Pay with MoMo. Verify and start shopping.",
      },
    ],
  }),
});

function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      <ShopHero />
      <CategorySection />
      <FeaturedSection />
      <TrustSection />
      <AppPromo />
    </div>
  );
}

function ShopHero() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/products", search: { q: q.trim() } as never });
  };

  return (
    <section className="relative overflow-hidden bg-primary px-4 py-16 md:py-24 text-primary-foreground">
      {/* Decorative circles */}
      {/* This video is meant as a placeholder for a more dynamic hero section. */}
      {/* If a static hero image is preferred, remove the video tag and uncomment or add an image tag. */}
      <video
        src="/amazon-fresh-hero.mp4" 
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover opacity-10"
      />
      
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold backdrop-blur-md mb-6">
            <Zap className="h-4 w-4 text-brand-yellow fill-brand-yellow" />
            <span>Fast delivery in Kigali</span>
          </div>
          
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl lg:max-w-4xl leading-[1.1]">
            Groceries delivered to your door in <span className="text-brand-yellow">minutes</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Shop over 700+ products from Simba Supermarket. Fresh produce, drinks, and daily essentials delivered across Kigali.
          </p>

          <form onSubmit={handleSearch} className="mt-10 w-full max-w-2xl relative group">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl transition-all group-focus-within:ring-4 group-focus-within:ring-brand-yellow/30">
              <Search className="ml-4 h-5 w-5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for milk, bread, fruits..."
                className="flex-1 border-0 bg-transparent text-lg text-black focus-visible:ring-0 placeholder:text-muted-foreground"
              />
              <Button type="submit" className="rounded-xl h-12 px-8 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
                Search
              </Button>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-primary-foreground/70">
              <span>Popular:</span>
              <button onClick={() => navigate({ to: "/products", search: { q: "Milk" } as never })} className="hover:text-white underline underline-offset-4 decoration-white/30">Milk</button>
              <button onClick={() => navigate({ to: "/products", search: { q: "Bread" } as never })} className="hover:text-white underline underline-offset-4 decoration-white/30">Bread</button>
              <button onClick={() => navigate({ to: "/products", search: { q: "Beer" } as never })} className="hover:text-white underline underline-offset-4 decoration-white/30">Beer</button>
              <button onClick={() => navigate({ to: "/products", search: { q: "Soap" } as never })} className="hover:text-white underline underline-offset-4 decoration-white/30">Soap</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function CategorySection() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black tracking-tight md:text-3xl">Categories</h2>
        <Link to="/products" className="group flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-xl"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-sm transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${c.color}20` }}
            >
              {c.emoji}
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{c.name}</div>
              <div className="text-[11px] font-medium text-muted-foreground">{c.count} items</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedSection() {
  const featured = PRODUCTS.slice(0, 6);
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black tracking-tight md:text-3xl">Featured Products</h2>
        <Link to="/products" className="group flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          See more <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Fast Delivery",
      desc: "Delivered in 30-90 minutes across Kigali."
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: "Real-time Tracking",
      desc: "Follow your order from store to your door."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Quality Guaranteed",
      desc: "Fresh produce handpicked by our staff."
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Best Prices",
      desc: "Same prices as in our physical stores."
    }
  ];

  return (
    <section className="bg-secondary/50 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                {it.icon}
              </div>
              <h3 className="text-lg font-bold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppPromo() {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-3xl bg-black px-8 py-12 text-white md:px-16 md:py-20">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        
        <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Shop on the go with the Simba App
            </h2>
            <p className="mt-6 text-lg text-white/70">
              Get exclusive deals, track your orders in real-time, and reorder your favorites with one tap.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <div className="h-12 w-40 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold">App Store</div>
              <div className="h-12 w-40 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold">Google Play</div>
            </div>
          </div>
          <div className="hidden lg:block relative">
             <div className="mx-auto h-[500px] w-64 rounded-[3rem] border-8 border-white/10 bg-white/5 p-4 shadow-2xl">
                <div className="h-full w-full rounded-[2.2rem] bg-zinc-900 overflow-hidden">
                  <div className="p-4 flex flex-col gap-4">
                    <div className="h-32 w-full rounded-2xl bg-primary/20" />
                    <div className="grid grid-cols-2 gap-2">
                       <div className="h-20 rounded-xl bg-white/5" />
                       <div className="h-20 rounded-xl bg-white/5" />
                       <div className="h-20 rounded-xl bg-white/5" />
                       <div className="h-20 rounded-xl bg-white/5" />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
