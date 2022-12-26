import { z } from "zod";

export const postSchema = z.object({
  userId: z.string(),
  picturePath: z.string(),
  location: z.string(),
  description: z.string().min(4).max(300),
});
