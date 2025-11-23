import { z } from "zod";

export const googleTokensSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().default("Bearer"),
  expiry_date: z.string().optional(),
  id_token: z.string().optional(),
});

export const googleUserPayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  sub: z.string().optional(),
});
