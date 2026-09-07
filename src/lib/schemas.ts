import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().min(1),
});

export const createBookingSchema = z.object({
  studentId: z.string().min(1),
  trialClassId: z.string().min(1),
});

export const payBookingSchema = z.object({
  shouldSucceed: z.boolean(),
});
