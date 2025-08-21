import { NextRequest, NextResponse } from "next/server";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../lib/gemini";

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const headers = { "Access-Control-Allow-Origin": "*" };

  try {
    const body = await req.json();
    const input = body.input || "";
    const useWebsearch = body.options?.websearch ?? true; // default true
    const useThinking = body.options?.thinking ?? true; // default true

    if (!input) {
      return NextResponse.json(
        { error: "Missing input" },
        { status: 400, headers }
      );
    }

    const { genAI } = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    // Map user-facing "websearch" to internal Google grounding
    const grounding = useWebsearch ? "google-search" : undefined;

    const content = {
      role: "user",
      parts: [
        {
          text: input,
          grounding,
        },
      ],
    };

    // Include reasoning if thinking is enabled
    const result = await model.generateContent({
      contents: [content],
      reasoning: useThinking ? { strategy: "chain-of-thought" } : undefined,
    });

    return NextResponse.json(
      {
        output: result.response.text(),
        usedWebsearch: !!grounding,
        usedThinking: useThinking,
      },
      { status: 200, headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500, headers }
    );
  }
}