import { requireSessionParent } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { bookingService } from "@/lib/services";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const parent = await requireSessionParent();
    const { id } = await context.params;
    const booking = await bookingService.getBookingForParent(parent.id, id);
    return jsonOk({ booking });
  } catch (error) {
    return handleApiError(error);
  }
}
