import axios from "axios";

const API_BASE = "https://generativelanguage.googleapis.com";

const pickModel = () => {
  return "gemini-2.5-flash-lite"; // fallback server will redirect if unavailable
};

export async function callGeminiJSON({ contents, apiKey, model }) {
  const key =
    apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY missing");
  const m = model || pickModel();
  const url = `${API_BASE}/v1beta/models/${m}:generateContent?key=${encodeURIComponent(
    key
  )}`;
  const body = {
    contents,
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      topK: 32,
      responseMimeType: "application/json",
    },
  };
  const { data } = await axios.post(url, body, {
    headers: { "Content-Type": "application/json" },
  });
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return text;
}
