export class BookingError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "DUPLICATE_BOOKING"
      | "CLASS_FULL"
      | "INVALID_STATUS"
      | "PAYMENT_FAILED"
      | "UNAUTHORIZED",
  ) {
    super(message);
    this.name = "BookingError";
  }
}
