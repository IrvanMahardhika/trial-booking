import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BookingError } from "@/lib/errors";

const BOOKING_ERROR_STATUS: Record<BookingError["code"], number> = {
  NOT_FOUND: 404,
  DUPLICATE_BOOKING: 409,
  CLASS_FULL: 409,
  INVALID_STATUS: 400,
  PAYMENT_FAILED: 402,
  UNAUTHORIZED: 401,
};

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof BookingError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: BOOKING_ERROR_STATUS[error.code] },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request body", details: error.flatten() },
      { status: 400 },
    );
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
