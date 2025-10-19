"use client";

import { useEffect, useState } from "react";
import { getChatModelsForProvider, type ChatModel } from "@/lib/ai/models";

type ProviderType = 'ollama' | 'claude';

export function useAiProvider() {
  const [provider, setProvider] = useState<ProviderType>('claude');
  const [chatModels, setChatModels] = useState<ChatModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        // First check which provider is active
        const providerRes = await fetch('/api/provider');
        const providerData = await providerRes.json();
        setProvider(providerData.provider);

        if (providerData.provider === 'ollama') {
          // Fetch actual Ollama models
          try {
            const ollamaRes = await fetch('/api/ollama/models');
            const ollamaData = await ollamaRes.json();
            
            if (ollamaData.models && ollamaData.models.length > 0) {
              setChatModels(ollamaData.models);
              
              // Log if using fallback models
              if (ollamaData.fallback) {
                console.warn('Ollama unreachable, using fallback models');
              }
            } else {
              // Fallback to static models if API fails
              setChatModels(getChatModelsForProvider('ollama'));
            }
          } catch {
            // Fallback to static models if Ollama API fails
            setChatModels(getChatModelsForProvider('ollama'));
          }
        } else {
          // Use Claude models
          setChatModels(getChatModelsForProvider('claude'));
        }
      } catch {
        // Complete fallback
        setProvider('claude');
        setChatModels(getChatModelsForProvider('claude'));
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, []);

  return {
    provider,
    isOllama: provider === 'ollama',
    chatModels,
    isLoading
  };
}