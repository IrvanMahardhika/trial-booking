"use server";

import { redirect } from "next/navigation";
import { requireSessionParent } from "@/lib/auth";
import { bookingService } from "@/lib/services";

export async function createBookingAction(formData: FormData) {
  const parent = await requireSessionParent();
  const studentId = String(formData.get("studentId") ?? "");
  const trialClassId = String(formData.get("trialClassId") ?? "");

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
