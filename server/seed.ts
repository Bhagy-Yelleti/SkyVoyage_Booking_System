import { db } from "./db";
import { flights, airlines, airports } from "@shared/schema";
import { format, addDays } from "date-fns";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Clear existing flights to reseed
    await db.delete(flights);
    console.log("Cleared existing flights");

    // 1. Get or create airports
    let airportList = await db.query.airports.findMany();
    console.log("Found airports:", airportList.length);

    if (airportList.length === 0) {
      console.log("Inserting airports...");
      const airportData = [
        { name: "Chhatrapati Shivaji", code: "BOM", city: "Mumbai", country: "India", timezone: "IST" },
        { name: "Indira Gandhi", code: "DEL", city: "Delhi", country: "India", timezone: "IST" },
        { name: "Kempegowda", code: "BLR", city: "Bangalore", country: "India", timezone: "IST" },
        { name: "John F. Kennedy", code: "JFK", city: "New York", country: "USA", timezone: "EST" }
      ];
      await db.insert(airports).values(airportData);
      airportList = await db.query.airports.findMany();
    }

    // 2. Get or create airlines
    let airlineList = await db.query.airlines.findMany();
    console.log("Found airlines:", airlineList.length);

    if (airlineList.length === 0) {
      console.log("Inserting airlines...");
      const airlineData = [
        { name: "Air India", code: "AI", logoUrl: "ai-logo" },
        { name: "IndiGo", code: "6E", logoUrl: "indigo-logo" },
        { name: "Emirates", code: "EK", logoUrl: "ek-logo" }
      ];
      await db.insert(airlines).values(airlineData);
      airlineList = await db.query.airlines.findMany();
    }

    console.log("Airports:", airportList.map(a => `${a.code}(${a.id})`).join(", "));
    console.log("Airlines:", airlineList.map(a => `${a.code}(${a.id})`).join(", "));

    const flightEntries: any[] = [];
    const today = new Date("2025-12-24");
    const endDate = addDays(today, 60); // 2 months from today

    // Create flights for all airport combinations, every day, for 2 months
    for (let d = new Date(today); d <= endDate; d = addDays(d, 1)) {
      for (const origin of airportList) {
        for (const dest of airportList) {
          if (origin.id === dest.id) continue; // Skip same airport

          for (let i = 0; i < 2; i++) { // 2 flights per route per day
            const depHour = i === 0 ? 8 : 14;
            const depTime = new Date(d);
            depTime.setHours(depHour, 0, 0, 0);

            const arrTime = new Date(depTime);
            arrTime.setHours(depHour + 4, 0, 0, 0);

            flightEntries.push({
              flightNumber: `${origin.code}${dest.code}${format(d, 'ddMM')}${i + 1}`,
              airlineId: airlineList[i % airlineList.length].id,
              originAirportId: origin.id,
              destinationAirportId: dest.id,
              departureTime: depTime,
              arrivalTime: arrTime,
              economyPrice: 5000,
              businessPrice: 12000,
              firstClassPrice: 25000,
              aircraftType: "Boeing 737",
              status: "scheduled"
            });
          }
        }
      }
    }

    console.log("Inserting", flightEntries.length, "flights in batches...");
    const batchSize = 1000;
    for (let i = 0; i < flightEntries.length; i += batchSize) {
      const batch = flightEntries.slice(i, i + batchSize);
      await db.insert(flights).values(batch);
      console.log(`Inserted ${Math.min(i + batchSize, flightEntries.length)}/${flightEntries.length} flights`);
    }

    console.log("✨ Seed complete!");
  } catch (e) {
    console.error("❌ Seed error:", e);
  }
}