import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  decimal,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Airports table
export const airports = pgTable("airports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 3 }).notNull().unique(),
  name: varchar("name").notNull(),
  city: varchar("city").notNull(),
  country: varchar("country").notNull(),
  timezone: varchar("timezone").notNull(),
});

// Airlines table
export const airlines = pgTable("airlines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 2 }).notNull().unique(),
  name: varchar("name").notNull(),
  logoUrl: varchar("logo_url"),
});

// Flights table
export const flights = pgTable("flights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flightNumber: varchar("flight_number").notNull(),
  airlineId: varchar("airline_id").notNull().references(() => airlines.id),
  originAirportId: varchar("origin_airport_id").notNull().references(() => airports.id),
  destinationAirportId: varchar("destination_airport_id").notNull().references(() => airports.id),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  economyPrice: decimal("economy_price", { precision: 10, scale: 2 }).notNull(),
  businessPrice: decimal("business_price", { precision: 10, scale: 2 }).notNull(),
  firstClassPrice: decimal("first_class_price", { precision: 10, scale: 2 }).notNull(),
  economySeats: integer("economy_seats").notNull().default(120),
  businessSeats: integer("business_seats").notNull().default(24),
  firstClassSeats: integer("first_class_seats").notNull().default(8),
  aircraftType: varchar("aircraft_type").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Seats table
export const seats = pgTable("seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flightId: varchar("flight_id").notNull().references(() => flights.id),
  seatNumber: varchar("seat_number").notNull(),
  seatClass: varchar("seat_class").notNull(), // economy, business, first
  isAvailable: boolean("is_available").default(true),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  row: integer("row").notNull(),
  column: varchar("column", { length: 1 }).notNull(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pnr: varchar("pnr", { length: 6 }).notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  flightId: varchar("flight_id").notNull().references(() => flights.id),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Passengers table
export const passengers = pgTable("passengers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  title: varchar("title", { length: 10 }).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  passportNumber: varchar("passport_number"),
  seatId: varchar("seat_id").references(() => seats.id),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const airportsRelations = relations(airports, ({ many }) => ({
  departingFlights: many(flights, { relationName: "origin" }),
  arrivingFlights: many(flights, { relationName: "destination" }),
}));

export const airlinesRelations = relations(airlines, ({ many }) => ({
  flights: many(flights),
}));

export const flightsRelations = relations(flights, ({ one, many }) => ({
  airline: one(airlines, {
    fields: [flights.airlineId],
    references: [airlines.id],
  }),
  originAirport: one(airports, {
    fields: [flights.originAirportId],
    references: [airports.id],
    relationName: "origin",
  }),
  destinationAirport: one(airports, {
    fields: [flights.destinationAirportId],
    references: [airports.id],
    relationName: "destination",
  }),
  seats: many(seats),
  bookings: many(bookings),
}));

export const seatsRelations = relations(seats, ({ one }) => ({
  flight: one(flights, {
    fields: [seats.flightId],
    references: [flights.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  flight: one(flights, {
    fields: [bookings.flightId],
    references: [flights.id],
  }),
  passengers: many(passengers),
}));

export const passengersRelations = relations(passengers, ({ one }) => ({
  booking: one(bookings, {
    fields: [passengers.bookingId],
    references: [bookings.id],
  }),
  seat: one(seats, {
    fields: [passengers.seatId],
    references: [seats.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAirportSchema = createInsertSchema(airports).omit({
  id: true,
});

export const insertAirlineSchema = createInsertSchema(airlines).omit({
  id: true,
});

export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
  createdAt: true,
});

export const insertSeatSchema = createInsertSchema(seats).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  pnr: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPassengerSchema = createInsertSchema(passengers).omit({
  id: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Airport = typeof airports.$inferSelect;
export type InsertAirport = z.infer<typeof insertAirportSchema>;

export type Airline = typeof airlines.$inferSelect;
export type InsertAirline = z.infer<typeof insertAirlineSchema>;

export type Flight = typeof flights.$inferSelect;
export type InsertFlight = z.infer<typeof insertFlightSchema>;

export type Seat = typeof seats.$inferSelect;
export type InsertSeat = z.infer<typeof insertSeatSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Passenger = typeof passengers.$inferSelect;
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;

// Extended types for API responses
export type FlightWithDetails = Flight & {
  airline: Airline;
  originAirport: Airport;
  destinationAirport: Airport;
};

export type BookingWithDetails = Booking & {
  flight: FlightWithDetails;
  passengers: Passenger[];
};

// Search params schema
export const flightSearchSchema = z.object({
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  departureDate: z.string(),
  passengers: z.number().min(1).max(9).default(1),
  seatClass: z.enum(["economy", "business", "first"]).default("economy"),
});

export type FlightSearchParams = z.infer<typeof flightSearchSchema>;
