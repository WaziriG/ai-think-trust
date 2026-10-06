import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Think Trust · The Trusted Voices in AI",
  description: "Four practitioners, four corners of AI, learned on real businesses.",
  openGraph: { title: "AI Think Trust · The Trusted Voices in AI", description: "Four practitioners, four corners of AI, learned on real businesses." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
