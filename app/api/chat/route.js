import { NextRequest, NextResponse } from "next/server";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../lib/gemini";

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: { 
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}

export async function POST(req: NextRequest) {
  const headers = { "Access-Control-Allow-Origin": "*" };

  try {
    const body = await req.json();
    const input = body.input?.trim();

    if (!input) {
      return NextResponse.json({ error: "Missing input text" }, { status: 400, headers });
    }

    const { genAI } = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        text: input,
        grounding: "google-search", // enables Google grounding
      }],
    });

    return NextResponse.json({ output: result.response.text() }, { status: 200, headers });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500, headers });
  }
}
