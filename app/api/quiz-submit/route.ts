export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiKey = process.env.AIRTABLE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Not configured" }, { status: 500 });
    }

    const res = await fetch(
      "https://api.airtable.com/v0/appxB1VwbcV8JmYfr/tbl2Z9ucmKMbtDZxP",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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

    if (!res.ok) {
      console.error("Airtable error:", await res.text());
      return Response.json({ error: "Save failed" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
