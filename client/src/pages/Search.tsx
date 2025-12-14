import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchForm } from "@/components/SearchForm";
import { FlightCard } from "@/components/FlightCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Plane, SlidersHorizontal } from "lucide-react";
import type { FlightWithDetails, Airport } from "@shared/schema";

export default function Search() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const seatClass = (searchParams.get("class") || "economy") as "economy" | "business" | "first";

  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>(["nonstop"]);

  const { data: airports } = useQuery<Airport[]>({
    queryKey: ["/api/airports"],
  });

  const { data: flights, isLoading } = useQuery<FlightWithDetails[]>({
    queryKey: ["/api/flights/search", origin, destination, date, seatClass],
    enabled: !!origin && !!destination && !!date,
  });

  const airlines = useMemo(() => {
    if (!flights) return [];
    const uniqueAirlines = new Map<string, string>();
    flights.forEach(f => uniqueAirlines.set(f.airline.id, f.airline.name));
    return Array.from(uniqueAirlines, ([id, name]) => ({ id, name }));
  }, [flights]);

  const filteredFlights = useMemo(() => {
    if (!flights) return [];
    return flights.filter(flight => {
      const price = seatClass === "business" 
        ? parseFloat(flight.businessPrice)
        : seatClass === "first"
        ? parseFloat(flight.firstClassPrice)
        : parseFloat(flight.economyPrice);
      
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline.id)) return false;
      return true;
    });
  }, [flights, priceRange, selectedAirlines, seatClass]);

  const handleFlightSelect = (flight: FlightWithDetails) => {
    const params = new URLSearchParams({
      flightId: flight.id,
      passengers: passengers.toString(),
      class: seatClass,
    });
    setLocation(`/booking?${params.toString()}`);
  };

  const toggleAirline = (airlineId: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airlineId)
        ? prev.filter(id => id !== airlineId)
        : [...prev, airlineId]
    );
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={2000}
          step={50}
          className="mb-2"
          data-testid="slider-price"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Stops</h3>
        <div className="space-y-3">
          {["nonstop", "1stop", "2plus"].map((stop) => (
            <div key={stop} className="flex items-center gap-2">
              <Checkbox
                id={`stop-${stop}`}
                checked={selectedStops.includes(stop)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStops([...selectedStops, stop]);
                  } else {
                    setSelectedStops(selectedStops.filter(s => s !== stop));
                  }
                }}
                data-testid={`checkbox-stop-${stop}`}
              />
              <Label htmlFor={`stop-${stop}`} className="text-sm cursor-pointer">
                {stop === "nonstop" ? "Non-stop" : stop === "1stop" ? "1 Stop" : "2+ Stops"}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {airlines.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Airlines</h3>
          <div className="space-y-3">
            {airlines.map((airline) => (
              <div key={airline.id} className="flex items-center gap-2">
                <Checkbox
                  id={`airline-${airline.id}`}
                  checked={selectedAirlines.includes(airline.id)}
                  onCheckedChange={() => toggleAirline(airline.id)}
                  data-testid={`checkbox-airline-${airline.id}`}
                />
                <Label htmlFor={`airline-${airline.id}`} className="text-sm cursor-pointer">
                  {airline.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setPriceRange([0, 2000]);
          setSelectedAirlines([]);
          setSelectedStops(["nonstop"]);
        }}
        data-testid="button-clear-filters"
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="bg-card border-b border-border py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchForm
              airports={airports || []}
              compact
              defaultValues={{
                origin,
                destination,
                date: date ? new Date(date) : undefined,
                passengers,
                seatClass,
              }}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <Card className="p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5" />
                  <h2 className="font-semibold text-lg">Filters</h2>
                </div>
                <FiltersContent />
              </Card>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold">
                    {origin} to {destination}
                  </h1>
                  <p className="text-muted-foreground">
                    {date && new Date(date).toLocaleDateString("en-US", { 
                      weekday: "long", 
                      month: "long", 
                      day: "numeric", 
                      year: "numeric" 
                    })}
                    {" "}&bull;{" "}
                    {passengers} {passengers === 1 ? "passenger" : "passengers"}
                    {" "}&bull;{" "}
                    {seatClass.charAt(0).toUpperCase() + seatClass.slice(1)}
                  </p>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden" data-testid="button-mobile-filters">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredFlights && filteredFlights.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {filteredFlights.length} flight{filteredFlights.length !== 1 ? "s" : ""} found
                  </p>
                  {filteredFlights.map((flight, index) => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      seatClass={seatClass}
                      passengers={passengers}
                      onSelect={handleFlightSelect}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Flights Found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any flights matching your search criteria. Try adjusting your filters or search for different dates.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPriceRange([0, 2000]);
                      setSelectedAirlines([]);
                    }}
                  >
                    Reset Filters
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
