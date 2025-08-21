import { NextRequest, NextResponse } from "next/server";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../lib/gemini";

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "*" } });
}

export async function POST(req: NextRequest) {
  const headers = { "Access-Control-Allow-Origin": "*" };

  try {
    const contentType = req.headers.get("content-type") || "";
    let input = "";
    let uploadedUrls: string[] = [];

    const { genAI } = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      input = (formData.get("input") as string) || "";
      const files = formData.getAll("files");
      uploadedUrls = files.map((f) => f instanceof File ? f.name : "").filter(Boolean);
    } else {
      const body = await req.json();
      input = body.input || "";
      uploadedUrls = (body.urls as string[]) || [];
    }

    if (!input && uploadedUrls.length === 0) {
      return NextResponse.json({ error: "Missing input or files" }, { status: 400, headers });
    }

    const parts = [{ text: input }, ...uploadedUrls.map((url) => ({ fileData: { mimeType: "application/octet-stream", fileUri: url } }))];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    return NextResponse.json({ output: result.response.text() }, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500, headers });
  }
}
