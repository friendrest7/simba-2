type GrokCandidate = {
  id: number;
  name: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
};

type GrokRequest = {
  query?: string;
  branch?: string;
  locale?: string;
  candidates?: GrokCandidate[];
};

type GrokResponse = {
  answer: string;
  suggestedQuery: string;
  productIds: number[];
};

function extractJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed) as Partial<GrokResponse>;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Partial<GrokResponse>;
    } catch {
      return null;
    }
  }
}

function buildPrompt(body: Required<Pick<GrokRequest, "query" | "branch" | "locale">> & {
  candidates: GrokCandidate[];
}) {
  const catalog = body.candidates.length
    ? body.candidates
        .map(
          (product) =>
            `- ${product.id}: ${product.name} | ${product.category} | ${product.unit} | stock ${product.stock} | ${product.price} RWF`,
        )
        .join("\n")
    : "- No local product matches were found.";

  return [
    {
      role: "system",
      content:
        "You are Simba's grocery shopping assistant. Help shoppers pick items from the provided catalog only. Reply in the same language as the user. Be concise, practical, and friendly. Return JSON only with this schema: {\"answer\": string, \"suggestedQuery\": string, \"productIds\": number[]}.",
    },
    {
      role: "user",
      content: [
        `Branch: ${body.branch}`,
        `Locale: ${body.locale}`,
        `User request: ${body.query}`,
        "Available products:",
        catalog,
        "Rules: choose only from available products when possible. If the catalog is too weak, suggest a better search query and explain briefly what to change.",
      ].join("\n"),
    },
  ] as const;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "XAI_API_KEY is not configured" });
  }

  let body: GrokRequest;
  try {
    body = ((typeof req.body === "string" ? JSON.parse(req.body) : req.body) ?? {}) as GrokRequest;
  } catch {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const query = body.query?.trim();
  const branch = body.branch?.trim();
  const locale = body.locale?.trim() || "en";
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 12) : [];

  if (!query || !branch) {
    return res.status(400).json({ error: "Missing query or branch" });
  }

  try {
    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4.20",
        input: buildPrompt({ query, branch, locale, candidates }),
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      return res.status(502).json({
        error: `xAI request failed with ${response.status}`,
        details,
      });
    }

    const payload = (await response.json()) as { output_text?: string };
    const parsed = extractJson(payload.output_text ?? "");

    const result: GrokResponse = {
      answer:
        parsed?.answer?.trim() ||
        payload.output_text?.trim() ||
        "I could not generate a response right now.",
      suggestedQuery: parsed?.suggestedQuery?.trim() || query,
      productIds: Array.isArray(parsed?.productIds)
        ? parsed.productIds.filter((id): id is number => Number.isFinite(id))
        : [],
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected Grok error",
    });
  }
}
