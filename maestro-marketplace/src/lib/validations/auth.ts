import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().min(8).max(100)
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100)
});
