import { z } from "zod";
import { prisma } from "database";
import fs from "fs";
import { google } from "googleapis";
import { gmailAttachmentSchema } from "../schemas/gmail.schema";
import { parseDate, extractDeadlineDate } from "../utils/dateParser";
import { detectAnomalies, formatAnomalyReport } from "./anomalyDetector";
import { analyzeEmail } from "./aiSummarizer";
import path from "path";

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const MAX_BODY_LENGTH = 10000;
const MAX_RECURSION_DEPTH = 5;

const GMAIL_CONFIG = {
  defaultQuery:
    "from:placementoffice@vitbhopal.ac.in OR subject:placement OR subject:internship OR subject:recruitment",
  maxResults: 50,
  rateLimit: 100,
};

//sleep function for ate limiting
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(
      `Retrying operation in ${delay}ms... (${retries} retries left)`,
    );
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

//extract attachments from email payload
function extractAttachments(
  payload: any,
  depth: number = 0,
): z.infer<typeof gmailAttachmentSchema>[] {
  if (!payload || depth > MAX_RECURSION_DEPTH) return [];
  const attachments: z.infer<typeof gmailAttachmentSchema>[] = [];

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.filename && part.body?.attachmentId) {
        try {
          const attachment = gmailAttachmentSchema.parse({
            filename: part.filename,
            mimeType: part.mimeType || "application/octet-stream",
            size: part.body.size || 0,
            attachmentId: part.body.attachmentId,
          });
          attachments.push(attachment);
        } catch (error) {
          console.warn("Invalid attachment data: ", error);
        }
      }

      if (part.parts && depth < MAX_RECURSION_DEPTH) {
        attachments.push(...extractAttachments(part, depth + 1));
      }
    }
  }
  return attachments;
}

//parse company name from subject or body text
function parseCompany(subject: string, snippet: string): string | null {
  const patterns = [
    /(?:from|at)\s+([A-Z][A-Za-z\s&]+?)(?:\s+-|\s+for|\s+is|,)/i,
    /\[([A-Z][A-Za-z\s&]+?)\]/,
    /^([A-Z][A-Za-z\s&]+?)(?:\s+-|\s+:)/,
  ];

  for (const pattern of patterns) {
    const match = subject.match(pattern) || snippet.match(pattern);
    if (match && match[1]) {
      const company = match[1].trim();
      // Validate company name (basic checks)
      if (company.length > 2 && company.length < 100) {
        return company;
      }
    }
  }
  return null;
}

//parse job roles from subject or body text
function parseRole(subject: string, snippet: string): string | null {
  const patterns = [
    /(?:for|hiring|role|position):\s*([A-Za-z\s]+?)(?:\s+at|\s+-|$)/i,
    /([A-Za-z\s]+?)\s+(?:Internship|Role|Position|Opening)/i,
  ];

  for (const pattern of patterns) {
    const match = subject.match(pattern) || snippet.match(pattern);
    if (match && match[1]) {
      const role = match[1].trim();
      // Validate role name
      if (role.length > 2 && role.length < 100) {
        return role;
      }
    }
  }
  return null;
}

