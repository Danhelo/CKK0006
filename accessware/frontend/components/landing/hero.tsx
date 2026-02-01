"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { StaggeredText } from "./staggered-text";

export function Hero() {
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Background — animated grid with parallax */}
      <div
        className="pointer-events-none absolute inset-0 grid-pattern"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />

      {/* Radial amber glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)",
          transform: `translate(-50%, -50%) translateY(${scrollY * 0.1}px)`,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex max-w-3xl flex-col items-center text-center"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        {/* Headline */}
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          <StaggeredText
            text="Who tests the tools designed for the people who need them most?"
            isVisible={visible}
            delayMs={70}
          />
        </h1>

        {/* Subtext */}
        <p
          className="mt-6 max-w-lg text-lg leading-relaxed transition-all duration-1000 delay-700"
          style={{
            color: "var(--text-secondary)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          Accessware uses a robotic arm to physically test accessibility hardware
          the way real users interact with it — revealing where design
          assumptions fail.
        </p>

        {/* CTA */}
        <div
          className="mt-10 transition-all duration-700 delay-1000"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: "var(--amber-400)",
              color: "var(--background)",
            }}
          >
            <span className="relative z-10">Open Dashboard</span>
            {/* Glow effect */}
            <span
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                boxShadow: "0 0 30px rgba(245,166,35,0.4), 0 0 60px rgba(245,166,35,0.15)",
              }}
            />
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 flex flex-col items-center gap-2 transition-all duration-1000 delay-[1400ms]"
        style={{
          opacity: visible ? 0.6 : 0,
          color: "var(--text-tertiary)",
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown size={16} className="animate-chevron" />
      </div>
    </section>
  );
}
