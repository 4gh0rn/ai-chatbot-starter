"use server";

import { generateText, type UIMessage } from "ai";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import type { VisibilityType } from "@/components/visibility-selector";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { resolveChatIdentifier } from "@/convex/chats";
import { myProvider, getLanguageModel } from "@/lib/ai/providers";
import { gateway } from "@ai-sdk/gateway";
import { ChatSDKError } from "@/lib/errors";
import { FEATURE_SHARE_CONVERSATIONS } from "@/lib/feature-flags";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
  selectedChatModel,
}: {
  message: UIMessage;
  selectedChatModel?: string;
}) {
  try {
    // Use the selected model or fallback to a default
    const modelToUse = selectedChatModel || "title-model";
    
    console.log('Title generation - selectedChatModel:', selectedChatModel);
    console.log('Title generation - modelToUse:', modelToUse);
    
    // For Ollama models, skip AI generation and create title from message
    if (modelToUse.startsWith('ollama-')) {
      console.log('Using simple title extraction for Ollama model');
      
      // Extract message text for a simple title
      const messageText = message.parts
        ?.filter(part => part.type === 'text')
        ?.map(part => part.text)
        ?.join(' ') || '';
      
      if (messageText) {
        // Create a simple title from the first few words
        const words = messageText.split(' ').slice(0, 5).join(' ');
        return words.length > 50 ? words.substring(0, 47) + '...' : words;
      }
      
      return "New Chat";
    }
    
    const { text: title } = await generateText({
      model: getLanguageModel(modelToUse),
      system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
      prompt: JSON.stringify(message),
    });

  return title;
  } catch (error) {
    console.error('Title generation error:', error);
    
    // Extract message text for a simple title
    try {
      const messageText = message.parts
        ?.filter(part => part.type === 'text')
        ?.map(part => part.text)
        ?.join(' ') || '';
      
      if (messageText) {
        // Create a simple title from the first few words
        const words = messageText.split(' ').slice(0, 5).join(' ');
        return words.length > 50 ? words.substring(0, 47) + '...' : words;
      }
    } catch {
      // If all else fails
    }
    
    // Return a fallback title
    return "New Chat";
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const message = await fetchQuery(api.messages.getMessageById, {
    id: id as Id<"messages">,
  });

  if (!message) {
    return;
  }
  await fetchMutation(api.messages.deleteMessagesByChatIdAfterTimestamp, {
    chatId: message.chatId as Id<"chats">,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  if (!FEATURE_SHARE_CONVERSATIONS && visibility === "public") {
    throw new ChatSDKError(
      "forbidden:feature",
      "Conversation sharing disabled."
    );
  }
  const internalId = await resolveChatIdentifier(chatId);
  if (!internalId) {
    return;
  }
  await fetchMutation(api.chats.updateChatVisibility, {
    chatId: internalId,
    visibility,
  });
}
