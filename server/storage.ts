import { 
  airports, airlines, flights, bookings,
  type Flight, type Booking
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";

export interface IStorage {
  getAirports(): Promise<any[]>;
  getFlights(): Promise<any[]>;
  getFlightById(id: number): Promise<any | undefined>;
  createBooking(data: any): Promise<Booking>;
  getAllBookings(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getAirports() { return await db.select().from(airports); }
  async getFlights() {
    return await db.query.flights.findMany({ with: { airline: true, originAirport: true, destinationAirport: true } });
  }
  async getFlightById(id: number) {
    return await db.query.flights.findFirst({ where: eq(flights.id, id), with: { airline: true, originAirport: true, destinationAirport: true } });
  }
  async createBooking(data: any): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(data).returning();
    return newBooking;
  }
  async getAllBookings() {
    return await db.query.bookings.findMany({
      with: { flight: { with: { airline: true, originAirport: true, destinationAirport: true } } },
      orderBy: [desc(bookings.createdAt)]
    });
  }
}

export const storage = new DatabaseStorage();