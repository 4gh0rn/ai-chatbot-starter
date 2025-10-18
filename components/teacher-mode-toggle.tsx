"use client";

import { useState, useEffect } from "react";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Teacher Mode Toggle Component
 * 
 * This component provides a toggle for activating Teacher Mode,
 * which optimizes the AI responses for learning and education.
 * When active, the AI will:
 * - Use simple, easy-to-understand language
 * - Provide step-by-step explanations
 * - Include detailed code comments
 * - Ensure no TypeScript errors
 * - Protect existing features from breaking
 */
export function TeacherModeToggle() {
  const { teacherMode } = useFeatureFlags();
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  // Load teacher mode state from localStorage on component mount
  useEffect(() => {
    if (teacherMode) {
      const saved = localStorage.getItem("teacher-mode");
      setIsTeacherMode(saved === "true");
    }
  }, [teacherMode]);

  // Save teacher mode state to localStorage when it changes
  const toggleTeacherMode = () => {
    if (!teacherMode) return;
    
    const newState = !isTeacherMode;
    setIsTeacherMode(newState);
    localStorage.setItem("teacher-mode", newState.toString());
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("teacher-mode-changed", {
      detail: { enabled: newState }
    }));
  };

  // Don't render if teacher mode feature is disabled
  if (!teacherMode) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isTeacherMode ? "default" : "outline"}
          size="sm"
          onClick={toggleTeacherMode}
          className={`transition-all duration-200 ${
            isTeacherMode 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          }`}
        >
          <svg
            className="h-4 w-4 mr-1"
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
          Teacher
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">
            {isTeacherMode ? "Teacher Mode Active" : "Activate Teacher Mode"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isTeacherMode 
              ? "AI will provide detailed, educational explanations with simple language"
              : "Get detailed explanations designed for learning"
            }
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Hook to check if Teacher Mode is currently active
 * 
 * @returns boolean indicating if teacher mode is enabled
 */
export function useTeacherMode(): boolean {
  const { teacherMode } = useFeatureFlags();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!teacherMode) {
      setIsActive(false);
      return;
    }

    // Check initial state
    const saved = localStorage.getItem("teacher-mode");
    setIsActive(saved === "true");

    // Listen for changes
    const handleTeacherModeChange = (event: CustomEvent) => {
      setIsActive(event.detail.enabled);
    };

    window.addEventListener("teacher-mode-changed", handleTeacherModeChange as EventListener);

    return () => {
      window.removeEventListener("teacher-mode-changed", handleTeacherModeChange as EventListener);
    };
  }, [teacherMode]);

  return isActive;
}