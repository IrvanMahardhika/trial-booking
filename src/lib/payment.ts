export type PaymentResult = {
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
