import { GenerationRequest, GenerationResponse } from "./types";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export async function generateWithGemini({
  prompt,
  model = DEFAULT_MODEL
}: GenerationRequest): Promise<GenerationResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned an empty response.");
  }

  return {
    provider: "gemini",
    model,
    text
  };
}
