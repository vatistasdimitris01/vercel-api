// app/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: prompt }),
    });
    const data = await res.json();
    setResponse(data.output);
  };

  return (
    <div style={{ background: "black", color: "white", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>QBIT AI</h1>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} cols={40} />
      <button onClick={handleSubmit}>Send</button>
      <pre>{response}</pre>
    </div>
  );
}