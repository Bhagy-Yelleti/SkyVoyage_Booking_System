import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { FlightCard } from "@/components/FlightCard"; 
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateTicketPDF } from "@/lib/pdf-gen";

export default function Search() {
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";

  const { data: flights, isLoading } = useQuery<any[]>({
    queryKey: [`/api/flights/search/${origin}/${destination}/${date}`],
    enabled: !!origin && !!destination,
  });

  const bookingMutation = useMutation({
    mutationFn: async (flightId: any) => {
      const res = await apiRequest("POST", "/api/bookings", { flightId });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Booking Confirmed!", description: "Your ticket is downloading..." });
      generateTicketPDF(data); // AUTOMATIC PDF GENERATION
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Booking failed." });
    }
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-32 px-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Available Flights</h1>
        {isLoading ? <p>Searching flights...</p> : 
         flights?.length === 0 ? <p>No flights found for this route.</p> :
         flights?.map((f) => (
           <FlightCard 
             key={f.id} 
             flight={f} 
             onSelect={(id: any) => bookingMutation.mutate(id)} 
           />
         ))}
      </main>
    </div>
  );
}