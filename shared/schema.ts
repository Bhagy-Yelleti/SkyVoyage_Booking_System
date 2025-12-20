import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  city: text("city").notNull(),
  country: text("country").notNull(),
});

export const airlines = pgTable("airlines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  logo: text("logo"),
});

export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  airlineId: integer("airline_id").references(() => airlines.id),
  originAirportId: integer("origin_airport_id").references(() => airports.id),
  destinationAirportId: integer("destination_airport_id").references(() => airports.id),
  flightNumber: text("flight_number").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  economyPrice: decimal("economy_price").notNull(),
  businessPrice: decimal("business_price").notNull(),
  firstClassPrice: decimal("first_class_price").notNull(),
  aircraftType: text("aircraft_type").notNull(),
  status: text("status").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  flightId: integer("flight_id").references(() => flights.id),
  userId: integer("user_id"), 
  passengerName: text("passenger_name").notNull(),
  passengerEmail: text("passenger_email").notNull(),
  seatNumber: text("seat_number").notNull(),
  status: text("status").notNull(),
  totalPrice: decimal("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flightsRelations = relations(flights, ({ one }) => ({
  airline: one(airlines, { fields: [flights.airlineId], references: [airlines.id] }),
  originAirport: one(airports, { fields: [flights.originAirportId], references: [airports.id] }),
  destinationAirport: one(airports, { fields: [flights.destinationAirportId], references: [airports.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  flight: one(flights, { fields: [bookings.flightId], references: [flights.id] }),
}));