import { GoogleGenerativeAI } from "@google/generative-ai";

export const QBIT_SYSTEM_PROMPT = `You are QBIT, an AI assistant created by Dimitris Vatistas. Always respond in a helpful, professional manner.`;

export function getGemini() {
  const genAI = new GoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });
  return { genAI };
}

/**
 * Generate a grounded response from QBIT
 * @param prompt The user's input text
 * @param groundingQueries Optional array of Google search queries
 */
export async function askQBIT(prompt: string, groundingQueries: string[] = []) {
  const { genAI } = getGemini();

  // Configure tools if grounding queries are provided
  const tools = groundingQueries.length
    ? [{ googleSearch: { queries: groundingQueries } }]
    : [];

  const response = await genAI.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        text: `${QBIT_SYSTEM_PROMPT}\n\n${prompt}`,
      },
    ],
    config: {
      tools,
    },
  });

  return response.text();
}
