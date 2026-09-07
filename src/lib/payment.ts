export type PaymentResult = {
  success: boolean;
  message?: string;
};

export type RefundResult = {
  success: boolean;
  message?: string;
};

/**
 * Mock payment gateway. In production this would call Stripe or similar.
 */
export function mockPayment(shouldSucceed: boolean): PaymentResult {
  if (shouldSucceed) {
    return { success: true, message: "Payment captured" };
  }

  return { success: false, message: "Card declined" };
}

/**
 * Mock refund hook for payments captured but not confirmed (e.g. last-seat race).
 * In production this would call the payment provider's refund API.
 */
export async function refundPayment(input: {
  bookingId: string;
  reason: string;
}): Promise<RefundResult> {
  return {
    success: true,
    message: `Refund issued for booking ${input.bookingId}: ${input.reason}`,
  };
}
