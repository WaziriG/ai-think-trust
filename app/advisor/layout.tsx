import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to SIVRAJ, the AI Advisor · AI Think Trust",
  description: "Ask anything about AI for your business. SIVRAJ knows the full Trust and connects you with the right member.",
  openGraph: { title: "Talk to SIVRAJ, the AI Advisor · AI Think Trust", description: "Ask anything about AI for your business. SIVRAJ knows the full Trust and connects you with the right member." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
