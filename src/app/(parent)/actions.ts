"use server";

import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireSessionParent } from "@/lib/auth";
import { createBookingSchema } from "@/lib/schemas";
import { bookingService } from "@/lib/services";

export async function createBookingAction(formData: FormData) {
  const parent = await requireSessionParent();

  let studentId: string;
  let trialClassId: string;

  try {
    ({ studentId, trialClassId } = createBookingSchema.parse({
      studentId: formData.get("studentId"),
      trialClassId: formData.get("trialClassId"),
    }));
  } catch (error) {
    if (error instanceof ZodError) {
      redirect("/book?error=invalid");
    }
    throw error;
  }

  const booking = await bookingService.createBookingForParent(
    parent.id,
    studentId,
    trialClassId,
  );

  redirect(`/bookings/${booking.id}`);
}

export async function submitPaymentAction(
  bookingId: string,
  shouldSucceed: boolean,
) {
  const parent = await requireSessionParent();
  await bookingService.getBookingForParent(parent.id, bookingId);
  await bookingService.submitPayment(bookingId, shouldSucceed);
  redirect(`/bookings/${bookingId}`);
}

export async function paySuccessfullyAction(bookingId: string) {
  await submitPaymentAction(bookingId, true);
}

export async function payWithFailureAction(bookingId: string) {
  await submitPaymentAction(bookingId, false);
}
