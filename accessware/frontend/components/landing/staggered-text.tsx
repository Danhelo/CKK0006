"use client";

import { cn } from "@/lib/utils";

interface StaggeredTextProps {
  text: string;
  isVisible: boolean;
  className?: string;
  delayMs?: number;
}

export function StaggeredText({
  text,
  isVisible,
  className,
  delayMs = 80,
}: StaggeredTextProps) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className={cn(
            "inline-block transition-all duration-700",
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
          style={{
            transitionDelay: isVisible ? `${i * delayMs}ms` : "0ms",
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
