import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: "https://models.inference.ai.azure.com",
});
