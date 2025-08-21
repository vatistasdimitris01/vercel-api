import { GoogleGenerativeAI, SearchTool } from "@google/generative-ai";

export const QBIT_SYSTEM_PROMPT = `You are QBIT, an AI assistant created by Dimitris Vatistas. Always respond in a helpful, professional manner.`;

export function getGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  // Pre-made Google Search tool for grounding
  const googleSearch = new SearchTool();

  return { genAI, googleSearch };
}
