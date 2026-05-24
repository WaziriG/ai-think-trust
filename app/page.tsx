const members = [
  { initials: "PD", name: "Patty Dominguez", role: "Brand Authority & AI Visibility", photo: "/members/patty.jpg" },
  { initials: "JA", name: "Jackson", role: "Digital Infrastructure", photo: "/members/jackson.jpg" },
  { initials: "SF", name: "Sage", role: "Embedded AI Engineering", photo: "/members/sage.jpg" },
  { initials: "DA", name: "Daniel", role: "Analytics & Metrics", photo: "/members/daniel.jpg" },
  { initials: "JB", name: "Jasmine Brown", role: "Operations & Automation", photo: "/members/jasmine.jpg" },
  { initials: "WG", name: "Waziri Garuba", role: "AI Systems & Strategy", photo: "/members/waziri.jpg" },
];

const agendaItems = [
  { time: "0:00–0:05", label: "Welcome & Housekeeping" },
  { time: "0:05–0:20", label: "Meet the Trust — Member Introductions" },
  { time: "0:20–0:35", label: "Live Demo: AI Tools in Action" },
  { time: "0:35–0:52", label: "Pain Killer Session — Live Problem Solving" },
  { time: "0:52–0:58", label: "Pain Point Collection & Next Steps" },
  { time: "0:58–1:00", label: "Close & AI Entry Quiz CTA" },
];

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(12px)",
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
          <img src="/logo-reverse.svg" alt="AI Think Trust" style={{ height: 36 }} />
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="#webinar" style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none" }}>Webinar</a>
            <a href="#members" style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none" }}>Members</a>
            <a href="/advisor" style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none" }}>AI Advisor</a>
            <a
              href="https://www.youtube.com/@aithinktrust"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none" }}
            >
              YouTube
            </a>
            <a
              href="https://www.linkedin.com/company/ai-think-trust/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
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

      {/* HERO */}
      <section style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "100px 24px 80px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block",
          background: "var(--accent-dim)",
          border: "1px solid var(--accent)",
          color: "var(--accent)",
          padding: "6px 18px",
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.04em",
          marginBottom: 36,
        }}>
          INTRODUCTORY WEBINAR — MAY 8, 2026
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 7vw, 76px)",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: "var(--text)",
          marginBottom: 12,
        }}>
          We Went Down
        </h1>
        <h1 style={{
          fontSize: "clamp(40px, 7vw, 76px)",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: "var(--accent)",
          marginBottom: 28,
        }}>
          the Rabbit Hole.
        </h1>

        <p style={{
          fontSize: "clamp(17px, 2.5vw, 20px)",
          color: "var(--muted)",
          maxWidth: 620,
          margin: "0 auto 48px",
          lineHeight: 1.7,
        }}>
          The AI Think Trust is a collective of AI-forward operators, strategists, and builders
          dedicated to helping business owners apply artificial intelligence — without the noise,
          the hype, or the wasted time.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#webinar"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
              padding: "14px 32px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Register for May 8th Webinar
          </a>
          <a
            href="/quiz"
            style={{
              background: "transparent",
              color: "var(--text)",
              border: "1px solid var(--border)",
              padding: "14px 32px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Take the AI Entry Quiz
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "var(--accent)",
            textTransform: "uppercase",
            marginBottom: 20,
            textAlign: "center",
          }}>
            About the Trust
          </p>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            textAlign: "center",
            marginBottom: 64,
            color: "var(--text)",
          }}>
            A Collective Built for Operators, Not Observers
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {[
              {
                heading: "Curated, Not Comprehensive",
                body: "We don't chase every new AI tool. We vet, test, and apply the ones that actually move the needle for real businesses — then bring you the ones worth your time.",
              },
              {
                heading: "Practitioners, Not Theorists",
                body: "Every Trust member works in the field. The insights we share come from live client engagements, real-world deployments, and hard-won lessons — not whitepapers.",
              },
              {
                heading: "Your Fastest Path to the Right Expert",
                body: "The AI Entry Quiz routes you directly to the Trust member best suited for your specific situation. No cold outreach. No wasted calls. Matched from day one.",
              },
            ].map((card) => (
              <div
                key={card.heading}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "32px 28px",
                }}
              >
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 12,
                  letterSpacing: "-0.01em",
                }}>
                  {card.heading}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WEBINAR */}
      <section id="webinar" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 48,
            alignItems: "start",
          }}>
            <div>
              <p style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "var(--accent)",
                textTransform: "uppercase",
                marginBottom: 20,
              }}>
                Live Event
              </p>
              <h2 style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 20,
                color: "var(--text)",
              }}>
                Introductory Webinar
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {[
                  { label: "Date", value: "Thursday, May 8, 2026" },
                  { label: "Platform", value: "Zoom — registration link coming soon" },
                  { label: "Duration", value: "60 minutes" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", gap: 12, fontSize: 15 }}>
                    <span style={{ color: "var(--muted)", minWidth: 80 }}>{item.label}</span>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                Meet the full Trust, watch AI tools work live, and bring your real business problems.
                Attendees leave with a free AI tool and a direct path to the right expert for their situation.
              </p>
              <a
                href="https://us06web.zoom.us/meeting/register/W706Mw6WS4emTH3gtBufOg#/registration"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                  padding: "13px 28px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  display: "inline-block",
                  textDecoration: "none",
                }}
              >
                Register for the Webinar
              </a>
            </div>

            <div style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "32px 28px",
            }}>
              <p style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "var(--muted)",
                textTransform: "uppercase",
                marginBottom: 20,
              }}>
                Agenda at a Glance
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {agendaItems.map((item, i) => (
                  <div
                    key={item.time}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: "14px 0",
                      borderBottom: i < agendaItems.length - 1 ? "1px solid var(--border)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--accent)",
                      minWidth: 80,
                    }}>
                      {item.time}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--text)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERS */}
      <section
        id="members"
        style={{ borderTop: "1px solid var(--border)", padding: "80px 24px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "var(--accent)",
            textTransform: "uppercase",
            marginBottom: 20,
            textAlign: "center",
          }}>
            The Collective
          </p>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            textAlign: "center",
            marginBottom: 12,
            color: "var(--text)",
          }}>
            Meet the Trust
          </h2>
          <p style={{
            color: "var(--muted)",
            fontSize: 16,
            textAlign: "center",
            marginBottom: 56,
          }}>
            Six practitioners. One collective. Zero hype.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
          }}>
            {members.map((m) => (
              <div
                key={m.name}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "28px 24px",
                  textAlign: "center",
                }}
              >
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto 16px",
                      display: "block",
                      border: "2px solid var(--border)",
                    }}
                  />
                ) : (
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--accent)",
                    letterSpacing: "0.04em",
                  }}>
                    {m.initials}
                  </div>
                )}
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>
                  {m.name}
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUIZ CTA */}
      <section
        id="quiz"
        style={{ borderTop: "1px solid var(--border)", padding: "80px 24px" }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            background: "var(--accent-dim)",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
            padding: "6px 18px",
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}>
            AI Entry Quiz
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 20,
            color: "var(--text)",
          }}>
            Not Sure Where to Start?
          </h2>
          <p style={{
            color: "var(--muted)",
            fontSize: 17,
            lineHeight: 1.7,
            marginBottom: 36,
          }}>
            Answer a few questions about your business and we will match you directly with
            the Trust member best positioned to solve your specific AI challenge.
          </p>
          <a
            href="/quiz"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
              padding: "15px 36px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            Take the AI Fit Quiz →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px" }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <img src="/logo-reverse.svg" alt="AI Think Trust" style={{ height: 28 }} />
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a
              href="https://www.youtube.com/@aithinktrust"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none" }}
            >
              YouTube
            </a>
            <a
              href="https://www.linkedin.com/company/ai-think-trust/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none" }}
            >
              LinkedIn
            </a>
          </div>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            &copy; {new Date().getFullYear()} AI Think Trust. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
