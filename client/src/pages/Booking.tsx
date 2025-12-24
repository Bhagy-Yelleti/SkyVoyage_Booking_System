import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateTicketPDF } from "@/lib/pdf-gen";
import { Check, Download, ArrowLeft, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const SEAT_ROWS = 12;
const SEAT_COLS = ["A", "B", "C", "D", "E", "F"];

export default function Booking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const flightId = params.get("flightId") || "";

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [passengerName, setPassengerName] = useState("SkyVoyage Guest");

  // Fetch flight details
  const { data: flight, isLoading: flightLoading } = useQuery({
    queryKey: ["flight", flightId],
    queryFn: async () => {
      const res = await fetch(`/api/flights/${flightId}`);
      if (!res.ok) throw new Error("Failed to load flight");
      return res.json();
    },
    enabled: !!flightId,
  });

  // Mutation to create booking
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSeat) throw new Error("Please select a seat");
      const res = await apiRequest("POST", "/api/bookings", {
        flightId: Number(flightId),
        seatNumber: selectedSeat,
        passengerName,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setBookingResult(data);
      toast({ title: "Booking Successful!", description: `PNR: ${data.pnr || "GUEST"}` });
      // Auto-download PDF after 1 second
      setTimeout(() => {
        if (flight) generateTicketPDF(data);
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (flightLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <Plane className="h-12 w-12 text-blue-500" />
            </div>
            <p>Loading flight details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <p className="text-red-500 font-semibold mb-4">Flight not found</p>
            <Button onClick={() => setLocation("/search")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (bookingResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-24 pb-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="text-center p-12 border-2 border-green-100 shadow-lg bg-gradient-to-br from-green-50 to-white">
              <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-2 text-gray-900">Booking Confirmed!</h2>
              <p className="text-slate-600 mb-6">Your flight is booked and ticket has been downloaded.</p>

              <div className="bg-slate-100 p-6 rounded-2xl mb-8 inline-block border">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">PNR</p>
                <p className="text-4xl font-mono font-black text-blue-600">
                  {bookingResult.pnr || "BOOKING"}
                </p>
              </div>

              <div className="space-y-2 mb-8 text-left bg-slate-50 p-4 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Passenger:</span> {passengerName}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Seat:</span> {selectedSeat}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Flight:</span> {flight?.flightNumber}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Route:</span> {flight?.originAirport?.city} →{" "}
                  {flight?.destinationAirport?.city}
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    if (flight) generateTicketPDF(bookingResult);
                  }}
                  className="gap-2 h-12 px-8"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button onClick={() => setLocation("/search")} variant="outline" className="h-12 px-8">
                  Book Another Flight
                </Button>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Flight Info */}
          <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                {flight?.airline?.name} {flight?.flightNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 uppercase text-xs font-semibold">From</p>
                  <p className="text-lg font-bold">{flight?.originAirport?.city}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase text-xs font-semibold">To</p>
                  <p className="text-lg font-bold">{flight?.destinationAirport?.city}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase text-xs font-semibold">Price</p>
                  <p className="text-lg font-bold text-blue-600">₹{flight?.economyPrice}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase text-xs font-semibold">Aircraft</p>
                  <p className="text-lg font-bold">{flight?.aircraftType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seat Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Seat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Passenger Name Input */}
                  <div>
                    <label className="text-sm font-semibold">Passenger Name</label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Seat Map */}
                  <div>
                    <p className="text-sm text-slate-600 mb-4">Click a seat to select (Economy Class)</p>
                    <div className="bg-slate-50 p-6 rounded-lg border overflow-x-auto">
                      <div className="space-y-2 min-w-fit">
                        {Array.from({ length: SEAT_ROWS }, (_, r) => (
                          <div key={r} className="flex gap-2 items-center justify-center">
                            <span className="text-xs font-semibold w-6 text-slate-500">{r + 1}</span>
                            {SEAT_COLS.map((col) => {
                              const seatNo = `${r + 1}${col}`;
                              const isSelected = selectedSeat === seatNo;
                              return (
                                <button
                                  key={seatNo}
                                  onClick={() => setSelectedSeat(seatNo)}
                                  className={cn(
                                    "w-8 h-8 rounded text-xs font-bold transition-all duration-200",
                                    isSelected
                                      ? "bg-blue-600 text-white shadow-lg scale-110"
                                      : "bg-white border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                                  )}
                                >
                                  {col}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Selected Seat Info */}
                  {selectedSeat && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">Selected Seat:</span>{" "}
                        <span className="text-lg font-bold text-blue-600">{selectedSeat}</span>
                      </p>
                    </div>
                  )}

                  {/* Book Button */}
                  <Button
                    onClick={() => bookingMutation.mutate()}
                    disabled={!selectedSeat || bookingMutation.isPending}
                    className="w-full h-12 text-lg font-bold"
                  >
                    {bookingMutation.isPending ? "Booking..." : "Complete Booking"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Flight:</span>
                    <span className="font-semibold">{flight?.flightNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Seat:</span>
                    <span className="font-semibold text-blue-600">{selectedSeat || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Passenger:</span>
                    <span className="font-semibold">{passengerName}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{flight?.economyPrice}</span>
                  </div>
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

