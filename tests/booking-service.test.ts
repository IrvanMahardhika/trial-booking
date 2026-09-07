import { beforeEach, describe, expect, it } from "vitest";
import { BookingStatus } from "@prisma/client";
import { BookingService } from "@/lib/booking-service";
import { prisma } from "@/lib/db";

const bookingService = new BookingService(prisma);

async function resetDatabase() {
  await prisma.paymentAttempt.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.trialClass.deleteMany();
}

async function seedBaseData() {
  const parent = await prisma.parent.create({
    data: {
      name: "Test Parent",
      email: "parent@example.com",
      students: {
        create: [
          { name: "Student A" },
          { name: "Student B" },
          { name: "Student C" },
          { name: "Student D" },
          { name: "Student E" },
        ],
      },
    },
    include: { students: true },
  });

  const trialClass = await prisma.trialClass.create({
    data: {
      title: "Test Class",
      scheduledAt: new Date("2026-10-01T10:00:00.000Z"),
      capacity: 4,
    },
  });

  return { parent, students: parent.students, trialClass };
}

describe("BookingService", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates a pending booking when seats are available", async () => {
    const { students, trialClass } = await seedBaseData();

    const booking = await bookingService.createBooking(
      students[0].id,
      trialClass.id,
    );

    expect(booking.status).toBe(BookingStatus.pending_payment);
  });

  it("prevents duplicate active bookings for the same child and class", async () => {
    const { students, trialClass } = await seedBaseData();

    await bookingService.createBooking(students[0].id, trialClass.id);

    await expect(
      bookingService.createBooking(students[0].id, trialClass.id),
    ).rejects.toMatchObject({
      code: "DUPLICATE_BOOKING",
    });
  });

  it("prevents overbooking beyond 4 confirmed students", async () => {
    const { students, trialClass } = await seedBaseData();

    for (const student of students.slice(0, 4)) {
      const booking = await bookingService.createBooking(
        student.id,
        trialClass.id,
      );
      await bookingService.completePayment(booking.id, {
        success: true,
        message: "ok",
      });
    }

    await expect(
      bookingService.createBooking(students[4].id, trialClass.id),
    ).rejects.toMatchObject({
      code: "CLASS_FULL",
    });

    const roster = await bookingService.getClassRoster(trialClass.id);
    expect(roster.confirmedStudents).toHaveLength(4);
  });

  it("does not confirm roster entry when payment fails", async () => {
    const { students, trialClass } = await seedBaseData();

    const booking = await bookingService.createBooking(
      students[0].id,
      trialClass.id,
    );

    const result = await bookingService.completePayment(booking.id, {
      success: false,
      message: "Card declined",
    });

    expect(result.status).toBe(BookingStatus.payment_failed);

    const roster = await bookingService.getClassRoster(trialClass.id);
    expect(roster.confirmedStudents).toHaveLength(0);
  });

  it("allows only one winner for the last available seat", async () => {
    const { students, trialClass } = await seedBaseData();

    for (const student of students.slice(0, 3)) {
      const booking = await bookingService.createBooking(
        student.id,
        trialClass.id,
      );
      await bookingService.completePayment(booking.id, {
        success: true,
        message: "ok",
      });
    }

    const bookingA = await bookingService.createBooking(
      students[3].id,
      trialClass.id,
    );
    const bookingB = await bookingService.createBooking(
      students[4].id,
      trialClass.id,
    );

    const winner = await bookingService.completePayment(bookingB.id, {
      success: true,
      message: "paid first",
    });
    const loser = await bookingService.completePayment(bookingA.id, {
      success: true,
      message: "paid second",
    });

    expect(winner.status).toBe(BookingStatus.confirmed);
    expect(loser.status).toBe(BookingStatus.payment_failed);

    const roster = await bookingService.getClassRoster(trialClass.id);
    expect(roster.confirmedStudents).toHaveLength(4);
    expect(
      roster.confirmedStudents.some(
        (entry) => entry.studentId === students[4].id,
      ),
    ).toBe(true);
    expect(
      roster.confirmedStudents.some(
        (entry) => entry.studentId === students[3].id,
      ),
    ).toBe(false);
  });
});
