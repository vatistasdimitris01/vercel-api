import { NextResponse } from "next/server";
import { QbitModel } from "qbitai"; // adjust import to your actual model

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    // Web search is always enabled (internal grounding is Google)
    const content = {
      role: "user",
      text: input,
      grounding: "google-search" // internal use only
    };

    const model = new QbitModel();

    // Generate content
    const result = await model.generateContent({
      contents: [content]
    });

    return NextResponse.json({
      result: result.outputText // adjust to your model's actual output
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message || "Something went wrong"
    }, { status: 500 });
  }
}