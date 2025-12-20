import { 
  users, airports, airlines, flights, seats, bookings, passengers, bookingAttempts,
  type User, type Flight, type Booking, type Passenger, type FlightWithDetails, type BookingWithDetails 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  updateUserWallet(id: number, newBalance: number): Promise<void>;
  getAirports(): Promise<any[]>;
  getFlights(): Promise<FlightWithDetails[]>;
  getFlightById(id: number): Promise<FlightWithDetails | undefined>;
  updateSeatAvailability(id: number, available: boolean): Promise<void>;
  createBooking(data: any): Promise<Booking>;
  createPassenger(data: any): Promise<Passenger>;
  getBookingAttempts(flightId: number): Promise<any[]>;
  createBookingAttempt(flightId: number): Promise<void>;
  getAllBookings(): Promise<BookingWithDetails[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async updateUserWallet(id: number, newBalance: number) {
    await db.update(users).set({ walletBalance: newBalance }).where(eq(users.id, id));
  }
  async getAirports() { return await db.select().from(airports); }
  async getFlights() {
    return await db.query.flights.findMany({ with: { airline: true, originAirport: true, destinationAirport: true } }) as FlightWithDetails[];
  }
  async getFlightById(id: number) {
    return await db.query.flights.findFirst({ where: eq(flights.id, id), with: { airline: true, originAirport: true, destinationAirport: true } }) as FlightWithDetails;
  }
  async updateSeatAvailability(id: number, isAvailable: boolean) {
    await db.update(seats).set({ isAvailable }).where(eq(seats.id, id));
  }
  async createBooking(data: any): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(data).returning();
    return newBooking;
  }
  async createPassenger(data: any): Promise<Passenger> {
    const [newPassenger] = await db.insert(passengers).values(data).returning();
    return newPassenger;
  }
  async getBookingAttempts(flightId: number) {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    return await db.select().from(bookingAttempts).where(and(eq(bookingAttempts.flightId, flightId), gte(bookingAttempts.createdAt, fiveMinsAgo)));
  }
  async createBookingAttempt(flightId: number) {
    await db.insert(bookingAttempts).values({ flightId });
  }
  async getAllBookings() {
    return await db.query.bookings.findMany({
      with: { flight: { with: { airline: true, originAirport: true, destinationAirport: true } }, passengers: true },
      orderBy: [desc(bookings.bookingDate)]
    }) as BookingWithDetails[];
  }
}

export const storage = new DatabaseStorage();