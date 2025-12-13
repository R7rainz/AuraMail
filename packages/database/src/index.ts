import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "path";

// Ensure DATABASE_URL is loaded before creating the pool
// Try multiple locations for .env files
if (!process.env.DATABASE_URL) {
  dotenv.config();
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
  dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
  dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found. Searched in:", [
    process.cwd(),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(process.cwd(), "../../.env"),
  ]);
  throw new Error(
    "DATABASE_URL environment variable is not set. Please set it in your .env file."
  );
}

console.log("Database connection string loaded:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection on startup
pool.query("SELECT 1")
  .then(() => {
    console.log("✅ Database connection successful");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
