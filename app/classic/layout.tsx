import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Think Trust · The Trusted Voices in AI",
  description: "Six practitioners, six corners of AI, learned on real businesses.",
  openGraph: { title: "AI Think Trust · The Trusted Voices in AI", description: "Six practitioners, six corners of AI, learned on real businesses." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
