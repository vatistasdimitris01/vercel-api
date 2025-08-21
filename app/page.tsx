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
    setResponse(data.output || "No response");
  };

  return (
    <div style={{ background: "black", color: "white", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>QBIT AI</h1>
      <textarea
        style={{ width: "400px", height: "100px", marginBottom: "10px" }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleSubmit} style={{ padding: "10px 20px" }}>Send</button>
      <pre style={{ marginTop: "20px", width: "400px" }}>{response}</pre>
    </div>
  );
}