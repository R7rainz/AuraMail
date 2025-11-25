import fs from "fs";
import path from "path";
import { OAuth2Client } from "google-auth-library";
import { oAuth2Client } from "../auth/google";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");

// Rate limiting constants
const API_DELAY = 100; // ms between API calls
const MAX_CONCURRENT_REQUESTS = 5;
const REQUEST_TIMEOUT = 30000; // 30 seconds

// using shared OAuth2 client from ../auth/google

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface EmailMessage {
  id: string;
  subject?: string;
  from?: string;
  date?: string;
  snippet: string;
  body?: string;
  threadId?: string;
  labelIds?: string[];
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  mimeType: string;
  body?: {
    data?: string;
    size?: number;
  };
  parts?: GmailMessagePart[];
}

// Note: using shared `oAuth2Client` exported from `../auth/google`

//handling OAuth callback and save token
export async function handleOAuthCallback(code: string): Promise<void> {
  try {
    const client = oAuth2Client;
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log("Token Stored Successfully At: ", TOKEN_PATH);
  } catch (error) {
    console.error("Failed to handle OAuth callback: ", error);
    throw error;
  }
}

//authorize gmail api with proper token refresh handling
export async function authorize(): Promise<OAuth2Client> {
  try {
    const client = oAuth2Client;

    if (fs.existsSync(TOKEN_PATH)) {
      try {
        const tokenData = fs.readFileSync(TOKEN_PATH, "utf8");
        const token = JSON.parse(tokenData);

        client.setCredentials(token);

        try {
          await client.getAccessToken();
          console.log("Using existing token");
          return client;
        } catch (refreshError) {
          console.log("Token refresh failed. Need new authorization...");
        }
      } catch (parseError) {
        console.log("Invalid token file. Need new authorization...");
      }
    }

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });

    console.log("\n" + "=".repeat(80));
    console.log("⚠ AUTHORIZATION REQUIRED");
    console.log("=".repeat(80));
    console.log("\nAuthorize this app by visiting this URL:\n");
    console.log(authUrl);
    console.log("\n" + "=".repeat(80) + "\n");

    throw new Error(
      "Authorization required. Please visit the URL above to authorize the app.",
    );
  } catch (error) {
    throw error;
  }
}

//extract email body from message parts with proper recursion limits
function extractEmailBody(
  parts: GmailMessagePart[],
  depth: number = 0,
): string {
  if (!parts || depth > 10) return "";

  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      try {
        return Buffer.from(part.body.data, "base64", error);
      } catch (error) {
        console.warn("Failed to decode email body: ", error);
      }
    }

    if (part.parts) {
      const nestedBody = extractEmailBody(part.parts, depth + 1);
      if (nestedBody) return nestedBody;
    }
  }

  return "";
}

//process a single message with error handling and rate limiting
async function processMessage(
  gmail: any,
  msg: any,
  includeBody: boolean,
  index: number,
  total: number,
): Promise<EmailMessage | null> {
  try {
    console.log(`Processing message ${index + 1} of ${total}`);

    const mail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: includeBody ? "full" : "metadata",
    });

    const headers: GmailHeader[] = mail.data.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value ?? "No Subject";
    const from =
      headers.find((h) => h.name === "From")?.value ?? "Unknown Sender";
    const date =
      headers.find((h) => h.name === "Date")?.value ?? "Unknown Date";

    let body = mail.data.snippet ?? "";

    if (includeBody && mail.data.payload) {
      if (mail.data.payload.parts) {
        const extractedBody = extractEmailBody(mail.data.payload.parts);
        if (extractedBody) body = extractedBody;
      }
    } else if (mail.data.payload.body?.data) {
      try {
        body = Buffer.from(mail.data.payload.body.data, "base64").toString(
          "utf8",
        );
      } catch (error) {
        console.warn("failed to decode direct body: ", error);
      }
    }
    //Rate limiting
    if (index > 0 && index % 10 === 0) await sleep(API_DELAY * 5);
    else await sleep(API_DELAY);

    return {
      id: msg.id!,
      subject,
      from,
      date,
      snippet: mail.data.snippet ?? "",
      body: includeBody
        ? body.length > 50000
          ? body.substring(0, 50000) + "... [truncated]"
          : body
        : undefined,
      threadId: mail.data.threadId,
      labelIds: mail.data.labelIds,
    };
  } catch (error) {
    console.error(`Failed to fetch message ${msg.id}: `, error);
    return {
      id: msg.id!,
      snippet: "",
      subject: "Error fetching message",
      from: "Unknown Sender",
      date: "Unknown Date",
    };
  }
}

//fetch placement-related mails
export async function listPlacementEmails(
  auth: OAuth2Client,
  options: { maxResults?: number; query?: string; includeBody?: boolean } = {},
): Promise<EmailMessage[]> {
  const {
    maxResults = 10,
    query = "from:placementoffice@vitbhopal.ac.in OR subject:placement OR subject:internship",
    includeBody = false,
  } = options;

  try {
    const gmail = google.gmail({ version: "v1", auth });

    const res = await Promise.race([
      gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: Math.min(maxResults, 100),
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Gmail API timeout")),
          REQUEST_TIMEOUT,
        ),
      ),
    ]);
    const messages = (res as any).data.messages || [];
    console.log(`Found ${messages.length} messages matching query.`);

    if (messages.length === 0) return [];

    const batchSize = Math.min(MAX_CONCURRENT_REQUESTS, messages.length);
    const results: EmailMessage[] = [];

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      console.log(
        `Processing batch ${i / batchSize + 1} of ${Math.ceil(
          messages.length / batchSize,
        )}`,
      );

      const batchPromises = batch.map((msg: any, index: number) =>
        processMessage(gmail, msg, includeBody, i + index, messages.length),
      );
      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value) {
          results.push(result.value);
        }
      }

      if (i + batchSize < messages.length) {
        await sleep(API_DELAY * 2);
      }
    }
    return results;
  } catch (error) {
    console.error("Failed to list messages: ", error);
    throw error;
  }
}
