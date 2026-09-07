import { PrismaClient } from "@/generated/prisma";

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClientInstance;
};

export const prisma: PrismaClientInstance =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
