import { NextRequest, NextResponse } from "next/server";
import { buildCorsHeaders, handleOptions } from "../../../lib/cors";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../lib/gemini";

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  const headers = buildCorsHeaders(req);

  try {
    const contentType = req.headers.get("content-type") || "";
    let input = "";
    let uploadedUrls: string[] = [];

    const { genAI } = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    // Parse input & files
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      input = (formData.get("input") as string) || "";
      const files = formData.getAll("files");
      uploadedUrls = files.map((f) => (f instanceof File ? f.name : "")).filter(Boolean);
    } else {
      const body = await req.json();
      input = body.input || "";
      uploadedUrls = (body.urls as string[]) || [];
    }

    if (!input && uploadedUrls.length === 0) {
      return NextResponse.json({ error: "Missing input or files" }, { status: 400, headers });
    }

    // Prepare contents for model
    const parts = [
      { text: input },
      ...uploadedUrls.map((url) => ({
        fileData: { mimeType: "application/octet-stream", fileUri: url },
      })),
    ];

    // **Web search enabled by default**
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      webSearch: true, // always enabled
    });

    return NextResponse.json({ output: result.response.text() }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500, headers });
  }
}