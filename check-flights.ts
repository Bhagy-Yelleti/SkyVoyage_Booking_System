import { db } from "./server/db";
import { flights } from "./shared/schema";

async function check() {
  try {
    const allFlights = await db.query.flights.findMany();
    console.log(`Total flights in DB: ${allFlights.length}`);
    if (allFlights.length > 0) {
      console.log("First flight:", {
        id: allFlights[0].id,
        flightNumber: allFlights[0].flightNumber,
        originAirportId: allFlights[0].originAirportId,
        destinationAirportId: allFlights[0].destinationAirportId,
      });
    }
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
check();