//parse deadline from text with date recognition
function parseDeadline(text: string): Date | null {
  const patterns = [
    /deadline[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /apply\s+by[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /last\s+date[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
    /(\d{4}-\d{2}-\d{2})/i, // ISO format
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      try {
        const date = new Date(match[1]);
        // Validate date is reasonable (not too far in past/future)
        const now = new Date();
        const oneYearFromNow = new Date(
          now.getFullYear() + 1,
          now.getMonth(),
          now.getDate(),
        );
        const oneYearAgo = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );

        if (
          !isNaN(date.getTime()) &&
          date >= oneYearAgo &&
          date <= oneYearFromNow
        ) {
          return date;
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

//parse apply link from text with better validation
function parseApplyLink(text: string): string | null {
  const urlPattern = /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/gi;
  const matches = text.match(urlPattern);

  if (matches && matches.length > 0) {
    // Prefer links that contain "apply" or "registration" keywords
    const applyLink = matches.find(
      (link) =>
        link.toLowerCase().includes("apply") ||
        link.toLowerCase().includes("registration") ||
        link.toLowerCase().includes("form") ||
        link.toLowerCase().includes("career"),
    );

    const selectedLink = applyLink || matches[0];

    // Basic URL validation
    try {
      const url = selectedLink.startsWith("www.")
        ? `https://${selectedLink}`
        : selectedLink;
      new URL(url);
      return url;
    } catch {
      return selectedLink; // Return as-is if URL validation fails
    }
  }
  return null;
}

//extract email body from Gmail message parts with recursion depth limit
function extractEmailBody(payload: any, depth: number = 0): string {
  if (!payload || depth > MAX_RECURSION_DEPTH) return "";

  let body = "";

  // If the message has parts, look for text/plain
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        try {
          body = Buffer.from(part.body.data, "base64").toString("utf8");
          break;
        } catch (error) {
          console.warn("Failed to decode email body:", error);
        }
      }
      // Recursively check nested parts with depth tracking
      if (part.parts && depth < MAX_RECURSION_DEPTH) {
        const nestedBody = extractEmailBody(part, depth + 1);
        if (nestedBody) body = nestedBody;
      }
    }
  }
  // If no parts, check the body directly
  else if (payload.body?.data) {
    try {
      body = Buffer.from(payload.body.data, "base64").toString("utf8");
    } catch (error) {
      console.warn("Failed to decode email body:", error);
    }
  }

  // Limit body size to prevent memory issues
  if (body.length > MAX_BODY_LENGTH) {
    body = body.substring(0, MAX_BODY_LENGTH) + "... [truncated]";
  }

  return body;
}

//process a batch of messages with proper error handling
async function processBatch(
  gmail: any,
  messages: any[],
  userId: string,
  batchIndex: number,
  totalBatches: number,
): Promise<{ saved: number; skipped: number; errors: number }> {
  let savedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  console.log(
    `Processing batch ${batchIndex + 1}/${totalBatches} (${
      messages.length
    } messages)`,
  );

  for (const [index, msg] of messages.entries()) {
    try {
      const msgData = await retryWithBackoff(async () => {
        return await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full",
        });
      });

      const payload = msgData.data.payload;
      const headers = payload?.headers || [];

      const subject =
        headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
      const sender =
        headers.find((h: any) => h.name === "From")?.value || "Unknown Sender";
      const snippet = msgData.data.snippet || "";
      const dateHeader = headers.find((h: any) => h.name === "Date")?.value;

      const existing = await prisma.placementMail.findFirst({
        where: {
          gmailMessageId: msg.id!,
          userId: userId,
        },
      });

      if (existing) {
        skippedCount++;
        console.log(`Already exists: ${subject.substring(0, 50)}...`);
        continue;
      }

      const body = extractEmailBody(payload);
      const truncatedBody =
        body.length > MAX_BODY_LENGTH
          ? body.substring(0, MAX_BODY_LENGTH) + "... [truncated]"
          : body;
      const fullText = `${subject} ${snippet} ${truncatedBody}`;

      const attachments = extractAttachments(payload);
      const attachmentsJson =
        attachments.length > 0 ? JSON.stringify(attachments) : null;

      const company = parseCompany(subject, fullText);
      const role = parseRole(subject, fullText);
      const deadline = parseDeadline(fullText);
      const applyLink = parseApplyLink(fullText);

      let aiData = null;
      let rawAiOutput = null;
      try {
        aiData = await Promise.race([
          analyzeEmail({
            subject,
            snippet,
            body: truncatedBody || snippet,
            attachments: attachments.length > 0 ? attachments : undefined,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI analysis timeout")), 45000),
          ),
        ]);

        rawAiOutput = JSON.stringify(aiData);

        console.log(`AI extracted:`, {
          category: aiData?.category,
          company: aiData?.company,
          role: aiData?.role,
          hasLinks: !!aiData?.otherLinks,
          attachments: attachments.length,
        });
      } catch (aiError) {
        console.warn(
          `AI analysis failed for: ${subject.substring(0, 50)}...`,
          aiError instanceof Error ? aiError.message : aiError,
        );
      }

      let receivedAt = new Date();
      if (msgData.data.internalDate) {
        receivedAt = new Date(parseInt(msgData.data.internalDate));
      } else if (dateHeader) {
        receivedAt = new Date(dateHeader);
      }

      // Use AI-extracted data, fallback to regex parsing
      const finalCompany = aiData?.company || company;
      const finalRole = aiData?.role || role;
      const finalApplyLink = aiData?.applyLink || applyLink;
      const finalEligibility = aiData?.eligibility || null;
      const finalTimings = aiData?.timings || null;
      const finalSalary = aiData?.salary || null;
      const finalLocation = aiData?.location || null;
      const finalSummary = aiData?.summary || null;
      const finalCategory = aiData?.category || "announcement";
      const finalEventDetails = aiData?.eventDetails || null;
      const finalRequirements = aiData?.requirements || null;
      const finalDescription = aiData?.description || null;
      const finalAttachmentSummary = aiData?.attachmentSummary || null;

      let otherLinksJson = null;
      if (aiData?.otherLinks && Array.isArray(aiData.otherLinks)) {
        otherLinksJson = JSON.stringify(aiData.otherLinks);
      }

      let finalDeadline = deadline;
      if (
        aiData?.deadline &&
        aiData.deadline !== "null" &&
        aiData.deadline !== "No deadline"
      ) {
        const parsedDeadline = parseDate(aiData.deadline);
        if (parsedDeadline) {
          finalDeadline = parsedDeadline;
        } else {
          console.warn(
            `could not parse AI deadline with chrono: ${aiData.deadline}`,
          );

          try {
            const parsedDate = new Date(aiData.deadline);
            if (!isNaN(parsedDate.getTime())) {
              finalDeadline = parsedDate;
            }
          } catch (e) {
            console.warn(`Could not parse AI deadline: ${aiData.deadline}`);
          }
        }
      }

      if (!finalDeadline) {
        finalDeadline = extractDeadlineDate(fullText);
      }

      const anomalyResult = detectAnomalies({
        category: finalCategory,
        company: finalCompany,
        role: finalRole,
        deadline: finalDeadline,
        applyLink: finalApplyLink,
        salary: finalSalary,
        eligibility: finalEligibility,
        subject,
        body: truncatedBody,
      });

      if (anomalyResult.hasAnomaly) {
        console.log(
          `Anomalies detected:\n${formatAnomalyReport(anomalyResult)}`,
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.placementMail.create({
          data: {
            gmailMessageId: msg.id!,
            subject,
            sender,
            snippet: snippet.substring(0, 500),
            receivedAt,
            company: finalCompany,
            role: finalRole,
            deadline: finalDeadline,
            applyLink: finalApplyLink,
            otherLinks: otherLinksJson,
            attachments: attachmentsJson,
            eligibility: finalEligibility,
            summary: finalSummary,
            category: finalCategory,
            timings: finalTimings,
            salary: finalSalary,
            location: finalLocation,
            eventDetails: finalEventDetails,
            requirements: finalRequirements,
            description: finalDescription,
            attachmentSummary: finalAttachmentSummary,
            userId: userId,
            // Safety and validation fields
            rawAiOutput,
            hasAnomaly: anomalyResult.hasAnomaly,
            anomalies: anomalyResult.hasAnomaly
              ? JSON.stringify(anomalyResult.anomalies)
              : null,
            anomalySeverity: anomalyResult.hasAnomaly
              ? anomalyResult.severity
              : null,
            requiresReview: anomalyResult.requiresReview,
          },
        });

        await tx.email.upsert({
          where: {
            id_userId: {
              id: msg.id!,
              userId: userId,
            },
          },
          update: {
            subject,
            from: sender,
            date: dateHeader,
            snippet: snippet.substring(0, 500),
            body: truncatedBody || undefined,
            summary: finalSummary || undefined,
            category: finalCategory,
            deadline: aiData?.deadline || undefined,
            company: finalCompany,
            role: finalRole,
            applyLink: finalApplyLink,
            eligibility: finalEligibility,
            timings: finalTimings,
            salary: finalSalary,
            location: finalLocation,
          },
          create: {
            id: msg.id!,
            subject,
            from: sender,
            date: dateHeader,
            snippet: snippet.substring(0, 500),
            body: truncatedBody || undefined,
            summary: finalSummary || undefined,
            category: finalCategory,
            deadline: aiData?.deadline || undefined,
            company: finalCompany,
            role: finalRole,
            applyLink: finalApplyLink,
            eligibility: finalEligibility,
            timings: finalTimings,
            salary: finalSalary,
            location: finalLocation,
            userId: userId,
          },
        });
      });

      savedCount++;
      console.log(`Saved: ${subject.substring(0, 60)}...`);
      if (finalCompany) console.log(`  └─ Company: ${finalCompany}`);
      if (finalRole) console.log(`  └─ Role: ${finalRole}`);
      if (finalDeadline)
        console.log(`  └─ Deadline: ${finalDeadline.toLocaleDateString()}`);
      if (finalSalary) console.log(`  └─ Salary: ${finalSalary}`);
      if (finalLocation) console.log(`  └─ Location: ${finalLocation}`);

      // Rate limiting to prevent API throttling
      await sleep(100);
    } catch (messageError) {
      errorCount++;
      console.error(`Error processing message ${msg.id}:`, messageError);
      continue;
    }
  }
  return { saved: savedCount, skipped: skippedCount, errors: errorCount };
}

//fetch and parse placement emails from Gmail for a specific user with memory management
export async function fetchPlacementMails(
  userId: string,
  userAccessToken: string,
  customQuery?: string,
) {
  if (!userId || !userAccessToken)
    throw new Error("User ID and access token are required");

  let gmail: any = null;

  try {
    console.log(`Starting email fetch for user: ${userId}`);
    let credentials;
    try {
      credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    } catch (error) {
      throw new Error(
        `Failed to read credentials file: ${
          error instanceof Error ? error.message : "Unknown Error"
        }`,
      );
    }

    const { client_secret, client_id, redirect_uris } =
      credentials.web || credentials.installed;
    if (!client_id || !client_secret || !redirect_uris?.[0]) {
      throw new Error("Invalid credentials file structure");
    }

    const OAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );

    OAuth2Client.setCredentials({ access_token: userAccessToken });

    gmail = google.gmail({ version: "v1", auth: OAuth2Client });

    const query = customQuery || GMAIL_CONFIG.defaultQuery;
    const res = await retryWithBackoff(async () => {
      return await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: GMAIL_CONFIG.maxResults,
      });
    });

    const messages = res.data.messages || [];
    console.log(`Found ${messages.length} messages for user ${userId}.`);

    if (messages.length === 0) {
      return {
        saved: 0,
        skipped: 0,
        errors: 0,
        total: 0,
      };
    }

    const batches = [];
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      batches.push(messages.slice(i, i + BATCH_SIZE));
    }

    let totalSaved = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [batchIndex, batch] of batches.entries()) {
      try {
        const batchResults = await processBatch(
          gmail,
          batch,
          userId,
          batchIndex,
          batches.length,
        );
        totalSaved += batchResults.saved;
        totalSkipped += batchResults.skipped;
        totalErrors += batchResults.errors;

        if (batchIndex < batches.length - 1) {
          await sleep(500);
        }
      } catch (batchError) {
        console.error(`Error processing batch ${batchIndex + 1}:`, batchError);
        totalErrors += batch.length;
      }
    }
    console.log("\n" + "=".repeat(60));
    console.log(`✓ Finished processing emails for user: ${userId}`);
    console.log(`  ├─ Saved: ${totalSaved}`);
    console.log(`  ├─ Skipped: ${totalSkipped}`);
    console.log(`  └─ Errors: ${totalErrors}`);
    console.log("=".repeat(60) + "\n");

    return {
      saved: totalSaved,
      skipped: totalSkipped,
      errors: totalErrors,
      total: messages.length,
    };
  } catch (error) {
    console.error(`Error fetching placement mails for user ${userId}`);
    throw error;
  }
}
