import { z } from "zod";
import { requireSessionParent } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { bookingService } from "@/lib/services";

const createBookingSchema = z.object({
  studentId: z.string().min(1),
  trialClassId: z.string().min(1),
});

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
