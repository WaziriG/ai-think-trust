"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

const AGENT_ID = "agent_1901k1trym39fhhvkr3ecs47nyj4";

const MEMBER_PHOTOS = [
  "/members/patty.jpg",
  "/members/jackson.jpg",
  "/members/sage.jpg",
  "/members/daniel.jpg",
  "/members/jasmine.jpg",
  "/members/waziri.jpg",
];

const C = {
  accent: "#e53935",
  accentDim: "rgba(229,57,53,0.12)",
  bg: "#0a0a0a",
  card: "#161616",
  border: "#2a2a2a",
  text: "#f5f5f5",
  muted: "#888888",
};

interface Message {
  id: string;
  content: string;
  sender: "user" | "sivraj";
  timestamp: Date;
}

// ─── BACKGROUND MONTAGE ──────────────────────────────────────────────────────

function BackgroundMontage() {
  return (
    <>
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        display: "flex",
        overflow: "hidden",
      }}>
        {MEMBER_PHOTOS.map((src, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              filter: "grayscale(100%) blur(3px)",
              transform: "scale(1.06)",
            }}
          />
        ))}
      </div>
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: "linear-gradient(to bottom, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.88) 55%, rgba(10,10,10,0.97) 100%)",
      }} />
    </>
  );
}

// ─── OROB ───────────────────────────────────────────────────────────────────

function VoiceOrb({
  isConnected,
  isConnecting,
  isSpeaking,
  onClick,
}: {
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}) {
  const borderColor = isSpeaking || isConnected ? C.accent : C.border;
  const boxShadow = isSpeaking
    ? `0 0 0 8px ${C.accentDim}, 0 0 32px rgba(229,57,53,0.2)`
    : isConnected
    ? `0 0 0 5px ${C.accentDim}`
    : "none";
  const animation = isConnecting
    ? "attspin 1.2s linear infinite"
    : isSpeaking
    ? "attpulse 1.2s ease-in-out infinite"
    : "none";

  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      style={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: isConnected ? C.accentDim : C.card,
        border: `2px solid ${borderColor}`,
        boxShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isConnecting ? "not-allowed" : "pointer",
        opacity: isConnecting ? 0.5 : 1,
        transition: "border-color 0.25s, box-shadow 0.25s, background 0.25s",
        animation,
        flexShrink: 0,
        outline: "none",
      }}
      aria-label={isConnected ? "End conversation" : "Start conversation"}
    >
      {isSpeaking ? (
        <SpeakerIcon color={C.accent} />
      ) : isConnected ? (
        <MicActiveIcon color={C.accent} />
      ) : (
        <MicIcon color={isConnecting ? C.accent : C.muted} />
      )}
    </button>
  );
}

