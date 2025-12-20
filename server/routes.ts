import { createServer, type Server } from "http";
import type { Express } from "express";
import { db } from "./db";
import { flights, bookings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Flight Search
  app.get("/api/flights/search/:origin/:destination/:date", async (req, res) => {
    try {
      const { origin, destination } = req.params;
      const results = await db.query.flights.findMany({
        where: (f, { eq, and }) => and(
          eq(f.originAirportId, parseInt(origin)),
          eq(f.destinationAirportId, parseInt(destination))
        ),
        with: {
          airline: true,
          originAirport: true,
          destinationAirport: true
        }
      });
      res.json(results || []);
    } catch (e) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const { flightId } = req.body;
      const [newBooking] = await db.insert(bookings).values({
        flightId: parseInt(flightId),
        userId: null, 
        passengerName: "Guest User",
        passengerEmail: "guest@example.com",
        seatNumber: "12A",
        status: "confirmed",
        totalPrice: "5000",
        createdAt: new Date()
      } as any).returning();

      // Fetch full details for the ticket/PDF
      const fullBooking = await db.query.bookings.findFirst({
        where: eq(bookings.id, newBooking.id),
        with: {
          flight: {
            with: { airline: true, originAirport: true, destinationAirport: true }
          }
        }
      });
      res.json(fullBooking);
    } catch (e) {
      res.status(500).json({ message: "Booking failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}