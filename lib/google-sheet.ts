import { createSign } from "node:crypto";

// Appends rows to the Intake Ledger sheet using a Google service account.
// Zero-dependency JWT flow: sign an RS256 assertion, exchange it for an
// access token, then call the Sheets values.append REST endpoint.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(saEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: saEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  // Vercel env vars store the key with literal \n sequences
  const signature = b64url(signer.sign(privateKey.replace(/\\n/g, "\n")));

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export type IntakeRow = {
  timestamp: string;
  submissionId: string;
  source: "quiz" | "sivraj" | "webinar" | "manual";
  name: string;
  email: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  routedTo: string;
  hotLead: boolean;
  rawJson: string;
};

/**
 * Appends one row to the `intake` tab. Returns false (after logging) when the
 * Google env vars are not configured, so callers can treat the ledger as
 * optional during rollout.
 */
export async function appendIntakeRow(row: IntakeRow): Promise<boolean> {
  const saEmail = process.env.GOOGLE_SA_EMAIL;
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY;
  const sheetId = process.env.INTAKE_SHEET_ID;
  if (!saEmail || !privateKey || !sheetId) {
    console.warn("Sheet append skipped — GOOGLE_SA_EMAIL / GOOGLE_SA_PRIVATE_KEY / INTAKE_SHEET_ID not all set");
    return false;
  }

  const token = await getAccessToken(saEmail, privateKey);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      "intake!A:M"
    )}:append?valueInputOption=RAW`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [
          [
            row.timestamp,
            row.submissionId,
            row.source,
            row.name,
            row.email,
            row.q1,
            row.q2,
            row.q3,
            row.q4,
            row.q5,
            row.routedTo,
            row.hotLead ? "TRUE" : "FALSE",
            row.rawJson,
          ],
        ],
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Sheet append failed: ${await res.text()}`);
  }
  return true;
}
