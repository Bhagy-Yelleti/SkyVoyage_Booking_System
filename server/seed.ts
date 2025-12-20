import { db } from "./db";
import { flights, airlines, airports } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting Full Seed...");
    
    const airportData = [
      { id: 1, name: "Chhatrapati Shivaji", code: "BOM", city: "Mumbai", country: "India" },
      { id: 2, name: "Indira Gandhi", code: "DEL", city: "Delhi", country: "India" },
      { id: 3, name: "Kempegowda", code: "BLR", city: "Bangalore", country: "India" },
      { id: 4, name: "John F. Kennedy", code: "JFK", city: "New York", country: "USA" }
    ];

    const airlineData = [
      { id: 1, name: "Air India", code: "AI", logo: "ai-logo" },
      { id: 2, name: "IndiGo", code: "6E", logo: "indigo-logo" },
      { id: 3, name: "Emirates", code: "EK", logo: "ek-logo" }
    ];

    const flightEntries = [];
    const cityIds = [1, 2, 3, 4]; 

    // Generate flights for ALL combinations
    for (const from of cityIds) {
      for (const to of cityIds) {
        if (from === to) continue; 
        
        // Add 2 flights per route for variety
        for (let i = 0; i < 2; i++) {
          flightEntries.push({
            airlineId: Math.floor(Math.random() * 3) + 1,
            originAirportId: from,
            destinationAirportId: to,
            flightNumber: `FL${from}${to}${100 + Math.floor(Math.random() * 899)}`,
            departureTime: new Date("2025-12-21T10:00:00Z"),
            arrivalTime: new Date("2025-12-21T14:00:00Z"),
            economyPrice: (4000 + Math.floor(Math.random() * 5000)).toString(),
            businessPrice: "15000",
            firstClassPrice: "35000",
            aircraftType: "Boeing 737",
            status: "scheduled"
          });
        }
      }
    }

    await db.insert(airports).values(airportData).onConflictDoNothing();
    await db.insert(airlines).values(airlineData).onConflictDoNothing();
    await db.insert(flights).values(flightEntries as any);

    console.log("✨ SEED COMPLETE! All combinations ready.");
  } catch (e) {
    console.error("❌ SEED ERROR:", e);
  }
}