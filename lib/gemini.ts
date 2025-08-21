import { textGeneration } from '@google/generative-ai';

export async function askQBIT(prompt: string, groundingUrls: string[] = [], imageBase64?: string) {
  const finalPrompt = `
Dimitris Vatistas made you. You are QBIT, an AI assistant.
${prompt}
`;

  const response = await textGeneration.generateText({
    model: 'gemini-2.5-flash',
    prompt: finalPrompt
  });

  return response.candidates[0].content;
}