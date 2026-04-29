import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { formatRWF, type Product } from "@/lib/products";
import type { BranchName } from "@/lib/demo-store";

type GrokAssistantResponse = {
  answer: string;
  suggestedQuery: string;
  productIds: number[];
};

type GrokAssistantProps = {
  branch: BranchName;
  candidates: Product[];
  onUseSuggestedQuery: (query: string) => void;
};

function localAssist(query: string, branch: BranchName, candidates: Product[]) {
  const normalized = query.trim().toLowerCase();
  const selected = candidates.slice(0, 3);
  const suggestedQuery = normalized || branch;

  if (!normalized) {
    return {
      answer: `Tell me what you need and I will narrow it down for ${branch}.`,
      suggestedQuery,
      productIds: selected.map((product) => product.id),
    };
  }

  return {
    answer: selected.length
      ? `I found a short list for ${branch}: ${selected.map((product) => product.name).join(", ")}.`
      : `I could not find a strong match in ${branch}. Try adding a brand, budget, or category.`,
    suggestedQuery,
    productIds: selected.map((product) => product.id),
  };
}

export function GrokAssistant({ branch, candidates, onUseSuggestedQuery }: GrokAssistantProps) {
  const { t, lang } = useI18n();
  const { stockOf } = useCart();
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<GrokAssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const preview = useMemo(() => candidates.slice(0, 3), [candidates]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = prompt.trim();
    if (!query) return;

    setLoading(true);
    setUsingLocalFallback(false);

    const fallback = localAssist(query, branch, candidates);

    try {
      const response = await fetch("/api/grok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          branch,
          locale: lang,
          candidates: candidates.slice(0, 12).map((product) => ({
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
        throw new Error(`Grok request failed (${response.status})`);
      }

      const data = (await response.json()) as GrokAssistantResponse;
      setAnswer({
        answer: data.answer || fallback.answer,
        suggestedQuery: data.suggestedQuery || fallback.suggestedQuery,
        productIds: Array.isArray(data.productIds) ? data.productIds : fallback.productIds,
      });
      setUsingLocalFallback(false);
    } catch {
      setAnswer(fallback);
      setUsingLocalFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const visibleProducts = useMemo(() => {
    const ids = new Set(answer?.productIds ?? []);
    if (!ids.size) return preview;
    return candidates.filter((product) => ids.has(product.id)).slice(0, 3);
  }, [answer?.productIds, candidates, preview]);

  return (
    <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            <Bot className="h-3.5 w-3.5" />
            Grok AI
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight">{t("products.aiTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("products.aiBody")}</p>
        </div>

        <form className="w-full max-w-xl" onSubmit={submit}>
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={t("landing.placeholder")}
            rows={3}
            className="min-h-[92px] rounded-[1.25rem] border-border bg-background px-4 py-3 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="submit" className="rounded-full px-5 font-bold" disabled={loading}>
              {loading ? t("ui.processing") : t("ui.searchButton")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5"
              onClick={() => onUseSuggestedQuery(answer?.suggestedQuery || prompt.trim())}
              disabled={!answer?.suggestedQuery}
            >
              {t("ui.showResults")}
            </Button>
            {usingLocalFallback && (
              <span className="text-xs font-medium text-muted-foreground">
                Grok is unavailable, showing a local fallback.
              </span>
            )}
          </div>
        </form>
      </div>

      {answer && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.5rem] border border-border bg-background p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Grok</div>
            <p className="mt-2 text-sm leading-6 text-foreground">{answer.answer}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {answer.suggestedQuery && (
                <button
                  type="button"
                  onClick={() => onUseSuggestedQuery(answer.suggestedQuery)}
                  className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                >
                  {answer.suggestedQuery}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested items
            </div>
            <div className="mt-3 grid gap-2">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-card px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.category}</div>
                  </div>
                  <div className="ml-3 text-right text-xs font-bold text-primary">
                    {formatRWF(product.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
