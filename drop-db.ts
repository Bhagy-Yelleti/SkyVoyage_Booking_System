import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function dropAll() {
  console.log("Cleaning database...");
  // This drops everything including the ghost constraints
  await db.execute(sql`DROP TABLE IF EXISTS pricing_attempts CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS bookings CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS flights CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS airports CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS airlines CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS sessions CASCADE;`);
  console.log("Database is now empty and clean!");
  process.exit(0);
}

dropAll().catch(err => {
  console.error(err);
  process.exit(1);
});