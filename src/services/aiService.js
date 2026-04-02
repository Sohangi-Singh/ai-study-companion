import axios from "axios";

export const generateAI = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) throw new Error("API key not found. Check your .env file.");

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};