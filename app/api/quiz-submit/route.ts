import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import { appendIntakeRow } from "@/lib/google-sheet";
import { upsertLead } from "@/lib/notion";
import { TRUST_MEMBERS } from "@/lib/members";

// Capture order: Sheet (ledger) → Notion (pipeline) → legacy Airtable (until
// AIRTABLE_API_KEY is retired) → member email. Each sink is independent —
// one failing never blocks the others or the quiz UX.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, q1, q2, q3, q4, q5, routedTo, hotLead } = body as {
      name?: string;
      email?: string;
      q1?: string;
      q2?: string;
      q3?: string;
      q4?: string;
      q5?: string;
      routedTo?: string;
      hotLead?: boolean;
    };

    if (!name || !email || !routedTo) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const submissionId = randomUUID();
    const timestamp = new Date().toISOString();
    const lead = {
      submissionId,
      name,
      email,
      q1: q1 ?? "",
      q2: q2 ?? "",
      q3: q3 ?? "",
      q4: q4 ?? "",
      q5: q5 ?? "",
      routedTo,
      hotLead: hotLead === true,
    };

    // ── Layer 1: Google Sheet intake ledger ─────────────────────────────────
    try {
      await appendIntakeRow({
        timestamp,
        submissionId,
        source: "quiz",
        name: lead.name,
        email: lead.email,
        q1: lead.q1,
        q2: lead.q2,
        q3: lead.q3,
        q4: lead.q4,
        q5: lead.q5,
        routedTo: lead.routedTo,
        hotLead: lead.hotLead,
        rawJson: JSON.stringify(body),
      });
    } catch (err) {
      console.error("Sheet ledger error:", err);
    }

    // ── Layer 2: Notion conversion pipeline ─────────────────────────────────
    try {
      await upsertLead(lead);
    } catch (err) {
      console.error("Notion pipeline error:", err);
    }

    // ── Legacy: Airtable dual-write (remove once AIRTABLE_API_KEY retired) ──
    const airtableKey = process.env.AIRTABLE_API_KEY;
    if (airtableKey) {
      try {
        const airtableRes = await fetch(
          "https://api.airtable.com/v0/appxB1VwbcV8JmYfr/tbl2Z9ucmKMbtDZxP",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${airtableKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                Name: lead.name,
                Email: lead.email,
                "Q1 — Business Size": lead.q1,
                "Q2 — AI Experience": lead.q2,
                "Q3 — Biggest Challenge": lead.q3,
                "Q4 — Primary Goal": lead.q4,
                "Q5 — Timeline": lead.q5,
                "Routed To": lead.routedTo,
                "Hot Lead": lead.hotLead,
                "Submitted At": timestamp,
              },
            }),
          }
        );
        if (!airtableRes.ok) {
          console.error("Airtable error:", await airtableRes.text());
        }
      } catch (err) {
        console.error("Airtable error:", err);
      }
    }

    // ── Member email notification ────────────────────────────────────────────
    const resendKey = process.env.RESEND_API_KEY;
    const member = TRUST_MEMBERS[lead.routedTo];

    if (resendKey && member) {
      const resend = new Resend(resendKey);
      const hotFlag = lead.hotLead ? "🔥 HOT LEAD — " : "";
      const bookingBlock = member.bookingUrl
        ? `<a href="${member.bookingUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:11px 24px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;margin-left:8px;">Send booking link →</a>`
        : "";

      const emailResult = await resend.emails.send({
        from: "AI Think Trust Quiz <survey@harlemlabs.com>",
        to: member.email,
        bcc: "waziri@harlemlabs.com",
        replyTo: lead.email,
        subject: `${hotFlag}New Quiz Match: ${lead.name} was matched to you`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#0a0a0a;padding:20px 24px;border-radius:8px 8px 0 0;">
              <p style="color:#e53935;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px;">AI Think Trust — Quiz Match</p>
              <h1 style="color:#f5f5f5;font-size:20px;font-weight:800;margin:0;">${lead.name} was matched to you</h1>
            </div>
            <div style="background:#fff;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
              ${lead.hotLead ? `<div style="background:#fff3cd;border:1px solid #f39c12;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:13px;font-weight:700;color:#856404;">🔥 Hot Lead — ready to move in 30 days or shared a detailed challenge</div>` : ""}

              <div style="background:#f0f7ff;border:1px solid #c3d9f5;border-radius:6px;padding:12px 16px;margin-bottom:20px;">
                <p style="font-size:11px;color:#666;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Matched to</p>
                <p style="font-size:15px;font-weight:800;color:#1a1a1a;margin:0;">${lead.routedTo}</p>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;width:140px;">Name</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;">${lead.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">Email</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;"><a href="mailto:${lead.email}" style="color:#e53935;">${lead.email}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">Business size</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${lead.q1}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">AI experience</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${lead.q2}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">Primary goal</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${lead.q4}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">Timeline</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${lead.q5}</td>
                </tr>
              </table>

              <p style="font-size:12px;color:#888;margin:0 0 6px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Their biggest challenge</p>
              <div style="background:#f7f7f5;border-left:3px solid #e53935;padding:12px 16px;border-radius:0 6px 6px 0;font-size:13px;line-height:1.6;color:#333;margin-bottom:24px;">${lead.q3 || "<em style='color:#aaa'>Not provided</em>"}</div>

              <a href="mailto:${lead.email}" style="display:inline-block;background:#e53935;color:#fff;padding:11px 24px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">Reply to ${lead.name.split(" ")[0]} →</a>${bookingBlock}
            </div>
            <p style="font-size:11px;color:#aaa;text-align:center;margin-top:16px;">AI Think Trust · aithinktrust.com</p>
          </div>
        `,
      });

      if (emailResult.error) {
        console.error("Resend error:", JSON.stringify(emailResult.error));
      } else {
        console.log("Email sent to", member.email, "id:", emailResult.data?.id);
      }
    } else {
      console.warn("Email skipped — resendKey:", !!resendKey, "member:", lead.routedTo);
    }

    return Response.json({ ok: true, submissionId });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
