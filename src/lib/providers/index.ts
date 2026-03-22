import { generateWithGemini } from "./gemini";
import { generateWithOpenAI } from "./openai";
import { GenerationResponse, ProviderName } from "./types";

export async function generateText(
  prompt: string,
  requestedProvider?: ProviderName,
  requestedModel?: string
): Promise<GenerationResponse> {
  const provider = requestedProvider || pickDefaultProvider();

  if (provider === "gemini") {
    return generateWithGemini({ prompt, model: requestedModel });
  }

  return generateWithOpenAI({ prompt, model: requestedModel });
}

function pickDefaultProvider(): ProviderName {
  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }

  throw new Error("No provider is configured. Add OPENAI_API_KEY or GEMINI_API_KEY.");
}
