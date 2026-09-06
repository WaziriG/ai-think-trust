import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Fit Quiz · AI Think Trust",
  description: "Five quick questions to match you with the Trust member best positioned for your AI challenge.",
  openGraph: { title: "AI Fit Quiz · AI Think Trust", description: "Five quick questions to match you with the Trust member best positioned for your AI challenge." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
