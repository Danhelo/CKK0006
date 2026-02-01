"use client";

import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="border-t px-6 py-16"
      style={{ borderColor: "var(--border-accent)", background: "var(--surface-1)" }}
    >
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
        {/* Wordmark + description */}
        <div>
          <h3
            className="font-display text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Accessware
          </h3>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Physical QA for accessibility hardware. Robotic testing that reveals
            where design assumptions fail real users.
          </p>
        </div>

        {/* Team + hackathon */}
        <div>
          <h4
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--text-tertiary)" }}
          >
            About
          </h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Built with an Arduino Nano, 4 servos, and a belief that every
            user deserves hardware that actually works for them.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Links
          </h4>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--amber-400)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <ExternalLink size={12} />
              Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--amber-400)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <Github size={12} />
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-auto mt-12 max-w-5xl border-t pt-6 text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Accessware &mdash; Physical QA for the tools that matter most.
        </p>
      </div>
    </footer>
  );
}
