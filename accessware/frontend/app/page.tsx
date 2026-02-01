"use client";

import dynamic from "next/dynamic";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { ConceptSection } from "@/components/landing/concept-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";

// R3F canvas needs ssr: false
const DemoPreview = dynamic(
  () => import("@/components/landing/demo-preview").then((m) => m.DemoPreview),
  {
    ssr: false,
    loading: () => (
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div
            className="h-72 animate-pulse rounded-lg md:h-96"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
          />
        </div>
      </section>
    ),
  }
);

export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <ConceptSection />
      <SolutionSection />
      <HowItWorks />
      <DemoPreview />
      <Footer />
    </main>
  );
}
