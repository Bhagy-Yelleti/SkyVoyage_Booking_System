import { useState } from "react";
import { useLocation } from "wouter";
import { Calendar, MapPin, Users, ChevronDown, ArrowRightLeft, Search, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Airport } from "@shared/schema";

interface SearchFormProps {
  airports?: Airport[];
  compact?: boolean;
  defaultValues?: {
    origin?: string;
    destination?: string;
    date?: Date;
    passengers?: number;
    seatClass?: string;
  };
}

export function SearchForm({ airports = [], compact = false, defaultValues }: SearchFormProps) {
  const [, setLocation] = useLocation();
  const [origin, setOrigin] = useState(defaultValues?.origin || "");
  const [destination, setDestination] = useState(defaultValues?.destination || "");
  const [date, setDate] = useState<Date | undefined>(defaultValues?.date);
  const [passengers, setPassengers] = useState(defaultValues?.passengers || 1);
  const [seatClass, setSeatClass] = useState(defaultValues?.seatClass || "economy");
  const [isLoading, setIsLoading] = useState(false);

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;

    setIsLoading(true);
    const searchParams = new URLSearchParams({
      origin,
      destination,
      date: format(date, "yyyy-MM-dd"),
      passengers: passengers.toString(),
      class: seatClass,
    });
    
    setTimeout(() => {
      setLocation(`/search?${searchParams.toString()}`);
      setIsLoading(false);
    }, 300);
  };

  const popularAirports = airports.length > 0 ? airports : [
    { code: "JFK", city: "New York", name: "John F. Kennedy International" },
    { code: "LAX", city: "Los Angeles", name: "Los Angeles International" },
    { code: "LHR", city: "London", name: "Heathrow Airport" },
    { code: "CDG", city: "Paris", name: "Charles de Gaulle Airport" },
    { code: "DXB", city: "Dubai", name: "Dubai International" },
    { code: "SIN", city: "Singapore", name: "Changi Airport" },
    { code: "HND", city: "Tokyo", name: "Haneda Airport" },
    { code: "SYD", city: "Sydney", name: "Sydney Kingsford Smith" },
  ];

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs mb-1 block">From</Label>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger data-testid="select-origin-compact">
              <SelectValue placeholder="Origin" />
            </SelectTrigger>
            <SelectContent>
              {popularAirports.map((airport) => (
                <SelectItem key={airport.code} value={airport.code}>
                  {airport.code} - {airport.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs mb-1 block">To</Label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger data-testid="select-destination-compact">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              {popularAirports.filter(a => a.code !== origin).map((airport) => (
                <SelectItem key={airport.code} value={airport.code}>
                  {airport.code} - {airport.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs mb-1 block">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start" data-testid="button-date-compact">
                <Calendar className="h-4 w-4 mr-2" />
                {date ? format(date, "MMM d, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button type="submit" disabled={isLoading || !origin || !destination || !date} data-testid="button-search-compact">
          {isLoading ? (
            <Plane className="h-4 w-4 mr-2 animate-pulse" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-background/95 dark:bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-border"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Label className="text-sm font-medium mb-2 block">From</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger className="pl-10 h-12" data-testid="select-origin">
                <SelectValue placeholder="Select origin city" />
              </SelectTrigger>
              <SelectContent>
                {popularAirports.map((airport) => (
                  <SelectItem key={airport.code} value={airport.code}>
                    <div className="flex flex-col">
                      <span className="font-medium">{airport.code} - {airport.city}</span>
                      <span className="text-xs text-muted-foreground">{airport.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">To</Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1"
              onClick={swapLocations}
              data-testid="button-swap-locations"
            >
              <ArrowRightLeft className="h-3 w-3" />
            </Button>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="pl-10 h-12" data-testid="select-destination">
                <SelectValue placeholder="Select destination city" />
              </SelectTrigger>
              <SelectContent>
                {popularAirports.filter(a => a.code !== origin).map((airport) => (
                  <SelectItem key={airport.code} value={airport.code}>
                    <div className="flex flex-col">
                      <span className="font-medium">{airport.code} - {airport.city}</span>
                      <span className="text-xs text-muted-foreground">{airport.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Departure Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                data-testid="button-date"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "EEE, MMM d, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Travelers & Class</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-between font-normal"
                data-testid="button-travelers"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {passengers} {passengers === 1 ? "Traveler" : "Travelers"},{" "}
                    {seatClass.charAt(0).toUpperCase() + seatClass.slice(1)}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Number of Travelers</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      disabled={passengers <= 1}
                      data-testid="button-passengers-minus"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium" data-testid="text-passengers-count">
                      {passengers}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      disabled={passengers >= 9}
                      data-testid="button-passengers-plus"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cabin Class</Label>
                  <Select value={seatClass} onValueChange={setSeatClass}>
                    <SelectTrigger className="mt-2" data-testid="select-class">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          type="submit"
          size="lg"
          className="px-12 h-12 font-semibold"
          disabled={isLoading || !origin || !destination || !date}
          data-testid="button-search-flights"
        >
          {isLoading ? (
            <>
              <Plane className="h-5 w-5 mr-2 animate-pulse" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Search Flights
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
