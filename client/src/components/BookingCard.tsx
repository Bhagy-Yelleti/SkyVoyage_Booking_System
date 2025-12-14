import { format } from "date-fns";
import { Plane, Calendar, Clock, MapPin, Users, Ticket, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BookingWithDetails } from "@shared/schema";

interface BookingCardProps {
  booking: BookingWithDetails;
  variant?: "upcoming" | "past";
  onViewDetails?: () => void;
  onCancel?: () => void;
  onModify?: () => void;
}

export function BookingCard({
  booking,
  variant = "upcoming",
  onViewDetails,
  onCancel,
  onModify,
}: BookingCardProps) {
  const isPast = variant === "past";
  const flight = booking.flight;
  const departureTime = new Date(flight.departureTime);
  const arrivalTime = new Date(flight.arrivalTime);

  const statusColors: Record<string, string> = {
    confirmed: "bg-chart-2/10 text-chart-2 border-chart-2/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
    completed: "bg-muted text-muted-foreground border-muted",
    pending: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  };

  return (
    <Card
      className={cn(
        "overflow-visible transition-all duration-300",
        !isPast && "hover-elevate"
      )}
      data-testid={`card-booking-${booking.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plane className={cn("h-6 w-6 text-primary", isPast && "rotate-90")} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold" data-testid={`text-route-${booking.id}`}>
                  {flight.originAirport.city} to {flight.destinationAirport.city}
                </h3>
                <Badge
                  variant="outline"
                  className={cn("text-xs", statusColors[booking.status])}
                  data-testid={`badge-status-${booking.id}`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {flight.airline.name} {flight.flightNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">PNR</p>
              <p className="font-mono font-bold text-lg" data-testid={`text-pnr-${booking.id}`}>
                {booking.pnr}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-booking-menu-${booking.id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails}>
                  <Ticket className="h-4 w-4 mr-2" />
                  View Ticket
                </DropdownMenuItem>
                {!isPast && booking.status === "confirmed" && (
                  <>
                    <DropdownMenuItem onClick={onModify}>
                      Modify Booking
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onCancel}
                      className="text-destructive focus:text-destructive"
                    >
                      Cancel Booking
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-border">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{format(departureTime, "EEE, MMM d, yyyy")}</p>
              <p className="text-xs text-muted-foreground">Departure Date</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                {format(departureTime, "HH:mm")} - {format(arrivalTime, "HH:mm")}
              </p>
              <p className="text-xs text-muted-foreground">Flight Time</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                {booking.passengers.length} {booking.passengers.length === 1 ? "Passenger" : "Passengers"}
              </p>
              <p className="text-xs text-muted-foreground">
                {booking.passengers.map(p => `${p.firstName} ${p.lastName}`).join(", ")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">{flight.originAirport.code}</span>
                <span className="mx-2 text-muted-foreground">&rarr;</span>
                <span className="font-medium">{flight.destinationAirport.code}</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-lg font-bold text-primary" data-testid={`text-total-${booking.id}`}>
              ${parseFloat(booking.totalAmount).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
