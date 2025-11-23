import OpenAi from "openai";

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEYm,
  timeout: 30000,
  maxRetries: 2,
  baseURL: "https://api.openai.com/v1",
});

const aiCache = new Map<string, any>();
const CACHE_TTL = 60 * 60 * 1000;
const MAX_CACHE_SIZE = 1000;

setInterval(() => {
  if (aiCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(aiCache.entries());
    const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    toDelete.forEach(([key]) => aiCache.delete(key));
  }
}, 5 * 60 * 1000);

export async function analyzeEmail(email: {
  subject: string;
  snippet: string;
  body?: string;
  attachments?: Array<{ filename: string; mimeType: string; size: number }>;
}) {
  const cacheKey = `${email.subject}: ${email.snippet}`.substring(0, 100);

  if (aiCache.has(cacheKey)) {
    const cached = aiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    aiCache.delete(cacheKey);
  }

  const truncatedBody = email.body
    ? email.body.length > 5000
      ? email.body.substr(0, 5000) + "..."
      : email.body
    : "No body text provided";

  const attachmentInfo =
    email.attachments && email.attachments.length > 0
      ? `\n\nATTACHMENTS (${email.attachments.length}):\n` +
        email.attachments
          .map(
            (a) =>
              `-${a.filename} (${a.mimeType}, ${(a.size / 1024).toFixed(1)} KB)`
          )
          .join("\n")
      : "";
}
