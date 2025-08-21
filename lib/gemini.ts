import { GoogleGenerativeAI } from "@google/generative-ai";

export const QBIT_SYSTEM_PROMPT = `You are QBIT, an AI assistant created by Dimitris Vatistas. Always respond in a helpful, professional manner.`;

export function getGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return { genAI };
}
