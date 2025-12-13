import { z } from "zod";

export const googleTokensSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().default("Bearer"),
  // Google may return expiry_date as number (ms) or string; normalize to number
  expiry_date: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null) return undefined;
      // If it's already a number (milliseconds), return as-is
      if (typeof val === "number") return val;
      // If it's a string, try to parse it
      if (typeof val === "string") {
        const parsed = Date.parse(val);
        return isNaN(parsed) ? undefined : parsed;
      }
      return undefined;
    }),
  id_token: z.string().optional(),
});

export const googleUserPayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  sub: z.string().optional(),
});
