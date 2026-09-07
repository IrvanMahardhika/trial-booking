import { handleApiError, jsonOk } from "@/lib/api-utils";
import { bookingService } from "@/lib/services";

export async function GET() {
  try {
    const trialClasses = await bookingService.listTrialClasses();
    return jsonOk({ trialClasses });
  } catch (error) {
    return handleApiError(error);
  }
}
