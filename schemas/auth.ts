import { z } from "zod";

/** JSON body from `POST /api/auth/login` after a successful sign-in. */
export const loginSessionResponseSchema = z.object({
  token: z.string().min(1),
  userEmail: z.string(),
  userNicename: z.string(),
  userDisplayName: z.string(),
});
