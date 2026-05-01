import { useMemo, useState, type FormEvent } from "react";
import { Bot, MessageCircleMore, SendHorizonal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n, type Lang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { formatRWF, type Product } from "@/lib/products";
import type { BranchName } from "@/lib/demo-store";

type AssistantResponse = {
  answer: string;
  suggestedQuery: string;
  productIds: number[];
};

type ChatMessage = {
  role: "user" | "assistant";
  body: string;
  suggestedQuery?: string;
  productIds?: number[];
  fallback?: boolean;
};

type AssistantProps = {
  branch: BranchName;
  candidates: Product[];
  onUseSuggestedQuery: (query: string) => void;
};

const COPY: Record<
  Lang,
  {
    opener: string;
    subcopy: string;
    placeholder: string;
    send: string;
    helper: string;
    fallback: string;
    suggestionsTitle: string;
    apply: string;
  }
> = {
  en: {
    opener: "Ask Simba AI",
    subcopy: "Find products, cheaper swaps, and cart ideas.",
    placeholder: "Need breakfast under 10,000 RWF? Ask here.",
    send: "Send",
    helper: "Shopping assistant",
    fallback: "Groq is unavailable, showing local suggestions instead.",
    suggestionsTitle: "Suggested picks",
    apply: "Show these results",
  },
  rw: {
    opener: "Baza Simba AI",
    subcopy: "Shaka ibicuruzwa, ibisimbura bihendutse, n'ibitekerezo byo ku gakapuu.",
    placeholder: "Ukeneye ifunguro rya mu gitondo munsi ya 10,000 RWF? Baza hano.",
    send: "Ohereza",
    helper: "Umufasha w'ubuguzi",
    fallback: "Groq ntiyabonetse, twerekanye ibisubizo byo hafi.",
    suggestionsTitle: "Ibyatoranyijwe",
    apply: "Reba ibisubizo",
  },
  fr: {
    opener: "Demander Simba AI",
    subcopy: "Trouvez des produits, des options moins cheres et des idees de panier.",
    placeholder: "Besoin d'un petit-dejeuner sous 10 000 RWF ? Demandez ici.",
    send: "Envoyer",
    helper: "Assistant shopping",
    fallback: "Groq est indisponible, suggestions locales affichees.",
    suggestionsTitle: "Selections proposees",
    apply: "Voir ces resultats",
  },
  sw: {
    opener: "Uliza Simba AI",
    subcopy: "Pata bidhaa, mbadala nafuu, na mawazo ya kujaza cart.",
    placeholder: "Unahitaji kifungua kinywa chini ya RWF 10,000? Uliza hapa.",
    send: "Tuma",
    helper: "Msaidizi wa ununuzi",
    fallback: "Groq haipatikani, tunaonyesha mapendekezo ya ndani.",
    suggestionsTitle: "Mapendekezo",
    apply: "Onesha matokeo",
  },
  tr: {
    opener: "Simba AI'ya Sor",
    subcopy: "Urun bul, daha ucuz alternatifleri gor ve sepet kur.",
    placeholder: "10.000 RWF altinda kahvaltilik mi gerekiyor? Buraya yaz.",
    send: "Gonder",
    helper: "Alisveris asistani",
    fallback: "Groq kullanilamiyor, yerel oneriler gosteriliyor.",
    suggestionsTitle: "Onerilen urunler",
    apply: "Sonuclari goster",
  },
};

function buildLocalFallback(message: string, branch: BranchName, candidates: Product[]) {
  const normalized = message.trim().toLowerCase();
  const shortlist = candidates.slice(0, 4);
  const cheapest = [...candidates].sort((a, b) => a.price - b.price).slice(0, 3);

  if (!normalized) {
    return {
      answer: `Tell me what you need for ${branch} and I will narrow the catalog.`,
      suggestedQuery: branch,
      productIds: shortlist.map((product) => product.id),
    };
  }

  const cheaperHint = cheapest.length
    ? ` Cheaper options include ${cheapest.map((product) => product.name).join(", ")}.`
    : "";

  return {
    answer: shortlist.length
      ? `For ${branch}, start with ${shortlist.map((product) => product.name).join(", ")}.${cheaperHint}`
      : `I could not find a strong branch match for ${branch}. Try a brand, category, or budget. ${cheaperHint}`.trim(),
    suggestedQuery: normalized,
    productIds: shortlist.map((product) => product.id),
  };
}

export function AIAssistant({ branch, candidates, onUseSuggestedQuery }: AssistantProps) {
  const { lang, t } = useI18n();
  const { items, add, stockOf } = useCart();
  const copy = COPY[lang];
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const suggestedProducts = useMemo(() => {
    const ids = new Set(latestAssistant?.productIds ?? []);
    if (!ids.size) return candidates.slice(0, 3);
    return candidates.filter((product) => ids.has(product.id)).slice(0, 4);
  }, [candidates, latestAssistant?.productIds]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = prompt.trim();
    if (!message || loading) return;

    const fallback = buildLocalFallback(message, branch, candidates);
    setMessages((current) => [...current, { role: "user", body: message }]);
    setPrompt("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          language: lang,
          cart: items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            qty: item.qty,
            price: item.product.price,
            category: item.product.category,
          })),
          products: candidates.slice(0, 18).map((product) => ({
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
        throw new Error(`AI assistant request failed (${response.status})`);
      }

      const data = (await response.json()) as AssistantResponse;
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          body: data.answer || fallback.answer,
          suggestedQuery: data.suggestedQuery || fallback.suggestedQuery,
          productIds: Array.isArray(data.productIds) ? data.productIds : fallback.productIds,
        },
      ]);
    } catch (requestError) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          body: fallback.answer,
          suggestedQuery: fallback.suggestedQuery,
          productIds: fallback.productIds,
          fallback: true,
        },
      ]);
      setError(requestError instanceof Error ? requestError.message : copy.fallback);
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        <Button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="h-[3.25rem] rounded-full bg-primary px-5 text-sm font-black text-primary-foreground shadow-[0_18px_45px_rgba(116,39,9,0.3)] hover:bg-primary/92"
        >
          <MessageCircleMore className="mr-2 h-4 w-4" />
          {copy.opener}
        </Button>
      </div>

      {open && (
        <section className="fixed bottom-[5.5rem] right-4 z-40 w-[min(92vw,26rem)] rounded-[2rem] border border-primary/12 bg-card shadow-[0_25px_70px_rgba(33,12,4,0.22)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                <Bot className="h-3.5 w-3.5" />
                {copy.helper}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{copy.subcopy}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border p-2 text-muted-foreground transition hover:text-foreground"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[24rem] space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="rounded-[1.4rem] border border-dashed border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
                {t("products.aiBody")}
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-10 bg-primary text-primary-foreground"
                    : "mr-6 border border-border bg-secondary/55 text-foreground"
                }`}
              >
                <div>{message.body}</div>
                {message.fallback && (
                  <div className="mt-2 text-xs font-semibold text-muted-foreground">
                    {copy.fallback}
                  </div>
                )}
                {message.suggestedQuery && message.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => onUseSuggestedQuery(message.suggestedQuery!)}
                    className="mt-3 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    {copy.apply}
                  </button>
                )}
              </div>
            ))}

            {!!suggestedProducts.length && latestAssistant && (
              <div className="rounded-[1.4rem] border border-border bg-background p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {copy.suggestionsTitle}
                </div>
                <div className="mt-3 grid gap-2">
                  {suggestedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-card px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.category} | {formatRWF(product.price)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full px-3"
                        onClick={() => void add(product)}
                        disabled={stockOf(product.id) <= 0}
                      >
                        {t("card.add")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form className="border-t border-border px-5 py-4" onSubmit={submit}>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={copy.placeholder}
              rows={3}
              className="min-h-[88px] rounded-[1.25rem] border-border bg-background px-4 py-3 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/35"
            />
            {error && <div className="mt-2 text-xs text-muted-foreground">{error}</div>}
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">{branch}</div>
              <Button type="submit" className="rounded-full px-5 font-bold" disabled={loading}>
                {loading ? t("ui.processing") : copy.send}
                <SendHorizonal className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
