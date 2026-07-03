// Upserts leads into the ATT Conversion Pipeline database (deduped by email).
// New lead  → page created at Stage "Matched", Cadence Step "Day 0",
//             Follow-up Due = +1 day (hot) or +3 days (standard).
// Repeat    → answers refreshed, Submissions incremented, Last Activity bumped,
//             Hot Lead can only escalate; Stage and cadence are left alone so
//             a re-taken quiz never resets a lead mid-pipeline.

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export type LeadPayload = {
  submissionId: string;
  name: string;
  email: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  routedTo: string;
  hotLead: boolean;
};

type NotionPage = {
  id: string;
  properties: {
    Submissions?: { number: number | null };
    "Hot Lead"?: { checkbox: boolean };
  };
};

function headers(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function richText(content: string) {
  return [{ text: { content: content.slice(0, 1900) } }];
}

function sharedProperties(lead: LeadPayload) {
  return {
    Name: { title: [{ text: { content: lead.name } }] },
    Email: { email: lead.email },
    "Submission ID": { rich_text: richText(lead.submissionId) },
    "Matched Member": { select: { name: lead.routedTo } },
    "Business Size": { select: { name: lead.q1 } },
    "AI Experience": { select: { name: lead.q2 } },
    Challenge: { rich_text: richText(lead.q3 || "—") },
    "Primary Goal": { select: { name: lead.q4 } },
    Timeline: { select: { name: lead.q5 } },
    "Last Activity": { date: { start: new Date().toISOString() } },
  };
}

export async function upsertLead(lead: LeadPayload): Promise<boolean> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_PIPELINE_DB_ID;
  if (!apiKey || !databaseId) {
    console.warn("Notion upsert skipped — NOTION_API_KEY / NOTION_PIPELINE_DB_ID not set");
    return false;
  }

  const queryRes = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      filter: { property: "Email", email: { equals: lead.email } },
      page_size: 1,
    }),
  });
  if (!queryRes.ok) {
    throw new Error(`Notion query failed: ${await queryRes.text()}`);
  }
  const existing = ((await queryRes.json()) as { results: NotionPage[] }).results[0];

  if (existing) {
    const submissions = existing.properties.Submissions?.number ?? 1;
    const wasHot = existing.properties["Hot Lead"]?.checkbox ?? false;
    const updateRes = await fetch(`${NOTION_API}/pages/${existing.id}`, {
      method: "PATCH",
      headers: headers(apiKey),
      body: JSON.stringify({
        properties: {
          ...sharedProperties(lead),
          "Hot Lead": { checkbox: wasHot || lead.hotLead },
          Submissions: { number: submissions + 1 },
        },
      }),
    });
    if (!updateRes.ok) {
      throw new Error(`Notion update failed: ${await updateRes.text()}`);
    }
    return true;
  }

  const now = new Date();
  const followUpDue = new Date(now);
  followUpDue.setDate(now.getDate() + (lead.hotLead ? 1 : 3));

  const createRes = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        ...sharedProperties(lead),
        "Hot Lead": { checkbox: lead.hotLead },
        Stage: { select: { name: "Matched" } },
        Source: { select: { name: "Quiz" } },
        "Cadence Step": { select: { name: "Day 0" } },
        "Follow-up Due": { date: { start: followUpDue.toISOString().slice(0, 10) } },
        "First Seen": { date: { start: now.toISOString() } },
        Submissions: { number: 1 },
      },
    }),
  });
  if (!createRes.ok) {
    throw new Error(`Notion create failed: ${await createRes.text()}`);
  }
  return true;
}
