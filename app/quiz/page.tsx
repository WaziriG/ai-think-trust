"use client";

import { useState } from "react";
import Link from "next/link";

const C = {
  accent: "#e53935",
  accentDim: "rgba(229,57,53,0.12)",
  bg: "#0a0a0a",
  card: "#161616",
  border: "#2a2a2a",
  text: "#f5f5f5",
  muted: "#888888",
};

type Answers = {
  name: string;
  email: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
};

const QUESTIONS = [
  {
    key: "q1" as const,
    text: "Which best describes your business right now?",
    options: [
      "Solopreneur / freelancer",
      "Small team (2–10)",
      "Growing company (10+)",
      "Still figuring it out",
    ],
  },
  {
    key: "q2" as const,
    text: "How would you rate where you are with AI today?",
    options: [
      "Haven't touched it",
      "Dabbling (ChatGPT here and there)",
      "Using it weekly for real work",
      "Building custom workflows / GPTs",
    ],
  },
  {
    key: "q3" as const,
    text: "What's your single biggest AI challenge right now?",
    options: null, // open text
  },
  {
    key: "q4" as const,
    text: "If you could wave a wand, which would change your business the most?",
    options: [
      "Save hours on repetitive work (automation)",
      "Get better at content / marketing with AI",
      "Actually understand what AI can do for my business",
      "Build something custom (GPT, agent, workflow)",
      "Train my team so I'm not the bottleneck",
    ],
  },
  {
    key: "q5" as const,
    text: "When do you want to see results?",
    options: [
      "In the next 30 days — I need to move",
      "In the next quarter — I'm planning",
      "Just exploring for now",
    ],
  },
];

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
// Weighted multi-signal scoring system. Every answer contributes points.
// Hard excludes (XL = -9999) override all other scores.
//
// Weights by question:
//   Q4 primary driver — rank (1–6) × 10 pts  → max 60 pts
//   Q1 eligibility    — hard excludes + boosts → ±8–20 pts
//   Q2 AI maturity    — hard excludes + boosts → ±8–20 pts
//   Q3 open text      — keyword clusters       → +10 pts per match
//   Q5 urgency        — delivery speed signal  → ±5–10 pts
//
// Hot lead flag (separate from routing): Q5 = "30 days" OR Q3 > 80 chars.
// ─────────────────────────────────────────────────────────────────────────────

const XL = -9999;

// Q4: Priority rankings per answer (1 = best fit, 6 = weakest)
const Q4_RANKS: Record<string, Record<string, number>> = {
  "Save hours on repetitive work (automation)": {
    "Daniel Marama": 6, "Waziri Garuba": 5, "Jasmine Brown": 4,
    "Patty Dominguez": 3, "Jackson Edens": 2, "Sage": 1,
  },
  "Get better at content / marketing with AI": {
    "Patty Dominguez": 6, "Daniel Marama": 5, "Jackson Edens": 4,
    "Jasmine Brown": 3, "Waziri Garuba": 2, "Sage": 1,
  },
  "Actually understand what AI can do for my business": {
    "Jackson Edens": 6, "Jasmine Brown": 5, "Patty Dominguez": 4,
    "Waziri Garuba": 3, "Daniel Marama": 2, "Sage": 1,
  },
  "Build something custom (GPT, agent, workflow)": {
    "Sage": 6, "Daniel Marama": 5, "Waziri Garuba": 4,
    "Patty Dominguez": 3, "Jasmine Brown": 2, "Jackson Edens": 1,
  },
  "Train my team so I'm not the bottleneck": {
    "Waziri Garuba": 6, "Patty Dominguez": 5, "Jasmine Brown": 4,
    "Jackson Edens": 3, "Daniel Marama": 2, "Sage": 1,
  },
};

