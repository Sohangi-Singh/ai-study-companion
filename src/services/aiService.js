import axios from "axios";

const DEFAULT_MODEL = "gemini-2.5-flash";
const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

const getApiKey = () =>
  (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY || "").trim();

const getModels = () => {
  const configured = (import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL).trim();
  return [...new Set([configured, ...FALLBACK_MODELS].filter(Boolean))];
};

const getGeminiMessage = (error) =>
  error?.response?.data?.error?.message || error?.message || "Gemini request failed.";

const isModelError = (error) => {
  const status = error?.response?.status;
  const message = getGeminiMessage(error).toLowerCase();
  return status === 404 || message.includes("not found") || message.includes("not supported");
};

const formatAIError = (error) => {
  const status = error?.response?.status;
  const message = getGeminiMessage(error);

  if (status === 400 && /api key/i.test(message)) {
    return "Gemini API key is missing or malformed. Check VITE_GEMINI_API_KEY in .env.";
  }

  if (status === 401 || status === 403) {
    return "Gemini API key was rejected. Create or enable a valid Google AI Studio key, check API restrictions, then restart the dev server.";
  }

  if (status === 429) {
    return "Gemini quota or rate limit was reached. Try again later or use another valid API key.";
  }

  if (isModelError(error)) {
    return "The configured Gemini model is unavailable for this API key. Set VITE_GEMINI_MODEL to a supported model.";
  }

  if (error?.code === "ECONNABORTED") {
    return "Gemini took too long to respond. Please try again.";
  }

  return message;
};

export const generateAI = async (prompt, opts = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found. Add VITE_GEMINI_API_KEY to .env and restart the dev server.");

  // If quiz mode, force prompt to request strict JSON output
  let sendPrompt = prompt;
  if (opts.mode === "quiz") {
    sendPrompt =
      `Generate exactly 5 multiple choice questions with 4 options each for the topic: "${opts.topic || ""}". ` +
      "Return ONLY a valid JSON array in this format (no explanation, no markdown, no extra text):\n" +
      `[
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": 0
        }
      ]\n` +
      "All questions must have exactly 4 options. The answer field must be the index (0-3) of the correct option. Do not include any explanation or text outside the JSON.";
  }

  let lastError;
  for (const model of getModels()) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          contents: [{ role: "user", parts: [{ text: sendPrompt }] }],
          generationConfig: {
            temperature: opts.mode === "quiz" ? 0.35 : 0.7,
            ...(opts.mode === "quiz" ? { responseMimeType: "application/json" } : {}),
          },
        },
        { timeout: 30000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini returned an empty response. Please try again.");
      return text;
    } catch (error) {
      lastError = error;
      if (isModelError(error)) continue;
      throw new Error(formatAIError(error));
    }
  }

  throw new Error(formatAIError(lastError));
};
