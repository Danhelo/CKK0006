"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AnimatedNumberProps {
  value: number;
  format?: "int" | "float" | "percentage";
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedNumber({
  value,
  format = "float",
  decimals = 1,
  suffix = "",
  duration = 800,
  className,
  style,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState("0");
  const startRef = useRef(0);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);

  const formatValue = useCallback(
    (v: number) => {
      switch (format) {
        case "int":
          return Math.round(v).toString();
        case "percentage":
          return v.toFixed(decimals);
        case "float":
        default:
          return v.toFixed(decimals);
      }
    },
    [format, decimals],
  );

  useEffect(() => {
    const from = startRef.current;
    const to = value;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(formatValue(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, formatValue]);

  return (
    <span className={className} style={style}>
      {display}
      {suffix}
    </span>
  );
}
