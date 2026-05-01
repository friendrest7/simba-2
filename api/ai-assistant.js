import { handleAssistantPayload } from "../server/ai-assistant.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const result = await handleAssistantPayload(body, process.env.GROQ_API_KEY);
  return res.status(result.status).json(result.body);
}
