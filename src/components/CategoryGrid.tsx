import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/products";
import { useI18n } from "@/lib/i18n";

export function CategoryGrid() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight">{t("section.categories")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
          >
            <div
              className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
              style={{ background: c.color }}
            />
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110"
              style={{ background: `color-mix(in oklab, ${c.color} 15%, transparent)` }}
            >
              {c.emoji}
            </div>
            <div className="text-sm font-semibold leading-tight">{c.name}</div>
            <div className="text-[11px] text-muted-foreground">{c.count} {t("section.items")}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
