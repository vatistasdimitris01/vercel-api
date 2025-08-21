import { NextResponse } from "next/server";

export function buildCorsHeaders(req) {
  const origin = req.headers.get("origin") || "*";
  const allowed = (process.env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const allowOrigin = allowed.includes("*") || allowed.includes(origin) ? origin : allowed[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleOptions(req) {
  const headers = buildCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}