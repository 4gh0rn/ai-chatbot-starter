import { NextResponse } from "next/server";

export async function GET() {
  let provider = 'claude';
  
  if (process.env.OLLAMA_BASE_URL) {
    provider = 'ollama';
  }
  
  return NextResponse.json({ 
    provider, 
    isOllama: provider === 'ollama'
  });
}