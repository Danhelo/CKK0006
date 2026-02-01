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
  { ssr: false }
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
