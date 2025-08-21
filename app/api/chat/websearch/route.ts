// Correct imports for route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../../lib/gemini";
import { buildCorsHeaders, handleOptions } from "../../../../lib/cors";

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  const headers = buildCorsHeaders(req);

  try {
    const contentType = req.headers.get("content-type") || "";
    let input = "";

    const { genAI } = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      input = (formData.get("input") as string) || "";
    } else {
      const body = await req.json();
      input = body.input || "";
    }

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400, headers });
    }

    // Prepare content parts
    const parts = [{ text: input }];

    // Call the model
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    // Return the generated text
    return NextResponse.json({ result: result.response?.text() || "" }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500, headers });
  }
}