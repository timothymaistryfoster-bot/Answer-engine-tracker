import { GenerationRequest, GenerationResponse } from "./types";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

export async function generateWithOpenAI({
  prompt,
  model = DEFAULT_MODEL
}: GenerationRequest): Promise<GenerationResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: prompt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data.output_text;

  if (!text || typeof text !== "string") {
    throw new Error("OpenAI returned an empty response.");
  }

  return {
    provider: "openai",
    model,
    text
  };
}
