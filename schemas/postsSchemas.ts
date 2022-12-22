import { z } from "zod";

export const postSchema = z.object({
  picturePath: z.string(),
  location: z.string(),
  description: z.string().min(4).max(300),
});
