import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // Assumes database functions are exported from this file
import { z } from "zod"; // Included if you use Zod validation

function generatePNR(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ012343216789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // All authentication logic (setupAuth, isAuthenticated) is removed.

  // User endpoints (Returns 401 status for clean local operation, since login is removed)
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // Returns 401 to ensure the frontend knows no user is logged in.
      res.status(401).json({ message: "Authentication disabled for local development" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Airports
  app.get("/api/airports", async (_req, res) => {
    try {
      const airports = await storage.getAirports();
      res.json(airports);
    } catch (error) {
      console.error("Error fetching airports:", error);
      res.status(500).json({ message: "Failed to fetch airports" });
    }
  });

  // Airlines
  app.get("/api/airlines", async (_req, res) => {
    try {
      const airlines = await storage.getAirlines();
      res.json(airlines);
    } catch (error) {
      console.error("Error fetching airlines:", error);
      res.status(500).json({ message: "Failed to fetch airlines" });
    }
  });

  // Flight search
  app.get("/api/flights/search", async (req, res) => {
    try {
      const { origin, destination, date } = req.query;
      
      if (!origin || !destination || !date) {
        return res.status(400).json({ message: "Missing search parameters" });
      }
      
      const flights = await storage.searchFlights(
        origin as string,
        destination as string,
        date as string
      );
      res.json(flights);
    } catch (error) {
      console.error("Error searching flights:", error);
      res.status(500).json({ message: "Failed to search flights" });
    }
  });

  // Get flight by ID
  app.get("/api/flights/:id", async (req, res) => {
    try {
      const flight = await storage.getFlightById(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }
      res.json(flight);
    } catch (error) {
      console.error("Error fetching flight:", error);
      res.status(500).json({ message: "Failed to fetch flight" });
    }
  });

  // Get seats for flight
  app.get("/api/flights/:id/seats", async (req, res) => {
    try {
      const seats = await storage.getSeatsByFlightId(req.params.id);
      res.json(seats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      res.status(500).json({ message: "Failed to fetch seats" });
    }
  });

  // User bookings (Uses a static DUMMY_LOCAL_USER ID since real login is removed)
  app.get("/api/bookings", async (req, res) => {
    try {
      const userId = "DUMMY_LOCAL_USER";
      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const userId = "DUMMY_LOCAL_USER";
      const { flightId, passengers, seatIds, paymentMethod } = req.body;
      
      // Calculate total
      const flight = await storage.getFlightById(flightId);
      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }
      
      const seats = await storage.getSeatsByFlightId(flightId);
      const selectedSeats = seats.filter(s => seatIds.includes(s.id));
      
      const basePrice = parseFloat(flight.economyPrice) * passengers.length;
      const seatCharges = selectedSeats.reduce((sum, s) => sum + parseFloat(s.price), 0);
      const taxes = basePrice * 0.12;
      const totalAmount = basePrice + seatCharges + taxes;
      
      // Generate PNR
      const pnr = generatePNR();
      
      // Create booking
      const booking = await storage.createBooking(
        {
          userId,
          flightId,
          status: "confirmed",
          totalAmount: totalAmount.toFixed(2),
          paymentStatus: "paid",
          paymentMethod,
        },
        pnr
      );
      
      // Create passengers and update seats
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        await storage.createPassenger({
          bookingId: booking.id,
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: new Date(p.dateOfBirth),
          passportNumber: p.passportNumber || null,
          seatId: seatIds[i] || null,
        });
        
        // Mark seat as taken
        if (seatIds[i]) {
          await storage.updateSeatAvailability(seatIds[i], false);
        }
      }
      
      res.json({ ...booking, pnr });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Cancel booking
  app.patch("/api/bookings/:id/cancel", async (req, res) => {
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Dummy check to prevent canceling a booking not made by the DUMMY user
      if (booking.userId !== "DUMMY_LOCAL_USER") { 
        return res.status(403).json({ message: "Unauthorized: Must be the booking owner" });
      }
      
      await storage.updateBookingStatus(req.params.id, "cancelled");
      
      // Release seats
      for (const passenger of booking.passengers) {
        if (passenger.seatId) {
          await storage.updateSeatAvailability(passenger.seatId, true);
        }
      }
      
      res.json({ message: "Booking cancelled" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Admin routes (Admin checks removed, allowing all access for local development)
  app.get("/api/admin/flights", async (req, res) => {
    try {
      const flights = await storage.getFlights();
      res.json(flights);
    } catch (error) {
      console.error("Error fetching admin flights:", error);
      res.status(500).json({ message: "Failed to fetch flights" });
    }
  });

  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}