function MicIcon({ color }: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicActiveIcon({ color }: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SpeakerIcon({ color }: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

// ─── MESSAGE ─────────────────────────────────────────────────────────────────

function MessageCard({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{
          maxWidth: 560,
          background: C.accent,
          color: "#fff",
          padding: "12px 18px",
          borderRadius: "16px 16px 4px 16px",
          fontSize: 15,
          lineHeight: 1.6,
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
      <div style={{
        maxWidth: 620,
        background: C.card,
        border: `1px solid ${C.border}`,
        padding: "16px 20px",
        borderRadius: "4px 16px 16px 16px",
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: C.accent,
          marginBottom: 8,
          textTransform: "uppercase",
        }}>
          SIVRAJ — AI Think Trust
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text, margin: 0 }}>
          {message.content}
        </p>
      </div>
    </div>
  );
}

// ─── INNER (needs ConversationProvider context) ───────────────────────────────

function AdvisorInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => setError(null),
    onDisconnect: () => {},
    onMessage: (payload) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: payload.message,
          sender: payload.role === "user" ? "user" : "sivraj",
          timestamp: new Date(),
        },
      ]);
    },
    onError: (err) => {
      setError(typeof err === "string" ? err : "Connection error. Please try again.");
    },
  });

  const toggleConversation = useCallback(async () => {
    if (conversation.status === "connected") {
      await conversation.endSession();
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
      });
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Microphone access denied — please enable it in your browser settings.");
      } else {
        setError("Could not connect. Please try again.");
      }
    }
  }, [conversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(t);
  }, [error]);

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";
  const isSpeaking = conversation.isSpeaking ?? false;

  const statusText = isConnecting
    ? "Connecting..."
    : isSpeaking
    ? "SIVRAJ is speaking..."
    : isConnected
    ? "Listening — speak naturally"
    : "Tap to start a conversation";

  return (
    <div style={{
      background: "transparent",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-geist), system-ui, sans-serif",
      position: "relative",
      zIndex: 2,
    }}>

      {/* NAV */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: `1px solid ${C.border}`,
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-reverse.svg" alt="AI Think Trust" style={{ height: 34 }} />
          </Link>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/#webinar" style={{ color: C.muted, fontSize: 14, textDecoration: "none" }}>Webinar</Link>
            <Link href="/#members" style={{ color: C.muted, fontSize: 14, textDecoration: "none" }}>Members</Link>
            <Link href="/quiz" style={{ color: C.muted, fontSize: 14, textDecoration: "none" }}>Quiz</Link>
            <a
              href="https://www.linkedin.com/company/ai-think-trust/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: C.accentDim,
                color: C.accent,
                border: `1px solid ${C.accent}`,
                padding: "6px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "40px 24px 32px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block",
          background: C.accentDim,
          border: `1px solid ${C.accent}`,
          color: C.accent,
          padding: "5px 16px",
          borderRadius: 100,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 20,
        }}>
          AI Advisor
        </div>
        <h1 style={{
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: C.text,
          marginBottom: 10,
          lineHeight: 1.1,
        }}>
          Talk to SIVRAJ
        </h1>
        <p style={{
          color: C.muted,
          fontSize: 16,
          maxWidth: 480,
          margin: "0 auto",
          lineHeight: 1.6,
        }}>
          Ask anything about AI for your business. SIVRAJ knows the full Trust and will connect you with the right person.
        </p>
      </section>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* MESSAGES */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {messages.length === 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                textAlign: "center",
                gap: 16,
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: C.accentDim,
                  border: `1px solid ${C.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: C.accent,
                  letterSpacing: "0.04em",
                }}>
                  AI
                </div>
                <div>
                  <p style={{ color: C.text, fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                    SIVRAJ is ready
                  </p>
                  <p style={{ color: C.muted, fontSize: 14 }}>
                    Tap the button below and start speaking. No button-per-turn — just talk.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => <MessageCard key={msg.id} message={msg} />)
            )}
          </div>
        </div>

        {/* VOICE PANEL */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          background: "rgba(10,10,10,0.96)",
          padding: "28px 24px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}>
          {error && (
            <div style={{
              background: C.accentDim,
              border: `1px solid ${C.accent}`,
              color: C.accent,
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 13,
              maxWidth: 480,
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <VoiceOrb
            isConnected={isConnected}
            isConnecting={isConnecting}
            isSpeaking={isSpeaking}
            onClick={toggleConversation}
          />

          <p style={{
            color: isConnected ? (isSpeaking ? C.accent : "#6ee7b7") : C.muted,
            fontSize: 13,
            fontWeight: isConnected ? 600 : 400,
            letterSpacing: "0.04em",
            transition: "color 0.3s",
            textAlign: "center",
          }}>
            {statusText}
          </p>

          {isConnected && (
            <button
              onClick={toggleConversation}
              style={{
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.muted,
                padding: "6px 20px",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              End conversation
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── ROOT (provides context) ──────────────────────────────────────────────────

export default function AdvisorClient() {
  return (
    <>
      <style>{`
        @keyframes attspin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes attpulse {
          0%, 100% { box-shadow: 0 0 0 5px rgba(229,57,53,0.12); }
          50% { box-shadow: 0 0 0 14px rgba(229,57,53,0.04); }
        }
        * { box-sizing: border-box; }
      `}</style>
      <BackgroundMontage />
      <ConversationProvider>
        <AdvisorInner />
      </ConversationProvider>
    </>
  );
}
