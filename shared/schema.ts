import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// 1. Tables
export const airlines = pgTable("airlines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  logoUrl: text("logo_url"),
});

export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  timezone: text("timezone"),
});

export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  flightNumber: text("flight_number").notNull(),
  airlineId: integer("airline_id").references(() => airlines.id),
  originAirportId: integer("origin_airport_id").references(() => airports.id),
  destinationAirportId: integer("destination_airport_id").references(() => airports.id),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  economyPrice: text("economy_price"),
  businessPrice: text("business_price"),
  firstClassPrice: text("first_class_price"),
  aircraftType: text("aircraft_type"),
  status: text("status"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  flightId: integer("flight_id").references(() => flights.id),
  passengerName: text("passenger_name").notNull(),
  passengerEmail: text("passenger_email").notNull(),
  seatNumber: text("seat_number").notNull(),
  status: text("status").notNull(), // confirmed, pending, cancelled
  totalPrice: text("total_price").notNull(),
  pnr: text("pnr"), // Booking reference
  createdAt: timestamp("created_at").defaultNow(),
});

// Surge pricing tracking
export const pricingAttempts = pgTable("pricing_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // "default_user" for guests
  flightId: integer("flight_id").notNull(),
  attemptTime: timestamp("attempt_time").defaultNow(),
});

// 2. Relations (For the PDF data)
export const flightRelations = relations(flights, ({ one }) => ({
  airline: one(airlines, { fields: [flights.airlineId], references: [airlines.id] }),
  originAirport: one(airports, { fields: [flights.originAirportId], references: [airports.id] }),
  destinationAirport: one(airports, { fields: [flights.destinationAirportId], references: [airports.id] }),
}));

export const bookingRelations = relations(bookings, ({ one }) => ({
  flight: one(flights, { fields: [bookings.flightId], references: [flights.id] }),
}));

// 3. TYPES (The fix for SearchForm Line 9)
export type Airport = typeof airports.$inferSelect;
export type Flight = typeof flights.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Airline = typeof airlines.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings);