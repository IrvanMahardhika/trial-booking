import { handleApiError, jsonOk } from "@/lib/api-utils";
import { bookingService } from "@/lib/services";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const roster = await bookingService.getClassRoster(id);
    return jsonOk(roster);
  } catch (error) {
    return handleApiError(error);
  }
}
