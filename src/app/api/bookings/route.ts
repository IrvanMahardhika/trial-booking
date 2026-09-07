import { requireSessionParent } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { createBookingSchema } from "@/lib/schemas";
import { bookingService } from "@/lib/services";

export async function POST(request: Request) {
  try {
    const parent = await requireSessionParent();
    const body = createBookingSchema.parse(await request.json());
    const booking = await bookingService.createBookingForParent(
      parent.id,
      body.studentId,
      body.trialClassId,
    );
    return jsonOk({ booking }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
