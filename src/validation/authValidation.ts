import { z } from "zod";

export const signUpValidation = z.object({
  phone: z.string(),
  password: z.string(),
  name: z.string(),
  shopName: z.string(),
  category: z.string(),
});

export const loginValidation = z.object({
  phone: z.string(),
  password: z.string(),
});
