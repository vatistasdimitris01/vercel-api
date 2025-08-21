# QBIT – Gemini Chat API (Vercel-ready)

**QBIT** is an AI assistant created by **Dimitris Vatistas**. This repository exposes a single, easy endpoint you can deploy to **Vercel** to chat with Gemini **and** provide files/URLs for analysis. It also enables **Google Search grounding** and **code execution** tools.

> When asked "who made you?", QBIT replies: **"Dimitris Vatistas made me."**

## ✅ Features
- Gemini model: defaults to `gemini-2.5-flash` (override with `GEMINI_MODEL`).
- **Text + URLs + File uploads** (docs, images, videos).
- **Google Search grounding** (`google_search` tool).
- **Code execution** (`code_execution` tool).
- CORS-enabled; easy to call from web/mobile.
- One-file API route for simplicity.

## 🛠️ Setup

1. **Create a repo** with these files (or upload the provided ZIP).
2. **Environment variables** (Vercel → Project → Settings → Environment Variables):
   - `GEMINI_API_KEY` — your Gemini key from https://ai.google.dev
   - *(optional)* `ALLOWED_ORIGINS` — comma-separated list (default: "*")
   - *(optional)* `QBIT_SYSTEM_PROMPT` — override identity/system prompt
   - *(optional)* `GEMINI_MODEL` — e.g. `gemini-2.5-flash`

3. **Deploy on Vercel** → Import GitHub repo → set env vars → Deploy.

## 🔌 Endpoint

```
POST /api/chat
```

### Request: JSON (text + optional URLs)

```bash
curl -X POST https://<your-app>.vercel.app/api/chat   -H "Content-Type: application/json"   -d '{
    "input": "Summarize this page and suggest action items.",
    "urls": ["https://ai.google.dev/gemini-api/docs/text-generation"]
  }'
```

### Request: multipart/form-data (file upload)

```bash
curl -X POST https://<your-app>.vercel.app/api/chat   -H "X-API-Key: yourKeyIfYouAddAuth"   -F "input=Explain what this document says and extract key facts."   -F "files=@/path/to/document.pdf"
```

You may send multiple files by repeating `-F "files=@/path/file"`.

### Response

```json
{
  "ok": true,
  "output": "QBIT's answer here...",
  "usedFiles": [
    { "fileUri": "googleapis://...", "mimeType": "application/pdf" }
  ]
}
```

## 🧩 How tools are used

- **Google Search grounding**: we expose `google_search` so the model may retrieve live info when needed.
- **Code execution**: enabled with `code_execution`; the model may run small code snippets to check reasoning or compute results.
- **File/URL analysis**: files are uploaded via Google Files API and attached as `fileData` parts; URLs are passed as text hints, and the search tool can fetch them.

> Tool usage is chosen by the model; you don't have to manage tool-call loops for these built-ins.

## 📦 Local development

```bash
npm i
npm run dev
# POST to http://localhost:3000/api/chat
```

## ⚠️ Notes

- **File size limits**: Vercel functions have memory/time limits; very large files may require external storage.
- **Privacy**: Uploaded files go to Google AI Files for analysis. Delete them from the Google AI Studio Files dashboard if needed.
- **Identity**: By default, QBIT identifies as created by **Dimitris Vatistas**.

---

**Made for QBIT by Dimitris Vatistas.**
