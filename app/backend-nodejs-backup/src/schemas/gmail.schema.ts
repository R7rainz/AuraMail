import { z } from "zod";

export const gmailAttachmentSchema = z.object({
  filename: z.string(),
  mimeType: z.string().default("application/octet-stream"),
  size: z.number().default(0),
  attachmentId: z.string(),
});

export const gmailMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()).optional(),
  snippet: z.string().optional(),
  internalDate: z.string().optional(),
  payload: z.any(),
});

export const emailDataSchema = z.object({
  messageId: z.string(),
  threadId: z.string(),
  subject: z.string(),
  from: z.string().email(),
  receivedAt: z.date(),
  snippet: z.string(),
  body: z.string(),
  company: z.string().nullable().optional(),
  applyLink: z.string().url().nullable().optional(),
  otherLinks: z.array(z.string().url()).nullable().optional(),
  attachments: z.array(gmailAttachmentSchema).nullable().optional(),
  category: z
    .enum(["placement", "internship", "general", "announcement"])
    .default("general"),
});

export const syncStatsSchema = z.object({
  totalFetched: z.number().int().nonnegative(),
  newEmails: z.number().int().nonnegative(),
  updatedEmails: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
});
