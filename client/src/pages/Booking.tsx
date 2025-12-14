import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookingSteps } from "@/components/BookingSteps";
import { SeatMap } from "@/components/SeatMap";
import { PassengerForm, type PassengerFormData } from "@/components/PassengerForm";
import { PaymentForm, type CardFormData } from "@/components/PaymentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format, differenceInMinutes } from "date-fns";
import { Plane, Clock, ArrowRight, Check, Calendar, Users } from "lucide-react";
import type { FlightWithDetails, Seat } from "@shared/schema";

const steps = [
  { id: 1, name: "Select Seats" },
  { id: 2, name: "Passenger Details" },
  { id: 3, name: "Payment" },
  { id: 4, name: "Confirmation" },
];

export default function Booking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const flightId = searchParams.get("flightId") || "";
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const seatClass = (searchParams.get("class") || "economy") as "economy" | "business" | "first";

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerData, setPassengerData] = useState<PassengerFormData[]>([]);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to complete your booking.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: flight, isLoading: flightLoading } = useQuery<FlightWithDetails>({
    queryKey: ["/api/flights", flightId],
    enabled: !!flightId,
  });

  const { data: seats, isLoading: seatsLoading } = useQuery<Seat[]>({
    queryKey: ["/api/flights", flightId, "seats"],
    enabled: !!flightId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: {
      flightId: string;
      passengers: PassengerFormData[];
      seatIds: string[];
      paymentMethod: string;
    }) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res;
    },
    onSuccess: (data) => {
      setBookingResult(data);
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Confirmed!",
        description: "Your flight has been successfully booked.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handlePassengerSubmit = (index: number, data: PassengerFormData) => {
    setPassengerData((prev) => {
      const updated = [...prev];
      updated[index] = data;
      return updated;
    });
  };

  const handlePayment = (method: string, _cardData?: CardFormData) => {
    bookingMutation.mutate({
      flightId,
      passengers: passengerData,
      seatIds: selectedSeats,
      paymentMethod: method,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedSeats.length === passengers;
      case 2:
        return passengerData.length === passengers && passengerData.every(p => p.firstName);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getPrice = () => {
    if (!flight) return 0;
    switch (seatClass) {
      case "business":
        return parseFloat(flight.businessPrice);
      case "first":
        return parseFloat(flight.firstClassPrice);
      default:
        return parseFloat(flight.economyPrice);
    }
  };

  const getSeatTotal = () => {
    if (!seats) return 0;
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return total + (seat ? parseFloat(seat.price) : 0);
    }, 0);
  };

  const baseTotal = getPrice() * passengers;
  const seatCharges = getSeatTotal();
  const taxes = baseTotal * 0.12;
  const grandTotal = baseTotal + seatCharges + taxes;

  if (authLoading || flightLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-12 w-64 mx-auto mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Flight Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The flight you're looking for doesn't exist or is no longer available.
            </p>
            <Button onClick={() => setLocation("/search")}>Search Flights</Button>
          </Card>
        </main>
      </div>
    );
  }

  const departureTime = new Date(flight.departureTime);
  const arrivalTime = new Date(flight.arrivalTime);
  const durationMins = differenceInMinutes(arrivalTime, departureTime);
  const hours = Math.floor(durationMins / 60);
  const minutes = durationMins % 60;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingSteps steps={steps} currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Your Seats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6">
                        Select {passengers} seat{passengers > 1 ? "s" : ""} for your journey.
                        {seatClass !== "economy" && (
                          <Badge variant="secondary" className="ml-2">
                            {seatClass.charAt(0).toUpperCase() + seatClass.slice(1)} Class
                          </Badge>
                        )}
                      </p>
                      {seatsLoading ? (
                        <Skeleton className="h-64 w-full" />
                      ) : seats ? (
                        <SeatMap
                          seats={seats}
                          selectedSeats={selectedSeats}
                          onSeatSelect={handleSeatSelect}
                          maxSelections={passengers}
                          seatClass={seatClass}
                        />
                      ) : null}
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  {Array.from({ length: passengers }).map((_, index) => {
                    const seat = seats?.find((s) => s.id === selectedSeats[index]);
                    return (
                      <PassengerForm
                        key={index}
                        index={index}
                        seatNumber={seat?.seatNumber}
                        onSubmit={(data) => handlePassengerSubmit(index, data)}
                        defaultValues={passengerData[index]}
                      />
                    );
                  })}
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fade-in">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PaymentForm
                        amount={grandTotal}
                        onSubmit={handlePayment}
                        isLoading={bookingMutation.isPending}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === 4 && bookingResult && (
                <div className="animate-fade-in">
                  <Card className="text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <Check className="h-8 w-8 text-chart-2" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                    <p className="text-muted-foreground mb-6">
                      Your flight has been successfully booked. Check your email for the e-ticket.
                    </p>
                    
                    <div className="bg-muted/50 rounded-xl p-6 mb-6">
                      <p className="text-sm text-muted-foreground mb-2">Confirmation Number (PNR)</p>
                      <p className="text-3xl font-mono font-bold text-primary" data-testid="text-pnr-confirmation">
                        {bookingResult.pnr}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <Button onClick={() => setLocation("/dashboard")} data-testid="button-view-bookings">
                        View My Bookings
                      </Button>
                      <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-book-another">
                        Book Another Flight
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Flight Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plane className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{flight.airline.name}</p>
                      <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{flight.originAirport.code}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-lg">{flight.destinationAirport.code}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(departureTime, "EEE, MMM d, yyyy")}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(departureTime, "HH:mm")} - {format(arrivalTime, "HH:mm")} ({hours}h {minutes}m)
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {passengers} {passengers === 1 ? "Passenger" : "Passengers"}, {seatClass.charAt(0).toUpperCase() + seatClass.slice(1)}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Fare ({passengers}x)</span>
                      <span>${baseTotal.toFixed(2)}</span>
                    </div>
                    {seatCharges > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Seat Selection</span>
                        <span>${seatCharges.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Taxes & Fees</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary" data-testid="text-booking-total">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {currentStep < 4 && (
                    <div className="pt-4 space-y-3">
                      <Button
                        className="w-full"
                        disabled={!canProceed()}
                        onClick={() => setCurrentStep(currentStep + 1)}
                        data-testid="button-continue"
                      >
                        {currentStep === 3 ? "Proceed to Payment" : "Continue"}
                      </Button>
                      {currentStep > 1 && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setCurrentStep(currentStep - 1)}
                          data-testid="button-back"
                        >
                          Back
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