function scoreMembers(a: Answers): string {
  const s: Record<string, number> = {
    "Patty Dominguez": 0, "Jackson Edens": 0, "Sage": 0,
    "Daniel Marama": 0, "Jasmine Brown": 0, "Waziri Garuba": 0,
  };

  // ── Q1: Business size / stage ──────────────────────────────────────────────
  if (a.q1 === "Solopreneur / freelancer" || a.q1 === "Still figuring it out") {
    s["Sage"] += XL;           // Sage (Rosenblatt) doesn't serve solos/pre-revenue
    s["Daniel Marama"] -= 15;  // Daniel's ICP is $5M–$50M companies
  }
  if (a.q1 === "Still figuring it out") s["Jackson Edens"] += 20;
  if (a.q1 === "Solopreneur / freelancer") s["Jackson Edens"] += 8;
  if (a.q1 === "Growing company (10+)") {
    s["Jackson Edens"] += XL;   // Jackson doesn't serve growing companies
    s["Jasmine Brown"] += XL;   // Jasmine doesn't serve growing companies
    s["Patty Dominguez"] += XL; // Patty doesn't serve growing companies
    s["Daniel Marama"] += 20;
    s["Sage"] += 20;
    s["Waziri Garuba"] += 15;
  }

  // ── Q2: AI experience / maturity ──────────────────────────────────────────
  if (a.q2 === "Haven't touched it") {
    if (a.q1 === "Solopreneur / freelancer" || a.q1 === "Still figuring it out") {
      s["Jasmine Brown"] += 15;
      s["Jackson Edens"] += 15;
    } else {
      // 2+ people, zero AI experience → Sage/Waziri/Daniel are wrong fits; Patty/Jasmine handle novices
      s["Sage"] += XL;
      s["Waziri Garuba"] -= 15;
      s["Daniel Marama"] -= 15;
      s["Patty Dominguez"] += 15;
      s["Jasmine Brown"] += 15;
    }
  }
  if (a.q2 === "Dabbling (ChatGPT here and there)") {
    s["Sage"] += 8; s["Waziri Garuba"] += 8; s["Daniel Marama"] += 8;
  }
  if (a.q2 === "Using it weekly for real work") {
    s["Waziri Garuba"] += 15; s["Daniel Marama"] += 15;
    s["Sage"] += 10; s["Jasmine Brown"] += 8;
  }
  if (a.q2 === "Building custom workflows / GPTs") {
    s["Waziri Garuba"] += 20; s["Daniel Marama"] += 20;
    s["Sage"] += 15; s["Jasmine Brown"] += 8;
  }

  // ── Q3: Open text — keyword match against member profiles ─────────────────
  const q3 = a.q3.toLowerCase();
  const clusters: Array<[string[], string[]]> = [
    [["team", "train", "employ", "staff", "people", "hire"],             ["Jackson Edens", "Waziri Garuba"]],
    [["automat", "workflow", "repetitive", "manual", "process", "task"], ["Jasmine Brown", "Daniel Marama"]],
    [["market", "content", "brand", "visib", "authority", "found"],      ["Patty Dominguez"]],
    [["build", "custom", "agent", "gpt", "develop", "engineer", "code"], ["Waziri Garuba", "Sage", "Daniel Marama"]],
    [["data", "metric", "analytic", "roi", "measure", "track"],          ["Daniel Marama"]],
    [["scale", "headcount", "grow", "infrastructure", "equity"],         ["Daniel Marama", "Sage"]],
    [["understand", "learn", "confused", "not sure", "overwhelm"],       ["Jackson Edens", "Patty Dominguez", "Jasmine Brown"]],
    [["startup", "fund", "investor", "pitch", "launch"],                 ["Sage"]],
    [["email", "social", "post", "copy", "messaging", "linkedin"],       ["Patty Dominguez"]],
    [["time", "save", "hours", "busy", "capacity", "bandwidth"],         ["Jasmine Brown", "Daniel Marama"]],
  ];
  for (const [terms, members] of clusters) {
    for (const term of terms) {
      if (q3.includes(term)) {
        for (const m of members) s[m] += 10;
        break; // count each cluster once
      }
    }
  }

  // ── Q4: Primary driver — rank × 10 (max 60 pts) ───────────────────────────
  const ranks = Q4_RANKS[a.q4];
  if (ranks) {
    for (const [m, rank] of Object.entries(ranks)) s[m] += rank * 10;
  }

  // ── Q5: Urgency signal ────────────────────────────────────────────────────
  // "30 days" boosts members who deliver hands-on implementation fast
  // "exploring" boosts educators/strategists who are right for early stage
  if (a.q5 === "In the next 30 days — I need to move") {
    s["Waziri Garuba"] += 10; s["Jasmine Brown"] += 10; s["Daniel Marama"] += 8;
  }
  if (a.q5 === "Just exploring for now") {
    s["Jackson Edens"] += 8; s["Patty Dominguez"] += 8;
  }

  // Pick highest scorer
  let best = "Patty Dominguez";
  for (const [m, score] of Object.entries(s)) {
    if (score > s[best]) best = m;
  }
  return best;
}

function isHotLead(a: Answers): boolean {
  return (
    a.q5 === "In the next 30 days — I need to move" || a.q3.length > 80
  );
}
// ──────────────────────────────────────────────────────────────────────────────

const MEMBERS: Record<
  string,
  { role: string; initials: string; description: string; photo: string | null; email: string }
