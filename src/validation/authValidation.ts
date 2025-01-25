import { z } from "zod";

const signInValidation = z.object({
  phone: z.string(),
  password: z.string(),
  name: z.string(),
  shopName: z.string(),
  category: z.string(),
});
