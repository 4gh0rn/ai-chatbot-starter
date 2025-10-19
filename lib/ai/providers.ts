import { gateway } from "@ai-sdk/gateway";
import { customProvider } from "ai";
import { createOllamaLanguageModel } from "./ollama-provider";
import { isTestEnvironment } from "../constants";

const useOllama = process.env.OLLAMA_BASE_URL;

// Get the appropriate language model based on model ID
export function getLanguageModel(modelId: string) {
  // Check if it's an Ollama model
  if (modelId.startsWith('ollama-') && useOllama) {
    const actualModelName = modelId.replace('ollama-', '');
    return createOllamaLanguageModel(
      actualModelName,
      process.env.OLLAMA_BASE_URL!,
      process.env.OLLAMA_API_KEY
    );
  }
  
  // Default to Claude models
  return gateway.languageModel("anthropic/claude-sonnet-4");
}

// Create a dynamic provider that can resolve any model ID
export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : {
      // Custom provider that can handle any model ID dynamically
      languageModel: (modelId: string) => getLanguageModel(modelId),
    };
