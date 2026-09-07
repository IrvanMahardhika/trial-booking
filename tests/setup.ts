import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testDbPath = path.join(rootDir, "prisma", "test.db");

process.env.DATABASE_URL = `file:${testDbPath}`;
process.env.JWT_SECRET = "test-jwt-secret";

execSync("npx prisma db push --skip-generate", {
  cwd: rootDir,
  stdio: "inherit",
  env: process.env,
});
