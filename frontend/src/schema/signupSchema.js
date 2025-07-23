import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be atleast 6 characters long"),
  name: z.string().min(3, "Name must be atleast 3 characters long"),
});
