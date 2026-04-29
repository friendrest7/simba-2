import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, MapPin, ShieldCheck, ShoppingBasket } from "lucide-react";
import { PICKUP_BRANCHES } from "@/lib/demo-store";
import { getBranchMapUrl } from "@/lib/branchLocations";
import { getStoredLang, translate, useI18n } from "@/lib/i18n";
import type { ReactNode } from "react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({ meta: [{ title: translate(getStoredLang(), "meta.aboutTitle") }] }),
});

function AboutPage() {
  const { t } = useI18n();

  const openBranchMap = (branch: (typeof PICKUP_BRANCHES)[number]) => {
    if (window.confirm(`${t("about.openMapConfirm")} ${branch}?`)) {
      window.open(getBranchMapUrl(branch), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-[linear-gradient(145deg,hsl(var(--primary)),hsl(var(--primary)/0.82))] p-8 text-primary-foreground sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-foreground/75">
              {t("about.eyebrow")}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {t("about.title")}
            </h1>
            <p className="mt-4 text-base font-semibold text-primary-foreground/92">
              {t("about.subtitle")}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-primary-foreground/82">
              {t("about.body")}
            </p>
          </div>
          <div className="grid content-center gap-4 bg-background p-8 sm:p-10">
            <InfoCard
              icon={<ShoppingBasket className="h-5 w-5" />}
              title={t("about.card.clientTitle")}
              body={t("about.card.clientBody")}
            />
            <InfoCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title={t("about.card.adminTitle")}
              body={t("about.card.adminBody")}
            />
            <InfoCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              title={t("about.card.flowTitle")}
              body={t("about.card.flowBody")}
            />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              {t("about.mapsEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">{t("about.mapsTitle")}</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{t("about.mapsBody")}</p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PICKUP_BRANCHES.map((branch) => (
            <button
              key={branch}
              type="button"
              onClick={() => openBranchMap(branch)}
              className="group rounded-2xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
            >
              <span className="flex items-center gap-2 text-sm font-black text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {branch}
              </span>
              <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground group-hover:text-primary">
                {t("about.openInMaps")}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="font-black text-foreground">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
