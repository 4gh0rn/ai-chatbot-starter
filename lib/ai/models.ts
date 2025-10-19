export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

const ollamaModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Llama 3.2 (Ollama)",
    description: "Local Llama 3.2 model running on Ollama",
  },
  {
    id: "chat-model-reasoning",
    name: "Llama 3.2 (Ollama)",
    description: "Local Llama 3.2 model for reasoning tasks",
  },
];

const claudeModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Claude 4 - Sonnet",
    description: "Advanced multimodal model with vision and text capabilities",
  },
  {
    id: "chat-model-reasoning",
    name: "Claude 4 - Sonnet (Reasoning)",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
  },
];

// Static export for build-time compatibility
export const chatModels: ChatModel[] = claudeModels;

// Client-side function to get the right models
export function getChatModelsForProvider(provider: 'ollama' | 'claude'): ChatModel[] {
  return provider === 'ollama' ? ollamaModels : claudeModels;
}
