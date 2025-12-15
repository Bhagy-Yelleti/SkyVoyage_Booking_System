import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query("SELECT NOW()");
    console.log("DB connection works! Time:", res.rows[0].now);
  } catch (err) {
    console.error("DB connection failed:", err);
  } finally {
    await client.end();
  }
}

testConnection();
