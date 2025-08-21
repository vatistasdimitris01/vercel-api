import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Always apply web search (internally uses Google grounding)
    const content = {
      role: "user",
      parts: [{ text: input }],
      grounding: "google-search"
    };

    const result = await model.generateContent({
      contents: [content]
    });

    return NextResponse.json({
      result: result.response.text()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}