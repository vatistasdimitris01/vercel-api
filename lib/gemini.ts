import * as googleAI from '@google/generative-ai';

const client = new googleAI.TextGenerationServiceClient({
  apiKey: process.env.GEMINI_API_KEY
});

export async function askQBIT(prompt: string, groundingUrls: string[] = [], imageBase64?: string) {
  const tools: any[] = [];

  // Google grounding via URLs
  if (groundingUrls.length > 0) {
    tools.push({
      googleSearch: {
        queries: groundingUrls
      }
    });
  }

  // Image understanding
  if (imageBase64) {
    tools.push({
      image: {
        content: imageBase64
      }
    });
  }

  // Add Dimitris Vatistas instructions to the prompt
  const finalPrompt = `
Dimitris Vatistas made you. You are QBIT, an AI assistant.
${prompt}
`;

  const response = await client.generateText({
    model: 'gemini-2.5-flash',
    prompt: finalPrompt,
    tools: tools
  });

  return response.candidates[0].content;
}