> = {
  "Patty Dominguez": {
    role: "Brand Authority & AI Visibility",
    initials: "PD",
    description:
      "Patty helps service businesses close the gap between the authority they've earned and the authority buyers and AI can actually see. If your work is strong but the market isn't reflecting it — that's an authority interpretation problem, and it's exactly what she fixes.",
    photo: "/members/patty.jpg",
    email: "hello@moreleverage.io",
  },
  "Jackson Edens": {
    role: "Digital Infrastructure",
    initials: "JE",
    description:
      "Jackson builds the technical foundation — websites, automations, and integrated systems that scale without adding headcount. Your go-to when your team needs the right infrastructure underneath them.",
    photo: "/members/jackson.jpg",
    email: "jackson@essaiconsulting.com",
  },
  Sage: {
    role: "Embedded AI Engineering",
    initials: "SF",
    description:
      "Sage brings the engineering firepower of Rosenblatt — elite AI engineers embedded directly into your business. Production-ready AI in weeks, not months. The right match when your company is ready to build AI-first and needs a technical team, not a consultant.",
    photo: null,
    email: "sagesingularity@gmail.com",
  },
  "Daniel Marama": {
    role: "AI Systems Architect",
    initials: "DM",
    description:
      "Daniel helps established companies ($5M–$50M) eliminate the Hiring Tax — the 10–15% of revenue lost to manual coordination. He architects AI Operating Systems that decouple revenue growth from headcount and build exit-ready infrastructure.",
    photo: "/members/daniel.jpg",
    email: "daniel@maramamarketing.com",
  },
  "Jasmine Brown": {
    role: "Operations & Automation",
    initials: "JB",
    description:
      "Jasmine designs, implements, and optimizes the systems and workflows that power organizations — reducing admin overhead and building scalable operational foundations. The right match when your business has the revenue but not the backend to support it.",
    photo: "/members/jasmine.jpg",
    email: "jasmine@righthandsupport.com",
  },
  "Waziri Garuba": {
    role: "AI Systems & Strategy",
    initials: "WG",
    description:
      "Waziri builds custom AI systems — agents, GPTs, and multi-tool workflows — for operators ready to move beyond off-the-shelf tools and into infrastructure that runs their business.",
    photo: "/members/waziri.jpg",
    email: "waziri@harlemlabs.com",
  },
};

function MemberAvatar({
  name,
  photo,
  initials,
  size = 80,
}: {
  name: string;
  photo: string | null;
  initials: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: `2px solid ${C.border}`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: C.accentDim,
        border: `1px solid ${C.accent}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.28,
        fontWeight: 700,
        color: C.accent,
        flexShrink: 0,
        letterSpacing: "0.04em",
      }}
    >
      {initials}
    </div>
  );
}

function RadioOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? C.accentDim : C.card,
        border: `1px solid ${selected ? C.accent : C.border}`,
        borderRadius: 10,
        padding: "14px 20px",
        color: selected ? C.text : C.muted,
        fontSize: 15,
        fontWeight: selected ? 600 : 400,
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${selected ? C.accent : C.border}`,
          background: selected ? C.accent : "transparent",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
        )}
      </span>
      {label}
    </button>
  );
}

