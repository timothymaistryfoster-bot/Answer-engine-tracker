export type ProviderName = "openai" | "gemini";

export interface GenerationRequest {
  prompt: string;
  model?: string;
}

export interface GenerationResponse {
  provider: ProviderName;
  model: string;
  text: string;
}
