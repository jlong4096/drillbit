import { z } from "zod";

export const UserSchema = z.object({
  name: z.string(),
  phone: z.string(),
});

export type User = z.infer<typeof UserSchema>;
