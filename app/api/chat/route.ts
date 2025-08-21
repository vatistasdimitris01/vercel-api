// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../lib/gemini";
import { buildCorsHeaders, handleOptions } from "../../../lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  const headers = buildCorsHeaders(req);

  try {
    const contentType = req.headers.get("content-type") || "";
    let input = "";
    let uploadedFiles: string[] = [];

    const { genAI, fileManager } = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    if (contentType.includes("multipart/form-data")) {
      // Handle form-data with file(s)
      const formData = await req.formData();
      input = (formData.get("input") as string) || "";

      const files = formData.getAll("files");
      for (const file of files) {
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await fileManager.uploadFile(buffer, {
            mimeType: file.type,
            displayName: file.name,
          });
          uploadedFiles.push(upload.file.uri);
        }
      }
    } else {
      // Handle JSON
      const body = await req.json();
      input = body.input || "";
      uploadedFiles = (body.urls as string[]) || [];
    }

    if (!input && uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "Missing input text or files" },
        { status: 400, headers }
      );
    }

    // Build user parts
    const parts = [{ text: input }];
    for (const url of uploadedFiles) {
      parts.push({
        fileData: { mimeType: "application/octet-stream", fileUri: url },
      });
    }

    // Generate response
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    return NextResponse.json(
      { output: result.response.text() },
      { status: 200, headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500, headers }
    );
  }
}