export default function QuizPage() {
  const [step, setStep] = useState(0); // 0=intro, 1-5=questions, 6=loading, 7=result
  const [answers, setAnswers] = useState<Answers>({
    name: "",
    email: "",
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });
  const [matched, setMatched] = useState("");

  function update(field: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) return answers.name.trim().length > 0 && answers.email.includes("@");
    const q = QUESTIONS[step - 1];
    const val = answers[q.key];
    return val.trim().length > 0;
  }

  async function handleSubmit() {
    const member = scoreMembers(answers);
    const hot = isHotLead(answers);
    setMatched(member);
    setStep(6);

    try {
      await fetch("/api/quiz-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, routedTo: member, hotLead: hot }),
      });
    } catch {
      // fail silently — result still shows
    }

    await new Promise((r) => setTimeout(r, 1400));
    setStep(7);
  }

  function handleNext() {
    if (step === 5) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  }

  const m = MEMBERS[matched];

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        fontFamily: "var(--font-geist), sans-serif",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link href="/">
          <img src="/logo-reverse.svg" alt="AI Think Trust" style={{ height: 32 }} />
        </Link>
      </nav>

      {/* PROGRESS BAR */}
      {step >= 1 && step <= 5 && (
        <div style={{ height: 3, background: C.border }}>
          <div
            style={{
              height: "100%",
              background: C.accent,
              width: `${(step / 5) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* STEP 0: INTRO */}
        {step === 0 && (
          <div>
            <div
              style={{
                display: "inline-block",
                background: C.accentDim,
                border: `1px solid ${C.accent}`,
                color: C.accent,
                padding: "5px 16px",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              AI Fit Quiz
            </div>
            <h1
              style={{
                fontSize: "clamp(28px, 6vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              Find Your Next Move<br />in Under 2 Minutes
            </h1>
            <p
              style={{
                color: C.muted,
                fontSize: 16,
                lineHeight: 1.7,
                marginBottom: 40,
                maxWidth: 480,
              }}
            >
              Answer 5 quick questions. We&apos;ll match you directly with the Trust member
              best positioned for your specific AI challenge — no cold outreach, no wasted calls.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: C.muted,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Your name
                </label>
                <input
                  type="text"
                  value={answers.name}
                  onChange={(e) => update("name", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
                  placeholder="First name"
                  style={{
                    width: "100%",
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    color: C.text,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: C.muted,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={answers.email}
                  onChange={(e) => update("email", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
                  placeholder="you@yourbusiness.com"
                  style={{
                    width: "100%",
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    color: C.text,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                style={{
                  marginTop: 8,
                  background: canAdvance() ? C.accent : `${C.accent}55`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "14px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: canAdvance() ? "pointer" : "not-allowed",
                  transition: "background 0.2s",
                }}
              >
                Start the Quiz →
              </button>
            </div>
          </div>
        )}

        {/* STEPS 1–5: QUESTIONS */}
        {step >= 1 && step <= 5 && (() => {
          const q = QUESTIONS[step - 1];
          const val = answers[q.key];

          return (
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                Question {step} of 5
              </p>
              <h2
                style={{
                  fontSize: "clamp(20px, 4vw, 28px)",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                  marginBottom: 32,
                }}
              >
                {q.text}
              </h2>

              {q.options ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {q.options.map((opt) => (
                    <RadioOption
                      key={opt}
                      label={opt}
                      selected={val === opt}
                      onClick={() => update(q.key, opt)}
                    />
                  ))}
                </div>
              ) : (
                <textarea
                  value={val}
                  onChange={(e) => update(q.key, e.target.value)}
                  placeholder="Describe your situation in a few sentences..."
                  rows={5}
                  style={{
                    width: "100%",
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    color: C.text,
                    fontSize: 15,
                    lineHeight: 1.6,
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 32,
                  gap: 12,
                }}
              >
                <button
                  onClick={() => setStep((s) => s - 1)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "12px 24px",
                    color: C.muted,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canAdvance()}
                  style={{
                    background: canAdvance() ? C.accent : `${C.accent}55`,
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 32px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: canAdvance() ? "pointer" : "not-allowed",
                    transition: "background 0.2s",
                  }}
                >
                  {step === 5 ? "See My Match →" : "Next →"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* STEP 6: LOADING */}
        {step === 6 && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div
              style={{
                width: 48,
                height: 48,
                border: `3px solid ${C.border}`,
                borderTop: `3px solid ${C.accent}`,
                borderRadius: "50%",
                margin: "0 auto 32px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              Matching you now...
            </h2>
            <p style={{ color: C.muted, fontSize: 15 }}>
              Analyzing your answers against the Trust collective.
            </p>
          </div>
        )}

        {/* STEP 7: RESULT */}
        {step === 7 && m && (
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.accent,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              Your Match
            </p>
            <h2
              style={{
                fontSize: "clamp(22px, 4vw, 34px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              Based on your answers,<br />you should talk to
            </h2>
            <h2
              style={{
                fontSize: "clamp(22px, 4vw, 34px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: C.accent,
                marginBottom: 36,
              }}
            >
              {matched}.
            </h2>

            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "28px",
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
                marginBottom: 28,
              }}
            >
              <MemberAvatar
                name={matched}
                photo={m.photo}
                initials={m.initials}
                size={72}
              />
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{matched}</p>
                <p
                  style={{
                    color: C.accent,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  {m.role}
                </p>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7 }}>
                  {m.description}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href={`mailto:${m.email}?subject=I took the AI Think Trust Quiz&body=Hi ${matched.split(" ")[0]},%0A%0AI just completed the AI Think Trust quiz and was matched with you. I'd love to connect.%0A%0A— ${answers.name}`}
                style={{
                  background: C.accent,
                  color: "#fff",
                  borderRadius: 8,
                  padding: "14px",
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                }}
              >
                Email {matched.split(" ")[0]} Directly →
              </a>
              <a
                href="https://us06web.zoom.us/meeting/register/W706Mw6WS4emTH3gtBufOg#/registration"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "transparent",
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "14px",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                }}
              >
                Register for the May 8th Webinar
              </a>
              <Link
                href="/"
                style={{
                  color: C.muted,
                  fontSize: 14,
                  textAlign: "center",
                  textDecoration: "none",
                  paddingTop: 4,
                  display: "block",
                }}
              >
                ← Back to aithinktrust.com
              </Link>
            </div>

            <p style={{ marginTop: 28, fontSize: 13, color: C.muted, textAlign: "center" }}>
              Your results have been saved. {matched.split(" ")[0]} will be in touch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
