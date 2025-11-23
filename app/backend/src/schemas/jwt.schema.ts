import { z } from "zod";

export const jwtPayloadSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
});

export const tokenSchema = z.string().min(1, "Token is required");
