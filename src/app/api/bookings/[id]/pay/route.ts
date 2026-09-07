import { z } from "zod";
import { requireSessionParent } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { bookingService } from "@/lib/services";

const payBookingSchema = z.object({
  shouldSucceed: z.boolean(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const parent = await requireSessionParent();
    const { id } = await context.params;
    const body = payBookingSchema.parse(await request.json());
    await bookingService.getBookingForParent(parent.id, id);
    const booking = await bookingService.submitPayment(id, body.shouldSucceed);
    return jsonOk({ booking });
  } catch (error) {
    return handleApiError(error);
  }
}
