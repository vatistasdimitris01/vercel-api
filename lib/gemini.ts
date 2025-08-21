// lib/gemini.ts
import { GoogleGenerativeAI, GoogleAIFileManager } from "@google/generative-ai";

export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);

  return { genAI, fileManager };
}

// Default system prompt for QBIT
export const QBIT_SYSTEM_PROMPT = process.env.QBIT_SYSTEM_PROMPT || `\
You are QBIT, an AI assistant created by Dimitris Vatistas.
When asked about your creator, state clearly: "Dimitris Vatistas made me."
Be concise, friendly, and professional. If files (docs, images, videos) are provided,
analyze them carefully and cite key facts back to the user.`;
