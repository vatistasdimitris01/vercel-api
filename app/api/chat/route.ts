import { askQBIT } from '../../../lib/gemini';

export async function POST(req: Request) {
  const data = await req.json();
  let result = '';

  if (data.files?.length) {
    const fileBase64 = data.files[0]; // assuming Base64
    result = await askQBIT(data.input, data.urls, fileBase64);
  } else {
    result = await askQBIT(data.input, data.urls);
  }

  return new Response(JSON.stringify({ output: result }), {
    headers: { 'Content-Type': 'application/json' }
  });
}