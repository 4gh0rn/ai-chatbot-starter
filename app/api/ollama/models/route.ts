import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.OLLAMA_BASE_URL) {
    return NextResponse.json({ error: "Ollama not configured" }, { status: 400 });
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if API key is configured
    if (process.env.OLLAMA_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.OLLAMA_API_KEY}`;
    }
    
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const models = await response.json();
    
    // Transform to our ChatModel format
    const chatModels = models.models?.map((model: any) => ({
      id: `ollama-${model.name}`,
      name: model.name,
      description: `Local model: ${model.name} (${Math.round(model.size / 1e9)}GB)`,
      ollamaName: model.name // Keep original name for API calls
    })) || [];

    return NextResponse.json({ models: chatModels });
  } catch (error) {
    console.error("Failed to fetch Ollama models:", error);
    
    // Return fallback models when Ollama is unreachable
    const fallbackModels = [
      {
        id: "ollama-llama3.2",
        name: "llama3.2",
        description: "Local model: llama3.2 (fallback)",
        ollamaName: "llama3.2"
      }
    ];
    
    return NextResponse.json({ 
      models: fallbackModels,
      error: "Ollama unreachable, using fallback models",
      fallback: true
    });
  }
}