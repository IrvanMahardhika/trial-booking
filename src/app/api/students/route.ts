import { requireSessionParent } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { bookingService } from "@/lib/services";

export async function GET() {
  try {
    const parent = await requireSessionParent();
    const students = await bookingService.listStudents(parent.id);
    return jsonOk({ students });
  } catch (error) {
    return handleApiError(error);
  }
}
