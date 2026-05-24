"use client";

import dynamic from "next/dynamic";

const AdvisorClient = dynamic(() => import("./_client"), {
  ssr: false,
  loading: () => (
    <div style={{
      background: "#0a0a0a",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <span style={{ color: "#888", fontSize: 14 }}>Loading advisor…</span>
    </div>
  ),
});

export default function AdvisorPage() {
  return <AdvisorClient />;
}
