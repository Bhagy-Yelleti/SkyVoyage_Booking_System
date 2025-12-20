import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookingSteps } from "@/components/BookingSteps";
import { SeatMap } from "@/components/SeatMap";
import { PassengerForm, type PassengerFormData } from "@/components/PassengerForm";
import { PaymentForm } from "@/components/PaymentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { generateTicketPDF } from "@/lib/pdf-gen"; 
import { Check, Download, Wallet, AlertTriangle, ArrowRight } from "lucide-react";
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const flightId = searchParams.get("flightId") || "";
  const passengersCount = parseInt(searchParams.get("passengers") || "1");
  const seatClass = (searchParams.get("class") || "economy") as "economy" | "business" | "first";

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerData, setPassengerData] = useState<PassengerFormData[]>([]);
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Sign in required", variant: "destructive" });
      setLocation("/auth");
    }
  }, [isAuthenticated, authLoading, setLocation, toast]);

  const { data: flight, isLoading: flightLoading } = useQuery<FlightWithDetails>({
    queryKey: [String(`/api/flights/${flightId}`)],
    enabled: !!flightId,
  });

  const { data: seats } = useQuery<Seat[]>({
    queryKey: [String(`/api/flights/${flightId}/seats`)],
    enabled: !!flightId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      // Backend expects seatIds and passengers to create the full record
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: (data) => {
      setBookingResult(data);
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Use the provided PDF generator
      if (flight) generateTicketPDF(data, flight);
      toast({ title: "Booking Successful!", description: `PNR: ${data.pnr}` });
    },
    onError: (error: any) => {
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    },
  });

  const getBasePrice = () => {
    if (!flight) return 0;
    const price = seatClass === "business" ? flight.businessPrice : 
                  seatClass === "first" ? flight.firstClassPrice : 
                  flight.economyPrice;
    return parseFloat(price.toString());
  };

  const baseTotal = getBasePrice() * passengersCount;
  const taxes = baseTotal * 0.12;
  const grandTotal = baseTotal + taxes;
  const isBalanceLow = user ? user.walletBalance < grandTotal : false;

  const handleContinue = () => {
    if (currentStep === 1 && selectedSeats.length !== passengersCount) {
      toast({ title: "Select Seats", description: `Please pick ${passengersCount} seats first.` });
      return;
    }
    if (currentStep === 2 && passengerData.length < passengersCount) {
      toast({ title: "Details Missing", description: "Please 'Confirm' details for all passengers." });
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  if (authLoading || flightLoading || !flight) return <div className="p-20 text-center animate-pulse">Loading Flight Details...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <BookingSteps steps={steps} currentStep={currentStep} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <Card><CardContent className="pt-6">
                  <SeatMap 
                    seats={seats || []} 
                    selectedSeats={selectedSeats} 
                    onSeatSelect={(id) => setSelectedSeats(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} 
                    maxSelections={passengersCount} 
                    seatClass={seatClass} 
                  />
                </CardContent></Card>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {Array.from({ length: passengersCount }).map((_, i) => (
                    <PassengerForm 
                      key={i} 
                      index={i} 
                      seatNumber={selectedSeats[i]} // Show seat info in the form card
                      onSubmit={(data) => {
                        const updated = [...passengerData];
                        updated[i] = data;
                        setPassengerData(updated);
                      }} 
                    />
                  ))}
                </div>
              )}
              {currentStep === 3 && (
                <Card><CardContent className="pt-6 text-center">
                  <div className="mb-6 p-6 border rounded-xl bg-primary/5">
                    <Wallet className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <p className="text-sm text-muted-foreground uppercase">Wallet Balance</p>
                    <p className="text-3xl font-bold">₹{user?.walletBalance.toLocaleString()}</p>
                  </div>
                  <PaymentForm 
                    amount={grandTotal} 
                    onSubmit={(method) => bookingMutation.mutate({ 
                      flightId: Number(flightId), 
                      passengers: passengerData, 
                      seatIds: selectedSeats, 
                      paymentMethod: method 
                    })} 
                    isLoading={bookingMutation.isPending} 
                  />
                </CardContent></Card>
              )}
              {currentStep === 4 && bookingResult && (
                <Card className="text-center p-12 border-2 border-green-100 shadow-lg">
                  <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-4xl font-bold mb-2">Confirmed!</h2>
                  <div className="bg-muted p-6 rounded-2xl mb-8 inline-block border">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your PNR</p>
                    <p className="text-5xl font-mono font-black text-primary">{bookingResult.pnr}</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => generateTicketPDF(bookingResult, flight)} className="gap-2 h-12 px-8">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => setLocation("/dashboard")} className="h-12 px-8">Dashboard</Button>
                  </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-t-4 border-t-primary">
                <CardHeader><CardTitle>Fare Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm"><span>Base Fare (x{passengersCount})</span><span>₹{baseTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span>Taxes (12%)</span><span>₹{taxes.toLocaleString()}</span></div>
                  <Separator />
                  <div className="flex justify-between font-black text-2xl text-primary"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
                  {isBalanceLow && currentStep < 4 && (
                    <div className="flex gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                      <AlertTriangle className="h-5 w-5 shrink-0" /><p>Insufficient wallet balance.</p>
                    </div>
                  )}
                  {currentStep < 3 && (
                    <Button className="w-full h-12 mt-4 text-lg font-bold" disabled={isBalanceLow} onClick={handleContinue}>
                      Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
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