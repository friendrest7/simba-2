import { formatRWF } from "@/lib/products";
import type { ConversationalSearchResult } from "@/lib/demo-store";

export function formatSearchExplanation(
  result: ConversationalSearchResult,
  t: (key: string) => string,
) {
  const { explanationParts } = result;
  const parts = [t("search.showingMatchesFor").replace("{branch}", explanationParts.branch)];

  if (explanationParts.category) {
    parts.push(explanationParts.category);
  }

  if (explanationParts.maxPrice !== undefined) {
    parts.push(t("search.underPrice").replace("{price}", formatRWF(explanationParts.maxPrice)));
  }

  if (explanationParts.inStockOnly) {
    parts.push(t("search.currentlyInStock"));
  }

  if (explanationParts.terms.length) {
    parts.push(t("search.matchingTerms").replace("{terms}", explanationParts.terms.join(" ")));
  }

  return `${parts.join(" · ")}.`;
}
