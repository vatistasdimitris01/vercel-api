import { GoogleGenerativeAI } from "@google/generative-ai";

// Keep provider details private. Expose only a QBIT-facing system prompt.
export const QBIT_SYSTEM_PROMPT = `You are QBIT, an AI assistant created by Dimitris Vatistas. Always respond in a helpful, professional manner.`;

export function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // Do not reveal provider to callers—only throw internally.
    throw new Error("Missing API key");
  }
  const genAI = new GoogleGenerativeAI(key);
  return { genAI };
}