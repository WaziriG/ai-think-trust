import { Resend } from "resend";

const MEMBER_EMAILS: Record<string, string> = {
  "Patty Dominguez": "hello@moreleverage.io",
  "Jackson Edens":   "jackson@essaiconsulting.com",
  "Sage":            "sagesingularity@gmail.com",
  "Daniel Marama":   "daniel@maramamarketing.com",
  "Jasmine Brown":   "jasmine@righthandsupport.com",
  "Waziri Garuba":   "waziri@harlemlabs.com",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Airtable logging ────────────────────────────────────────────────────
    const airtableKey = process.env.AIRTABLE_API_KEY;
    if (!airtableKey) {
      return Response.json({ error: "Not configured" }, { status: 500 });
    }

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
            Name: body.name,
            Email: body.email,
            "Q1 — Business Size": body.q1,
            "Q2 — AI Experience": body.q2,
            "Q3 — Biggest Challenge": body.q3,
            "Q4 — Primary Goal": body.q4,
            "Q5 — Timeline": body.q5,
            "Routed To": body.routedTo,
            "Hot Lead": body.hotLead,
            "Submitted At": new Date().toISOString(),
          },
        }),
      }
    );

    if (!airtableRes.ok) {
      console.error("Airtable error:", await airtableRes.text());
    }

    // ── Member email notification ────────────────────────────────────────────
    const resendKey = process.env.RESEND_API_KEY;
    const memberEmail = MEMBER_EMAILS[body.routedTo];

    if (resendKey && memberEmail) {
      const resend = new Resend(resendKey);
      const hotFlag = body.hotLead ? "🔥 HOT LEAD — " : "";

      const emailResult = await resend.emails.send({
        from: "AI Think Trust Quiz <survey@harlemlabs.com>",
        to: memberEmail,
        bcc: "waziri@harlemlabs.com",
        replyTo: body.email,
        subject: `${hotFlag}New Quiz Match: ${body.name} was matched to you`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#0a0a0a;padding:20px 24px;border-radius:8px 8px 0 0;">
              <p style="color:#e53935;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px;">AI Think Trust — Quiz Match</p>
              <h1 style="color:#f5f5f5;font-size:20px;font-weight:800;margin:0;">${body.name} was matched to you</h1>
            </div>
            <div style="background:#fff;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
              ${body.hotLead ? `<div style="background:#fff3cd;border:1px solid #f39c12;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:13px;font-weight:700;color:#856404;">🔥 Hot Lead — ready to move in 30 days or shared a detailed challenge</div>` : ""}

              <div style="background:#f0f7ff;border:1px solid #c3d9f5;border-radius:6px;padding:12px 16px;margin-bottom:20px;">
                <p style="font-size:11px;color:#666;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Matched to</p>
                <p style="font-size:15px;font-weight:800;color:#1a1a1a;margin:0;">${body.routedTo}</p>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;width:140px;">Name</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;">${body.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">Email</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;"><a href="mailto:${body.email}" style="color:#e53935;">${body.email}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">Business size</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${body.q1}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">AI experience</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${body.q2}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">Primary goal</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${body.q4}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;">Timeline</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;">${body.q5}</td>
                </tr>
              </table>

              <p style="font-size:12px;color:#888;margin:0 0 6px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Their biggest challenge</p>
              <div style="background:#f7f7f5;border-left:3px solid #e53935;padding:12px 16px;border-radius:0 6px 6px 0;font-size:13px;line-height:1.6;color:#333;margin-bottom:24px;">${body.q3 || "<em style='color:#aaa'>Not provided</em>"}</div>

              <a href="mailto:${body.email}" style="display:inline-block;background:#e53935;color:#fff;padding:11px 24px;border-radius:6px;font-size:13px;font-weight:700;text-decoration:none;">Reply to ${body.name.split(" ")[0]} →</a>
            </div>
            <p style="font-size:11px;color:#aaa;text-align:center;margin-top:16px;">AI Think Trust · aithinktrust.com</p>
          </div>
        `,
      });

      if (emailResult.error) {
        console.error("Resend error:", JSON.stringify(emailResult.error));
      } else {
        console.log("Email sent to", memberEmail, "id:", emailResult.data?.id);
      }
    } else {
      console.warn("Email skipped — resendKey:", !!resendKey, "memberEmail:", memberEmail);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
