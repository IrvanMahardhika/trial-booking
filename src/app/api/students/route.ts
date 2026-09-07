import { handleApiError, jsonOk } from "@/lib/api-utils";
import { bookingService } from "@/lib/services";

export async function GET() {
  try {
    const students = await bookingService.listStudents();
    return jsonOk({ students });
  } catch (error) {
    return handleApiError(error);
  }
}
