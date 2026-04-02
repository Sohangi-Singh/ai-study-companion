import axios from "axios";

export const generateAI = async (prompt, opts = {}) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key not found. Check your .env file.");

  // If quiz mode, force prompt to request strict JSON output
  let sendPrompt = prompt;
  if (opts.mode === "quiz") {
    sendPrompt =
      `Generate exactly 5 multiple choice questions with 4 options each for the topic: "${opts.topic || ""}". ` +
      "Return ONLY a valid JSON array in this format (no explanation, no markdown, no extra text):\n" +
      `[
        {
          "question": "...",
          "options": ["...", "...", "...", "..."],
          "answer": 1 // index of correct option (0-3)
        },
        ...
      ]\n` +
      "All questions must have exactly 4 options. The answer field must be the index (0-3) of the correct option. Do not include any explanation or text outside the JSON.";
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ role: "user", parts: [{ text: sendPrompt }] }]
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};