import {
  paySuccessfullyAction,
  payWithFailureAction,
} from "@/app/(parent)/actions";

type PaymentActionsProps = {
  bookingId: string;
};

export function PaymentActions({ bookingId }: PaymentActionsProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-medium">Mock payment</p>
      <p className="mt-1 text-sm text-muted">
        Simulate a successful or failed card payment for this demo.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <form action={paySuccessfullyAction.bind(null, bookingId)}>
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Pay successfully
          </button>
        </form>
        <form action={payWithFailureAction.bind(null, bookingId)}>
          <button
            type="submit"
            className="rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-red-50"
          >
            Simulate card declined
          </button>
        </form>
      </div>
    </div>
  );
}
