import { askQBIT } from '../../../lib/gemini';

export async function POST(req: Request) {
  const { text, imageBase64 } = await req.json();

  const answer = await askQBIT(text, [], imageBase64);

  return new Response(JSON.stringify({ answer }), { status: 200 });
}