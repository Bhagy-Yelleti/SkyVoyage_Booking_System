import {
  users,
  airports,
  airlines,
  flights,
  seats,
  bookings,
  passengers,
  type User,
  type UpsertUser,
  type Airport,
  type InsertAirport,
  type Airline,
  type InsertAirline,
  type Flight,
  type InsertFlight,
  type Seat,
  type InsertSeat,
  type Booking,
  type InsertBooking,
  type Passenger,
  type InsertPassenger,
  type FlightWithDetails,
  type BookingWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Airport operations
  getAirports(): Promise<Airport[]>;
  getAirportByCode(code: string): Promise<Airport | undefined>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  
  // Airline operations
  getAirlines(): Promise<Airline[]>;
  createAirline(airline: InsertAirline): Promise<Airline>;
  
  // Flight operations
  getFlights(): Promise<FlightWithDetails[]>;
  getFlightById(id: string): Promise<FlightWithDetails | undefined>;
  searchFlights(origin: string, destination: string, date: string): Promise<FlightWithDetails[]>;
  createFlight(flight: InsertFlight): Promise<Flight>;
  
  // Seat operations
  getSeatsByFlightId(flightId: string): Promise<Seat[]>;
  createSeat(seat: InsertSeat): Promise<Seat>;
  updateSeatAvailability(seatId: string, isAvailable: boolean): Promise<void>;
  
  // Booking operations
  getBookingsByUserId(userId: string): Promise<BookingWithDetails[]>;
  getAllBookings(): Promise<BookingWithDetails[]>;
  getBookingById(id: string): Promise<BookingWithDetails | undefined>;
  createBooking(booking: InsertBooking, pnr: string): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<void>;
  
  // Passenger operations
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;
  getPassengersByBookingId(bookingId: string): Promise<Passenger[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Airport operations
  async getAirports(): Promise<Airport[]> {
    return db.select().from(airports);
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    const [airport] = await db.select().from(airports).where(eq(airports.code, code));
    return airport;
  }

  async createAirport(airport: InsertAirport): Promise<Airport> {
    const [created] = await db.insert(airports).values(airport).returning();
    return created;
  }

  // Airline operations
  async getAirlines(): Promise<Airline[]> {
    return db.select().from(airlines);
  }

  async createAirline(airline: InsertAirline): Promise<Airline> {
    const [created] = await db.insert(airlines).values(airline).returning();
    return created;
  }

  // Flight operations
  async getFlights(): Promise<FlightWithDetails[]> {
    const flightList = await db.select().from(flights);
    const result: FlightWithDetails[] = [];
    
    for (const flight of flightList) {
      const [airline] = await db.select().from(airlines).where(eq(airlines.id, flight.airlineId));
      const [originAirport] = await db.select().from(airports).where(eq(airports.id, flight.originAirportId));
      const [destinationAirport] = await db.select().from(airports).where(eq(airports.id, flight.destinationAirportId));
      
      if (airline && originAirport && destinationAirport) {
        result.push({
          ...flight,
          airline,
          originAirport,
          destinationAirport,
        });
      }
    }
    
    return result;
  }

  async getFlightById(id: string): Promise<FlightWithDetails | undefined> {
    const [flight] = await db.select().from(flights).where(eq(flights.id, id));
    if (!flight) return undefined;
    
    const [airline] = await db.select().from(airlines).where(eq(airlines.id, flight.airlineId));
    const [originAirport] = await db.select().from(airports).where(eq(airports.id, flight.originAirportId));
    const [destinationAirport] = await db.select().from(airports).where(eq(airports.id, flight.destinationAirportId));
    
    if (!airline || !originAirport || !destinationAirport) return undefined;
    
    return {
      ...flight,
      airline,
      originAirport,
      destinationAirport,
    };
  }

  async searchFlights(origin: string, destination: string, date: string): Promise<FlightWithDetails[]> {
    const originAirport = await this.getAirportByCode(origin);
    const destAirport = await this.getAirportByCode(destination);
    
    if (!originAirport || !destAirport) return [];
    
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const flightList = await db
      .select()
      .from(flights)
      .where(
        and(
          eq(flights.originAirportId, originAirport.id),
          eq(flights.destinationAirportId, destAirport.id),
          gte(flights.departureTime, startOfDay),
          lte(flights.departureTime, endOfDay)
        )
      );
    
    const result: FlightWithDetails[] = [];
    
    for (const flight of flightList) {
      const [airline] = await db.select().from(airlines).where(eq(airlines.id, flight.airlineId));
      
      if (airline) {
        result.push({
          ...flight,
          airline,
          originAirport,
          destinationAirport: destAirport,
        });
      }
    }
    
    return result;
  }

  async createFlight(flight: InsertFlight): Promise<Flight> {
    const [created] = await db.insert(flights).values(flight).returning();
    return created;
  }

  // Seat operations
  async getSeatsByFlightId(flightId: string): Promise<Seat[]> {
    return db.select().from(seats).where(eq(seats.flightId, flightId));
  }

  async createSeat(seat: InsertSeat): Promise<Seat> {
    const [created] = await db.insert(seats).values(seat).returning();
    return created;
  }

  async updateSeatAvailability(seatId: string, isAvailable: boolean): Promise<void> {
    await db.update(seats).set({ isAvailable }).where(eq(seats.id, seatId));
  }

  // Booking operations
  async getBookingsByUserId(userId: string): Promise<BookingWithDetails[]> {
    const bookingList = await db.select().from(bookings).where(eq(bookings.userId, userId));
    return this.enrichBookings(bookingList);
  }

  async getAllBookings(): Promise<BookingWithDetails[]> {
    const bookingList = await db.select().from(bookings);
    return this.enrichBookings(bookingList);
  }

  private async enrichBookings(bookingList: Booking[]): Promise<BookingWithDetails[]> {
    const result: BookingWithDetails[] = [];
    
    for (const booking of bookingList) {
      const flight = await this.getFlightById(booking.flightId);
      const passengerList = await this.getPassengersByBookingId(booking.id);
      
      if (flight) {
        result.push({
          ...booking,
          flight,
          passengers: passengerList,
        });
      }
    }
    
    return result;
  }

  async getBookingById(id: string): Promise<BookingWithDetails | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) return undefined;
    
    const flight = await this.getFlightById(booking.flightId);
    const passengerList = await this.getPassengersByBookingId(booking.id);
    
    if (!flight) return undefined;
    
    return {
      ...booking,
      flight,
      passengers: passengerList,
    };
  }

  async createBooking(booking: InsertBooking, pnr: string): Promise<Booking> {
    const [created] = await db
      .insert(bookings)
      .values({ ...booking, pnr })
      .returning();
    return created;
  }

  async updateBookingStatus(id: string, status: string): Promise<void> {
    await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id));
  }

  // Passenger operations
  async createPassenger(passenger: InsertPassenger): Promise<Passenger> {
    const [created] = await db.insert(passengers).values(passenger).returning();
    return created;
  }

  async getPassengersByBookingId(bookingId: string): Promise<Passenger[]> {
    return db.select().from(passengers).where(eq(passengers.bookingId, bookingId));
  }
}

export const storage = new DatabaseStorage();
