import { z } from "zod";

export const userRegisterSchema = z.object({
  firstName: z.string().min(3).max(28),
  lastName: z.string().min(3).max(28),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  job: z.string().max(50),
  picturePath: z.string(),
});

export const userLoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
});
