import { db } from "./db.ts";
import { airports, airlines, flights, seats } from "../shared/schema.ts";
import { sql } from "drizzle-orm";

const airportData = [
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", timezone: "America/New_York" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", timezone: "America/Los_Angeles" },
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", timezone: "Europe/London" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", timezone: "Europe/Paris" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", timezone: "Asia/Dubai" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", timezone: "Asia/Singapore" },
  { code: "HND", name: "Haneda Airport", city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo" },
  { code: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", timezone: "Australia/Sydney" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", timezone: "Europe/Berlin" },
  { code: "AMS", name: "Amsterdam Schiphol Airport", city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam" },
];

const airlineData = [
  { code: "SK", name: "SkyVoyage Airlines", logoUrl: null },
  { code: "UA", name: "United Airlines", logoUrl: null },
  { code: "BA", name: "British Airways", logoUrl: null },
  { code: "EK", name: "Emirates", logoUrl: null },
  { code: "SQ", name: "Singapore Airlines", logoUrl: null },
  { code: "LH", name: "Lufthansa", logoUrl: null },
];

function getRandomFlightTime(baseDate: Date, hoursOffset: number): Date {
  const date = new Date(baseDate);
  date.setHours(hoursOffset, Math.floor(Math.random() * 60), 0, 0);
  return date;
}

function getArrivalTime(departure: Date, durationHours: number): Date {
  const arrival = new Date(departure);
  arrival.setHours(arrival.getHours() + durationHours);
  return arrival;
}

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check if already seeded
  const existingAirports = await db.select().from(airports);
  if (existingAirports.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Insert airports
  const insertedAirports = await db.insert(airports).values(airportData).returning();
  console.log(`Inserted ${insertedAirports.length} airports`);

  // Insert airlines
  const insertedAirlines = await db.insert(airlines).values(airlineData).returning();
  console.log(`Inserted ${insertedAirlines.length} airlines`);

  // Create flights for the next 30 days
  const flightRoutes = [
    { from: "JFK", to: "LHR", duration: 7, economyPrice: 499, businessPrice: 1499, firstPrice: 3999 },
    { from: "LHR", to: "JFK", duration: 8, economyPrice: 549, businessPrice: 1599, firstPrice: 4299 },
    { from: "JFK", to: "CDG", duration: 7, economyPrice: 449, businessPrice: 1299, firstPrice: 3499 },
    { from: "CDG", to: "JFK", duration: 8, economyPrice: 479, businessPrice: 1399, firstPrice: 3699 },
    { from: "LAX", to: "HND", duration: 12, economyPrice: 899, businessPrice: 2499, firstPrice: 6999 },
    { from: "HND", to: "LAX", duration: 11, economyPrice: 849, businessPrice: 2399, firstPrice: 6499 },
    { from: "LAX", to: "SYD", duration: 15, economyPrice: 1199, businessPrice: 3499, firstPrice: 8999 },
    { from: "SYD", to: "LAX", duration: 14, economyPrice: 1149, businessPrice: 3299, firstPrice: 8499 },
    { from: "LHR", to: "DXB", duration: 7, economyPrice: 399, businessPrice: 1199, firstPrice: 2999 },
    { from: "DXB", to: "LHR", duration: 8, economyPrice: 429, businessPrice: 1299, firstPrice: 3199 },
    { from: "SIN", to: "LHR", duration: 13, economyPrice: 799, businessPrice: 2199, firstPrice: 5999 },
    { from: "LHR", to: "SIN", duration: 12, economyPrice: 749, businessPrice: 1999, firstPrice: 5499 },
    { from: "FRA", to: "JFK", duration: 9, economyPrice: 549, businessPrice: 1499, firstPrice: 3999 },
    { from: "JFK", to: "FRA", duration: 8, economyPrice: 499, businessPrice: 1399, firstPrice: 3699 },
    { from: "AMS", to: "DXB", duration: 6, economyPrice: 349, businessPrice: 999, firstPrice: 2499 },
    { from: "DXB", to: "AMS", duration: 7, economyPrice: 379, businessPrice: 1099, firstPrice: 2699 },
  ];

  const aircraftTypes = ["Boeing 777-300ER", "Airbus A350-900", "Boeing 787-9 Dreamliner", "Airbus A380-800"];
  const flightHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];

  const insertedFlights = [];

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);

    for (const route of flightRoutes) {
      const fromAirport = insertedAirports.find(a => a.code === route.from);
      const toAirport = insertedAirports.find(a => a.code === route.to);
      const airline = insertedAirlines[Math.floor(Math.random() * insertedAirlines.length)];
      
      if (!fromAirport || !toAirport) continue;

      // Create 2-3 flights per route per day
      const flightsPerDay = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < flightsPerDay; i++) {
        const departureHour = flightHours[Math.floor(Math.random() * flightHours.length)];
        const departureTime = getRandomFlightTime(date, departureHour);
        const arrivalTime = getArrivalTime(departureTime, route.duration);
        
        const flightNumber = `${airline.code}${100 + Math.floor(Math.random() * 900)}`;
        const aircraft = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];

        const [flight] = await db.insert(flights).values({
          flightNumber,
          airlineId: airline.id,
          originAirportId: fromAirport.id,
          destinationAirportId: toAirport.id,
          departureTime,
          arrivalTime,
          economyPrice: route.economyPrice.toFixed(2),
          businessPrice: route.businessPrice.toFixed(2),
          firstClassPrice: route.firstPrice.toFixed(2),
          economySeats: 120,
          businessSeats: 24,
          firstClassSeats: 8,
          aircraftType: aircraft,
          status: "scheduled",
        }).returning();

        insertedFlights.push(flight);
      }
    }
  }

  console.log(`Inserted ${insertedFlights.length} flights`);

  // Create seats for each flight
  let totalSeats = 0;

  for (const flight of insertedFlights) {
    const seatData = [];
    
    // First class (rows 1-2, columns A-D)
    for (let row = 1; row <= 2; row++) {
      for (const col of ["A", "B", "C", "D"]) {
        seatData.push({
          flightId: flight.id,
          seatNumber: `${row}${col}`,
          seatClass: "first",
          isAvailable: Math.random() > 0.2, // 80% available
          price: "150.00",
          row,
          column: col,
        });
      }
    }

    // Business class (rows 3-8, columns A-D)
    for (let row = 3; row <= 8; row++) {
      for (const col of ["A", "B", "C", "D"]) {
        seatData.push({
          flightId: flight.id,
          seatNumber: `${row}${col}`,
          seatClass: "business",
          isAvailable: Math.random() > 0.3, // 70% available
          price: "75.00",
          row,
          column: col,
        });
      }
    }

    // Economy class (rows 9-28, columns A-F)
    for (let row = 9; row <= 28; row++) {
      for (const col of ["A", "B", "C", "D", "E", "F"]) {
        seatData.push({
          flightId: flight.id,
          seatNumber: `${row}${col}`,
          seatClass: "economy",
          isAvailable: Math.random() > 0.4, // 60% available
          price: "25.00",
          row,
          column: col,
        });
      }
    }

    await db.insert(seats).values(seatData);
    totalSeats += seatData.length;
  }

  console.log(`Inserted ${totalSeats} seats`);
  console.log("Database seeding complete!");
}
