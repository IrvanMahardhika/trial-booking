import { requireSessionParent } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { bookingService } from "@/lib/services";

export async function GET() {
  try {
    await requireSessionParent();
    const trialClasses = await bookingService.listTrialClasses();
    return jsonOk({ trialClasses });
  } catch (error) {
    return handleApiError(error);
  }
}
