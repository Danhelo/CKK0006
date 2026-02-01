"use client";

import Link from "next/link";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  connected: boolean;
  presentationMode: boolean;
  onTogglePresentation: () => void;
}

export function DashboardHeader({
  connected,
  presentationMode,
  onTogglePresentation,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-5"
      style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--amber-400)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <div className="h-4 w-px" style={{ background: "var(--border)" }} />
        <h1 className="text-sm font-semibold tracking-wide" style={{ color: "var(--text-primary)" }}>
          Accessware <span style={{ color: "var(--text-tertiary)" }}>Dashboard</span>
        </h1>
      </div>

      <div className="flex items-center gap-5">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi size={14} style={{ color: "var(--green-pass)" }} />
          ) : (
            <WifiOff size={14} style={{ color: "var(--red-warm)" }} />
          )}
          <span className="text-xs font-medium" style={{
            color: connected ? "var(--green-pass)" : "var(--red-warm)"
          }}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Presentation loop toggle */}
        <button
          onClick={onTogglePresentation}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all",
            presentationMode
              ? "amber-glow"
              : "hover:opacity-80"
          )}
          style={{
            background: presentationMode ? "var(--amber-400)" : "var(--surface-3)",
            color: presentationMode ? "var(--background)" : "var(--text-secondary)",
          }}
        >
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            presentationMode && "animate-pulse"
          )}
            style={{
              background: presentationMode ? "var(--background)" : "var(--text-tertiary)"
            }}
          />
          Loop
        </button>
      </div>
    </header>
  );
}
