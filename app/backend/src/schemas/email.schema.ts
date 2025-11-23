import { z } from "zod";

export const emailQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const syncEmailSchema = z.object({
  forceSync: z.boolean().optional().default(false),
});
