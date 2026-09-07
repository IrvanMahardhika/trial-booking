import type { BookingStatus } from "@prisma/client";
import { formatStatusLabel } from "@/lib/format";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending_payment: "bg-amber-50 text-warning border-amber-200",
  confirmed: "bg-emerald-50 text-success border-emerald-200",
  payment_failed: "bg-red-50 text-danger border-red-200",
  cancelled: "bg-slate-100 text-muted border-border",
};

type StatusBadgeProps = {
  status: BookingStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
