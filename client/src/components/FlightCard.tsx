import { useState } from "react";
import { Plane, Clock, Briefcase, ChevronDown, ChevronUp, Wifi, Coffee, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format, differenceInMinutes } from "date-fns";
import type { FlightWithDetails } from "@shared/schema";

interface FlightCardProps {
  flight: FlightWithDetails;
  seatClass: "economy" | "business" | "first";
  passengers: number;
  onSelect: (flight: FlightWithDetails) => void;
  index?: number;
}

export function FlightCard({ flight, seatClass, passengers, onSelect, index = 0 }: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const departureTime = new Date(flight.departureTime);
  const arrivalTime = new Date(flight.arrivalTime);
  const durationMins = differenceInMinutes(arrivalTime, departureTime);
  const hours = Math.floor(durationMins / 60);
  const minutes = durationMins % 60;

  const getPrice = () => {
    switch (seatClass) {
      case "business":
        return parseFloat(flight.businessPrice);
      case "first":
        return parseFloat(flight.firstClassPrice);
      default:
        return parseFloat(flight.economyPrice);
    }
  };

  const totalPrice = getPrice() * passengers;

  return (
    <Card
      className={cn(
        "overflow-visible p-0 animate-fade-in-up hover-elevate transition-all duration-300"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      data-testid={`card-flight-${flight.id}`}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold" data-testid={`text-airline-${flight.id}`}>
                  {flight.airline.name}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-flight-number-${flight.id}`}>
                  {flight.flightNumber}
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-4">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold" data-testid={`text-departure-time-${flight.id}`}>
                  {format(departureTime, "HH:mm")}
                </p>
                <p className="text-sm text-muted-foreground font-medium" data-testid={`text-origin-${flight.id}`}>
                  {flight.originAirport.code}
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{hours}h {minutes}m</span>
                </div>
                <div className="w-full relative my-2">
                  <div className="h-px bg-border w-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Plane className="h-4 w-4 text-primary rotate-90" />
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Non-stop
                </Badge>
              </div>

              <div className="text-center lg:text-right">
                <p className="text-2xl font-bold" data-testid={`text-arrival-time-${flight.id}`}>
                  {format(arrivalTime, "HH:mm")}
                </p>
                <p className="text-sm text-muted-foreground font-medium" data-testid={`text-destination-${flight.id}`}>
                  {flight.destinationAirport.code}
                </p>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden lg:block h-16" />

            <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
              <div className="text-right">
                <p className="text-2xl font-bold text-primary" data-testid={`text-price-${flight.id}`}>
                  ${totalPrice.toFixed(2)}
                </p>
                {passengers > 1 && (
                  <p className="text-xs text-muted-foreground">
                    ${getPrice().toFixed(2)} per person
                  </p>
                )}
              </div>
              <Button
                onClick={() => onSelect(flight)}
                className="min-w-[100px]"
                data-testid={`button-select-flight-${flight.id}`}
              >
                Select
              </Button>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              data-testid={`button-expand-${flight.id}`}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Flight Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-6 pb-6 pt-2 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Baggage Allowance
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Cabin: 1 bag (7 kg)</li>
                  <li>Check-in: {seatClass === "economy" ? "1 bag (23 kg)" : seatClass === "business" ? "2 bags (32 kg each)" : "3 bags (32 kg each)"}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Wifi className="h-3 w-3" />
                    Free WiFi
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Tv className="h-3 w-3" />
                    Entertainment
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Coffee className="h-3 w-3" />
                    {seatClass === "economy" ? "Snacks" : "Meals Included"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Aircraft</h4>
                <p className="text-sm text-muted-foreground">{flight.aircraftType}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Date: {format(departureTime, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
