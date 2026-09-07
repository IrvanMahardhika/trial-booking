import { BookingStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo123";

async function main() {
  await prisma.paymentAttempt.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.trialClass.deleteMany();

  const parentA = await prisma.parent.create({
    data: {
      name: "Alice Nguyen",
      email: "alice@example.com",
      password: DEMO_PASSWORD,
      students: {
        create: [
          { name: "Linh Nguyen" },
          { name: "Minh Nguyen" },
        ],
      },
    },
    include: { students: true },
  });

  const parentB = await prisma.parent.create({
    data: {
      name: "Bob Santos",
      email: "bob@example.com",
      password: DEMO_PASSWORD,
      students: {
        create: [
          { name: "Sofia Santos" },
          { name: "Diego Santos" },
        ],
      },
    },
    include: { students: true },
  });

  const parentC = await prisma.parent.create({
    data: {
      name: "Carla Ortiz",
      email: "carla@example.com",
      password: DEMO_PASSWORD,
      students: {
        create: [{ name: "Emma Ortiz" }],
      },
    },
    include: { students: true },
  });

  const [linh, minh] = parentA.students;
  const [sofia, diego] = parentB.students;
  const [emma] = parentC.students;

  const availableClass = await prisma.trialClass.create({
    data: {
      title: "Intro to Chemistry",
      scheduledAt: new Date("2026-09-15T10:00:00.000Z"),
      capacity: 4,
    },
  });

  const nearlyFullClass = await prisma.trialClass.create({
    data: {
      title: "Fractions Fun",
      scheduledAt: new Date("2026-09-16T10:00:00.000Z"),
      capacity: 4,
    },
  });

  const lastSeatClass = await prisma.trialClass.create({
    data: {
      title: "Space Science",
      scheduledAt: new Date("2026-09-17T10:00:00.000Z"),
      capacity: 4,
    },
  });

  const paymentFailureClass = await prisma.trialClass.create({
    data: {
      title: "Plant Biology",
      scheduledAt: new Date("2026-09-18T10:00:00.000Z"),
      capacity: 4,
    },
  });

  // Class with exactly 3 confirmed students (1 seat left).
  for (const student of [linh, sofia, diego]) {
    await prisma.booking.create({
      data: {
        studentId: student.id,
        trialClassId: nearlyFullClass.id,
        status: BookingStatus.confirmed,
      },
    });
  }

  // Duplicate booking attempt seed: Emma already has a pending booking.
  await prisma.booking.create({
    data: {
      studentId: emma.id,
      trialClassId: availableClass.id,
      status: BookingStatus.pending_payment,
    },
  });

  // Payment failure case: Minh has a failed payment and is not on the roster.
  const failedBooking = await prisma.booking.create({
    data: {
      studentId: minh.id,
      trialClassId: paymentFailureClass.id,
      status: BookingStatus.payment_failed,
    },
  });

  await prisma.paymentAttempt.create({
    data: {
      bookingId: failedBooking.id,
      success: false,
      message: "Card declined",
    },
  });

  // Last-seat race setup: class already has 3 confirmed, leaving 1 seat.
  for (const student of [linh, sofia, diego]) {
    await prisma.booking.create({
      data: {
        studentId: student.id,
        trialClassId: lastSeatClass.id,
        status: BookingStatus.confirmed,
      },
    });
  }

  console.log("Seed complete.");
  console.log({
    parents: [parentA.id, parentB.id, parentC.id],
    students: {
      linh: linh.id,
      minh: minh.id,
      sofia: sofia.id,
      diego: diego.id,
      emma: emma.id,
    },
    classes: {
      available: availableClass.id,
      nearlyFull: nearlyFullClass.id,
      lastSeat: lastSeatClass.id,
      paymentFailure: paymentFailureClass.id,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
