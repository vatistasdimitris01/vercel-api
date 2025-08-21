import { NextRequest, NextResponse } from "next/server";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../lib/gemini";

export async function POST(req: NextRequest) {
  const headers = { "Access-Control-Allow-Origin": "*" };

  try {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    const body = await req.json();
    const input = body.input || "";

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400, headers });
    }

    // Generate content without file uploads
    const tools = model.getTools();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: input }] }],
      tools, // only using tools, no files
    });

    return NextResponse.json({ output: result.response.text() }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500, headers });
  }
}
