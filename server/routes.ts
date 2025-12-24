import { createServer, type Server } from "http";
import type { Express } from "express";
import { db } from "./db";
import { flights, bookings, airports, pricingAttempts } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {

  // ===============================
  // AIRPORTS (DROPDOWN)
  // ===============================
  app.get("/api/airports", async (_req, res) => {
    const results = await db.query.airports.findMany();
    res.json(results);
  });

  // ===============================
  // SEARCH FLIGHTS (NO DATE BS)
  // ===============================
  app.get("/api/flights/search", async (req, res) => {
    try {
      const { origin, destination } = req.query;
      console.log("Search request - origin:", origin, "destination:", destination);

      if (!origin || !destination) {
        return res.json([]);
      }

      const results = await db.query.flights.findMany({
        where: (f, { eq, and }) =>
          and(
            eq(f.originAirportId, Number(origin)),
            eq(f.destinationAirportId, Number(destination))
          ),
      });

      console.log("Search results found:", results.length);
      res.json(results);
    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // ===============================
  // GET SINGLE FLIGHT
  // ===============================
  app.get("/api/flights/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query.flights.findFirst({
        where: (f, { eq }) => eq(f.id, Number(id)),
        with: {
          airline: true,
          originAirport: true,
          destinationAirport: true,
        },
      });

      if (!result) {
        return res.status(404).json({ message: "Flight not found" });
      }
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch flight" });
    }
  });

  // ===============================
  // BOOKING WITH SURGE PRICING
  // ===============================
  app.post("/api/bookings", async (req, res) => {
    try {
      const { flightId, seatNumber, passengerName } = req.body;
      const userId = "default_user"; // Track guest bookings

      // Fetch flight to get base price
      const flight = await db.query.flights.findFirst({
        where: (f, { eq }) => eq(f.id, Number(flightId)),
      });

      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }

      // Get base price
      const basePrice = flight.economyPrice || flight.basePrice || "5500";
      let finalPrice = parseFloat(basePrice);
      let surgePriceApplied = false;

      // Check for surge pricing: count attempts in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentAttempts = await db
        .select()
        .from(pricingAttempts)
        .where(
          and(
            eq(pricingAttempts.userId, userId),
            eq(pricingAttempts.flightId, Number(flightId)),
            gt(pricingAttempts.attemptTime, fiveMinutesAgo)
          )
        );

      // If 3+ attempts in 5 minutes, apply 10% surge
      if (recentAttempts.length >= 3) {
        finalPrice = finalPrice * 1.1;
        surgePriceApplied = true;
      }

      // Record this booking attempt
      await db.insert(pricingAttempts).values({
        userId,
        flightId: Number(flightId),
      });

      // Generate a simple 6-character PNR
      const pnr = Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, "0");

      const [booking] = await db
        .insert(bookings)
        .values({
          flightId: Number(flightId),
          passengerName: passengerName || "SkyVoyage Guest",
          passengerEmail: "guest@skyvoyage.com",
          seatNumber: seatNumber || "12A",
          status: "confirmed",
          totalPrice: finalPrice.toString(),
          pnr,
        } as any)
        .returning();

      const fullBooking = await db.query.bookings.findFirst({
        where: eq(bookings.id, booking.id),
        with: {
          flight: {
            with: {
              airline: true,
              originAirport: true,
              destinationAirport: true,
            },
          },
        },
      });

      res.json({
        ...fullBooking,
        surgePriceApplied,
        originalPrice: basePrice,
        finalPrice: finalPrice.toString(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Booking failed" });
    }
  });

  return createServer(app);
}
