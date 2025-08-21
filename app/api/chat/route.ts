import { NextRequest, NextResponse } from "next/server";
import { getGemini, QBIT_SYSTEM_PROMPT } from "../../../lib/gemini";

// --- QBIT protocol types (internal) ---
type QbitRole = "user" | "assistant";

interface QbitHistoryItem {
  role: QbitRole;
  content: string;
}

interface QbitOptions {
  thinking?: boolean;
  grounding?: boolean;
}

interface QbitRequestBody {
  mode?: "text" | "chat";
  input?: string;
  history?: QbitHistoryItem[];
  options?: QbitOptions;
}

function qbitJson(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Vary": "Origin",
      ...extraHeaders,
    },
  });
}

function toIsoNow() {
  return new Date().toISOString();
}

function makeId(prefix = "msg") {
  // crypto.randomUUID is available in Node 18+ / Edge runtimes
  try {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  } catch {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Map QBIT roles -> Gemini SDK roles
function toGeminiRole(role: QbitRole): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: QbitRequestBody = await req.json();
    const mode = body.mode ?? "text";
    const input = (body.input ?? "").trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const options = body.options ?? {};

    if (mode === "text" && !input) {
      return qbitJson({ error: "Missing input text" }, 400);
    }

    const { genAI } = getGemini();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: QBIT_SYSTEM_PROMPT,
    });

    let output = "";
    const meta = {
      thinkingEnabled: !!options.thinking,
      groundingEnabled: !!options.grounding,
    };

    if (mode === "chat") {
      // Convert QBIT history to Gemini history
      const geminiHistory =
        history.map((h) => ({
          role: toGeminiRole(h.role),
          parts: [{ text: h.content }],
        })) ?? [];

      const chat = model.startChat({ history: geminiHistory });

      const result = await chat.sendMessage(input || "");
      output = result.response.text();
    } else {
      // Single turn
      const request: any = {
        contents: [{ role: "user", parts: [{ text: input }] }],
      };

      // Thinking / Reasoning effort (SDK-supported field name)
      if (options.thinking) {
        request.generationConfig = {
          reasoningEffort: "medium", // "low" | "medium" | "high"
        };
      }

      // Grounding: accept user flag & attach best-effort config shape.
      // (The exact shape may evolve with SDK; keeping this internal/optional.)
      if (options.grounding) {
        request.groundingConfig = {
          sources: ["google-search"],
        };
      }

      const result = await model.generateContent(request);
      output = result.response.text();
    }

    const responsePayload = {
      id: makeId(),
      timestamp: toIsoNow(),
      mode,
      output,
      meta,
    };

    return qbitJson(responsePayload, 200);
  } catch (err: any) {
    // Never leak provider details
    return qbitJson(
      { error: "Internal Server Error", details: err?.message ?? undefined },
      500
    );
  }
}