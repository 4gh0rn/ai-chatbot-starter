import type { 
  LanguageModelV2,
  LanguageModelV2CallWarning,
  LanguageModelV2FinishReason,
  LanguageModelV2StreamPart,
  LanguageModelV2Prompt,
} from '@ai-sdk/provider';

// Convert AI SDK prompt to Ollama messages format
function convertPromptToMessages(prompt: LanguageModelV2Prompt) {
  const messages: Array<{ role: string; content: string }> = [];
  
  for (const message of prompt) {
    if (message.role === 'system') {
      messages.push({ role: 'system', content: message.content });
    } else if (message.role === 'user') {
      const contentParts = message.content.map((part: any) => {
        if (part.type === 'text') {
          return part.text;
        }
        return '';
      }).filter(Boolean);
      
      if (contentParts.length > 0) {
        messages.push({ role: 'user', content: contentParts.join('\n') });
      }
    } else if (message.role === 'assistant') {
      const contentParts = message.content.map((part: any) => {
        if (part.type === 'text') {
          return part.text;
        }
        return '';
      }).filter(Boolean);
      
      if (contentParts.length > 0) {
        messages.push({ role: 'assistant', content: contentParts.join('\n') });
      }
    }
  }
  
  return messages;
}

// HTTP client for Ollama API
class OllamaHTTPClient {
  constructor(private baseURL: string, private apiKey?: string) {}

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  async chat(options: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    stream: boolean;
    options?: {
      temperature?: number;
      top_p?: number;
      top_k?: number;
    };
  }) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(options),
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      if (options.stream) {
        return response.body;
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama connection failed: ${error.message}`);
      }
      throw new Error('Unknown Ollama connection error');
    }
  }

  async list() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama connection failed: ${error.message}`);
      }
      throw new Error('Unknown Ollama connection error');
    }
  }
}

export function createOllamaLanguageModel(
  modelName: string,
  baseURL: string,
  apiKey?: string
): LanguageModelV2 {
  const client = new OllamaHTTPClient(baseURL, apiKey);

  return {
    specificationVersion: 'v2',
    provider: 'ollama',
    modelId: modelName,
    supportedUrls: {},
    
    async doGenerate(options: Parameters<LanguageModelV2['doGenerate']>[0]) {
      const { prompt, ...settings } = options;
      
      try {
        const messages = convertPromptToMessages(prompt);
        
        const response = await client.chat({
          model: modelName,
          messages,
          stream: false,
          options: {
            temperature: settings.temperature,
            top_p: settings.topP,
            top_k: settings.topK,
          },
        });

        const text = response.message?.content || '';

        return {
          content: [{ type: 'text' as const, text }],
          finishReason: 'stop' as LanguageModelV2FinishReason,
          usage: {
            inputTokens: response.prompt_eval_count || 0,
            outputTokens: response.eval_count || 0,
            totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
          },
          rawCall: { rawPrompt: prompt, rawSettings: settings },
          warnings: [] as LanguageModelV2CallWarning[],
        };
      } catch (error) {
        console.error('Ollama doGenerate error:', error);
        throw error;
      }
    },

    async doStream(options: Parameters<LanguageModelV2['doStream']>[0]) {
      const { prompt, ...settings } = options;
      
      try {
        const messages = convertPromptToMessages(prompt);
        
        const responseBody = await client.chat({
          model: modelName,
          messages,
          stream: true,
          options: {
            temperature: settings.temperature,
            top_p: settings.topP,
            top_k: settings.topK,
          },
        });

        if (!responseBody) {
          throw new Error('No response body from Ollama');
        }

        const reader = (responseBody as ReadableStream).getReader();
        const decoder = new TextDecoder();
        
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        const stream = new ReadableStream<LanguageModelV2StreamPart>({
          async start(controller) {
            try {
              let buffer = '';
              const textId = crypto.randomUUID();
              const reasoningId = crypto.randomUUID();
              let hasStartedText = false;
              let hasStartedReasoning = false;
              
              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  break;
                }
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  if (!line.trim()) continue;
                  
                  try {
                    const data = JSON.parse(line);
                    const content = data.message?.content || '';
                    const thinking = data.message?.thinking || '';
                    
                    // Stream thinking as reasoning (for reasoning models)
                    if (thinking) {
                      if (!hasStartedReasoning) {
                        controller.enqueue({
                          type: 'reasoning-start' as const,
                          id: reasoningId,
                        });
                        hasStartedReasoning = true;
                      }
                      
                      controller.enqueue({
                        type: 'reasoning-delta' as const,
                        id: reasoningId,
                        delta: thinking,
                      });
                    }
                    
                    // Stream content as final answer
                    if (content) {
                      // End reasoning before starting content
                      if (hasStartedReasoning && !hasStartedText) {
                        controller.enqueue({
                          type: 'reasoning-end' as const,
                          id: reasoningId,
                        });
                      }
                      
                      if (!hasStartedText) {
                        controller.enqueue({
                          type: 'text-start' as const,
                          id: textId,
                        });
                        hasStartedText = true;
                      }
                      
                      controller.enqueue({
                        type: 'text-delta' as const,
                        id: textId,
                        delta: content,
                      });
                    }
                    
                    if (data.prompt_eval_count) {
                      totalInputTokens = data.prompt_eval_count;
                    }
                    
                    if (data.eval_count) {
                      totalOutputTokens = data.eval_count;
                    }
                    
                    if (data.done) {
                      if (hasStartedReasoning && !hasStartedText) {
                        controller.enqueue({
                          type: 'reasoning-end' as const,
                          id: reasoningId,
                        });
                      }
                      
                      if (hasStartedText) {
                        controller.enqueue({
                          type: 'text-end' as const,
                          id: textId,
                        });
                      }
                      
                      controller.enqueue({
                        type: 'finish' as const,
                        finishReason: 'stop' as LanguageModelV2FinishReason,
                        usage: {
                          inputTokens: totalInputTokens,
                          outputTokens: totalOutputTokens,
                          totalTokens: totalInputTokens + totalOutputTokens,
                        },
                      });
                    }
                  } catch (parseError) {
                    // Silently ignore parse errors for malformed chunks
                  }
                }
              }
              
              controller.close();
            } catch (error) {
              console.error('Ollama stream error:', error);
              controller.error(error);
            } finally {
              reader.releaseLock();
            }
          },
        });

        return {
          stream,
          rawCall: { rawPrompt: prompt, rawSettings: settings },
        };
      } catch (error) {
        console.error('Ollama doStream error:', error);
        throw error;
      }
    },
  };
}