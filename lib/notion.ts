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

// Notion select options may not contain commas and cap at 100 chars —
// e.g. quiz option "Build something custom (GPT, agent, workflow)" is stored
// as "Build something custom (GPT / agent / workflow)".
function selectValue(value: string) {
  return { select: { name: value.replace(/, /g, " / ").replace(/,/g, " /").slice(0, 100) } };
}

function sharedProperties(lead: LeadPayload) {
  const props: Record<string, unknown> = {
    Name: { title: [{ text: { content: lead.name } }] },
    Email: { email: lead.email },
    "Submission ID": { rich_text: richText(lead.submissionId) },
    Challenge: { rich_text: richText(lead.q3 || "—") },
    "Last Activity": { date: { start: new Date().toISOString() } },
  };
  // Empty select values are invalid in the Notion API — set only what we have
  if (lead.routedTo) props["Matched Member"] = selectValue(lead.routedTo);
  if (lead.q1) props["Business Size"] = selectValue(lead.q1);
  if (lead.q2) props["AI Experience"] = selectValue(lead.q2);
  if (lead.q4) props["Primary Goal"] = selectValue(lead.q4);
  if (lead.q5) props["Timeline"] = selectValue(lead.q5);
  return props;
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
