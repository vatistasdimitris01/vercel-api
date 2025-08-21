import { NextRequest, NextResponse } from "next/server";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../lib/gemini";

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
    let input = body.input || "";
    const useWebsearch = body.options?.websearch ?? true;
    const useThinking = body.options?.thinking ?? true;

    if (!input) {
      return NextResponse.json(
        { error: "Missing input" },
        { status: 400, headers }
      );
    }

    if (useThinking) {
      // Prepend thinking instruction for chain-of-thought
      input = "Think step by step: " + input;
    }

    const { genAI } = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    const content = {
      role: "user",
      parts: [
        {
          text: input,
          grounding: useWebsearch ? "google-search" : undefined,
        },
      ],
    };

    const result = await model.generateContent({
      contents: [content],
    });

    return NextResponse.json(
      {
        output: result.response.text(),
        usedWebsearch: useWebsearch,
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