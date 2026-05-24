"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useClaudeChat, type Message } from "./_hooks/useClaudeChat";
import { useVoiceRecording } from "./_hooks/useVoiceRecording";

const C = {
  accent: "#e53935",
  accentDim: "rgba(229,57,53,0.12)",
  bg: "#0a0a0a",
  card: "#161616",
  border: "#2a2a2a",
  text: "#f5f5f5",
  muted: "#888888",
};

// ─── ORB ────────────────────────────────────────────────────────────────────

function VoiceOrb({
  isListening,
  isProcessing,
  isSpeaking,
  onClick,
}: {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}) {
  const active = isListening || isSpeaking;
  const disabled = isProcessing;

  const borderColor = isListening
    ? C.accent
    : isSpeaking
    ? C.accent
    : C.border;

  const boxShadow = isListening
    ? `0 0 0 6px ${C.accentDim}, 0 0 24px rgba(229,57,53,0.25)`
    : isSpeaking
    ? `0 0 0 4px ${C.accentDim}`
    : "none";

  const animation = isProcessing
    ? "attspin 1.2s linear infinite"
    : isSpeaking
    ? "attpulse 1.4s ease-in-out infinite"
    : "none";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 88,
        height: 88,
        borderRadius: "50%",
        background: active ? C.accentDim : C.card,
        border: `2px solid ${borderColor}`,
        boxShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
        animation,
        flexShrink: 0,
        outline: "none",
      }}
      aria-label={isListening ? "Stop listening" : "Start speaking"}
    >
      {/* icon */}
      {isSpeaking ? (
        <SpeakerIcon color={C.accent} />
      ) : isListening ? (
        <MicActiveIcon color={C.accent} />
      ) : (
        <MicIcon color={C.muted} />
      )}
    </button>
  );
}

function MicIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicActiveIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SpeakerIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

// ─── MESSAGE CARD ────────────────────────────────────────────────────────────

function MessageCard({ message }: { message: Message }) {
  const isUser = message.sender === "user";
  const isEmpty = message.content === "" && !isUser;

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{
          maxWidth: 560,
          background: C.accent,
          color: "#ffffff",
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
          SIVRAJ
        </div>
        {isEmpty ? (
          <div style={{ display: "flex", gap: 4, alignItems: "center", height: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "attdot 1.2s ease-in-out infinite" }} />
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "attdot 1.2s ease-in-out 0.2s infinite" }} />
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: "attdot 1.2s ease-in-out 0.4s infinite" }} />
          </div>
        ) : (
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text, margin: 0 }}>
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleUpdateMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content } : m))
    );
  }, []);

  const handleError = useCallback((err: string) => {
    setError(err);
    setTimeout(() => setError(null), 5000);
  }, []);

  const { isProcessing, isSpeaking, sendMessage } = useClaudeChat({
    onMessage: handleMessage,
    onUpdateMessage: handleUpdateMessage,
    onError: handleError,
  });

  const { isListening, toggleListening } = useVoiceRecording({
    onTranscript: sendMessage,
    onError: handleError,
  });

  // auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const statusText = isProcessing
    ? "Thinking..."
    : isSpeaking
    ? "Speaking..."
    : isListening
    ? "Listening..."
    : "Tap to speak";

  return (
    <>
      <style>{`
        @keyframes attspin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes attpulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(229,57,53,0.12); }
          50% { box-shadow: 0 0 0 10px rgba(229,57,53,0.04); }
        }
        @keyframes attdot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        button:hover:not(:disabled) { opacity: 0.92; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-geist), system-ui, sans-serif",
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
              <Link href="/#webinar" style={{ color: C.muted, fontSize: 14, textDecoration: "none" }}>
                Webinar
              </Link>
              <Link href="/#members" style={{ color: C.muted, fontSize: 14, textDecoration: "none" }}>
                Members
              </Link>
              <Link href="/quiz" style={{ color: C.muted, fontSize: 14, textDecoration: "none" }}>
                Quiz
              </Link>
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

        {/* PAGE HEADER */}
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
            Ask the Trust
          </h1>
          <p style={{
            color: C.muted,
            fontSize: 16,
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Speak your question. SIVRAJ draws on the full AI Think Trust knowledge base to give you a clear, direct answer.
          </p>
        </section>

        {/* MAIN — messages + voice input */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* MESSAGES */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "32px 24px",
            }}
          >
            <div style={{ maxWidth: 720, margin: "0 auto" }}>

              {messages.length === 0 ? (
                /* empty state */
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
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ color: C.text, fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                      No conversation yet
                    </p>
                    <p style={{ color: C.muted, fontSize: 14 }}>
                      Tap the button below and ask your first question.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageCard key={msg.id} message={msg} />
                ))
              )}

            </div>
          </div>

          {/* VOICE INPUT PANEL */}
          <div style={{
            borderTop: `1px solid ${C.border}`,
            background: "rgba(10,10,10,0.96)",
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}>

            {/* error toast */}
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
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              onClick={toggleListening}
            />

            <p style={{
              color: isListening || isSpeaking ? C.accent : C.muted,
              fontSize: 13,
              fontWeight: isListening || isSpeaking ? 600 : 400,
              letterSpacing: "0.04em",
              transition: "color 0.2s",
            }}>
              {statusText}
            </p>

            <p style={{ color: C.border, fontSize: 11, textAlign: "center" }}>
              Chrome or Edge recommended &nbsp;·&nbsp; Mic access required
            </p>

          </div>
        </div>

      </div>
    </>
  );
}
