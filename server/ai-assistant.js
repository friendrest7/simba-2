const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function safeArray(value, limit) {
  return Array.isArray(value) ? value.slice(0, limit) : [];
}

function extractJson(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildPrompt({ message, language, cart, products }) {
  const cartSummary = cart.length
    ? cart
        .map((item) => `- ${item.name} x${item.qty} | ${item.category} | ${item.price} RWF`)
        .join("\n")
    : "- Cart is currently empty.";

  const productSummary = products.length
    ? products
        .map(
          (product) =>
            `- ${product.id}: ${product.name} | ${product.category} | ${product.unit} | stock ${product.stock} | ${product.price} RWF`,
        )
        .join("\n")
    : "- No products available.";

  return [
    {
      role: "system",
      content:
        "You are Simba Supermarket's shopping assistant. Help customers find products, suggest cheaper alternatives when possible, explain categories, and recommend small cart-building bundles. Reply in the requested language when possible. Return valid JSON only with this schema: {\"answer\": string, \"suggestedQuery\": string, \"productIds\": number[]}. Keep the answer concise and grounded in the provided products only.",
    },
    {
      role: "user",
      content: [
        `Language: ${language}`,
        `Customer request: ${message}`,
        "Current cart:",
        cartSummary,
        "Available products:",
        productSummary,
        "Rules:",
        "- Use only provided products.",
        "- If cheaper alternatives exist, mention them.",
        "- If the user is vague, suggest a clearer search query.",
        "- Include productIds only for items you actually recommend.",
      ].join("\n"),
    },
  ];
}

export async function handleAssistantPayload(body, apiKey, fetchImpl = fetch) {
  if (!apiKey) {
    return {
      status: 500,
      body: { error: "GROQ_API_KEY is not configured" },
    };
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const language = typeof body?.language === "string" ? body.language.trim() : "en";
  const cart = safeArray(body?.cart, 20);
  const products = safeArray(body?.products, 24);

  if (!message) {
    return {
      status: 400,
      body: { error: "Missing message" },
    };
  }

  try {
    const response = await fetchImpl(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.35,
        max_completion_tokens: 700,
        response_format: { type: "json_object" },
        messages: buildPrompt({ message, language, cart, products }),
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      return {
        status: 502,
        body: {
          error: `Groq request failed with ${response.status}`,
          details,
        },
      };
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);

    return {
      status: 200,
      body: {
        answer:
          typeof parsed?.answer === "string" && parsed.answer.trim()
            ? parsed.answer.trim()
            : "I found a few options for your shopping request.",
        suggestedQuery:
          typeof parsed?.suggestedQuery === "string" && parsed.suggestedQuery.trim()
            ? parsed.suggestedQuery.trim()
            : message,
        productIds: Array.isArray(parsed?.productIds)
          ? parsed.productIds.filter((value) => Number.isFinite(value))
          : [],
      },
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: error instanceof Error ? error.message : "Unexpected Groq assistant error",
      },
    };
  }
}
