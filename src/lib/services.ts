import { BookingService } from "@/lib/booking-service";
import { prisma } from "@/lib/db";

export const bookingService = new BookingService(prisma);
