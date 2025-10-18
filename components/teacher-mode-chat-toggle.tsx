"use client";

import { useState, useEffect } from "react";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Teacher Mode Chat Toggle Component
 * 
 * ChatGPT-style teacher mode toggle that appears in the chat header.
 * When active, AI responses are optimized for education with:
 * - Simple, easy-to-understand language
 * - Step-by-step explanations
 * - Detailed code comments
 * - TypeScript error prevention
 */

interface TeacherModeChatToggleProps {
  chatId: string;
  onTeacherModeChange?: (enabled: boolean) => void;
  className?: string;
}

export function TeacherModeChatToggle({ 
  chatId, 
  onTeacherModeChange,
  className = ""
}: TeacherModeChatToggleProps) {
  const { teacherMode } = useFeatureFlags();
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  // Generate unique storage key for each chat
  const storageKey = `teacher-mode-${chatId}`;

  // Load teacher mode state for this specific chat
  useEffect(() => {
    if (teacherMode) {
      const saved = localStorage.getItem(storageKey);
      const enabled = saved === "true";
      setIsTeacherMode(enabled);
      onTeacherModeChange?.(enabled);
    }
  }, [teacherMode, storageKey, onTeacherModeChange]);

  // Toggle teacher mode for this chat
  const toggleTeacherMode = () => {
    if (!teacherMode) return;
    
    const newState = !isTeacherMode;
    setIsTeacherMode(newState);
    localStorage.setItem(storageKey, newState.toString());
    onTeacherModeChange?.(newState);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("teacher-mode-chat-changed", {
      detail: { chatId, enabled: newState }
    }));
  };

  // Don't render if teacher mode feature is disabled
  if (!teacherMode) {
    return null;
  }

  return (
    <div className={className}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isTeacherMode ? "default" : "ghost"}
            size="sm"
            onClick={toggleTeacherMode}
            className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
              isTeacherMode 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                : "hover:bg-blue-50 hover:text-blue-700 text-muted-foreground"
            }`}
          >
          <svg
            className="h-3.5 w-3.5 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {isTeacherMode ? "Teacher Mode" : "Teacher"}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">
            {isTeacherMode ? "Teacher Mode: Active" : "Enable Teacher Mode"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isTeacherMode 
              ? "AI provides educational explanations with simple language and detailed comments"
              : "Get step-by-step explanations designed for learning"
            }
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
    </div>
  );
}

/**
 * Hook to get teacher mode state for a specific chat
 */
export function useTeacherModeForChat(chatId: string): {
  isTeacherMode: boolean;
  setTeacherMode: (enabled: boolean) => void;
} {
  const { teacherMode } = useFeatureFlags();
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const storageKey = `teacher-mode-${chatId}`;

  useEffect(() => {
    if (!teacherMode) {
      setIsTeacherMode(false);
      return;
    }

    // Check initial state for this chat
    const saved = localStorage.getItem(storageKey);
    setIsTeacherMode(saved === "true");

    // Listen for changes to this specific chat's teacher mode
    const handleTeacherModeChange = (event: CustomEvent) => {
      if (event.detail.chatId === chatId) {
        setIsTeacherMode(event.detail.enabled);
      }
    };

    window.addEventListener("teacher-mode-chat-changed", handleTeacherModeChange as EventListener);

    return () => {
      window.removeEventListener("teacher-mode-chat-changed", handleTeacherModeChange as EventListener);
    };
  }, [teacherMode, chatId, storageKey]);

  const setTeacherMode = (enabled: boolean) => {
    if (!teacherMode) return;
    
    setIsTeacherMode(enabled);
    localStorage.setItem(storageKey, enabled.toString());
    
    window.dispatchEvent(new CustomEvent("teacher-mode-chat-changed", {
      detail: { chatId, enabled }
    }));
  };

  return { 
    isTeacherMode: teacherMode ? isTeacherMode : false, 
    setTeacherMode 
  };
}