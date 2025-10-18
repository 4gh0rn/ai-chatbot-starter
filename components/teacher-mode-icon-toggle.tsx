"use client";

import { useState, useEffect } from "react";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TeacherModeIconToggleProps {
  chatId: string;
  className?: string;
}

export function TeacherModeIconToggle({ 
  chatId, 
  className = ""
}: TeacherModeIconToggleProps) {
  const { teacherMode } = useFeatureFlags();
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  const storageKey = `teacher-mode-${chatId}`;

  useEffect(() => {
    if (teacherMode) {
      const saved = localStorage.getItem(storageKey);
      setIsTeacherMode(saved === "true");
    }
  }, [teacherMode, storageKey]);

  const toggleTeacherMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!teacherMode) return;
    
    const newState = !isTeacherMode;
    setIsTeacherMode(newState);
    localStorage.setItem(storageKey, newState.toString());
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("teacher-mode-chat-changed", {
      detail: { chatId, enabled: newState }
    }));
  };

  if (!teacherMode) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTeacherMode}
          className={`h-8 w-8 ${
            isTeacherMode 
              ? "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900" 
              : "text-muted-foreground hover:text-foreground"
          } ${className}`}
        >
          <svg
            className="h-4 w-4"
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
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">
            {isTeacherMode ? "Teacher Mode aktiv" : "Teacher Mode aktivieren"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isTeacherMode 
              ? "Erhalte ausführliche Erklärungen mit einfacher Sprache"
              : "Schalte zu Lern-optimierten Antworten um"
            }
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}