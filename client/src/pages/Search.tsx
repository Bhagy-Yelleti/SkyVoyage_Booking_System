import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { FlightCard } from "@/components/FlightCard";
import { useLocation } from "wouter";

export default function Search() {
  const [location, setLocation] = useLocation();

  // Read query params. wouter's `location` may not include the search string,
  // so prefer the real `window.location.search` on the client when available.
  const searchString = (() => {
    if (typeof window !== "undefined" && window.location && window.location.search) {
      return window.location.search;
    }
    // fallback to wouter location if it happens to include the query
    return location.includes("?") ? `?${location.split("?")[1]}` : "";
  })();

  const params = new URLSearchParams(searchString);
  const origin = params.get("origin");
  const destination = params.get("destination");

  console.log("Search page - location:", location);
  console.log("Search page - origin:", origin, "destination:", destination);

  const { data: flights = [], isLoading, error } = useQuery({
    queryKey: ["flights", origin, destination],
    queryFn: async () => {
      const url = `/api/flights/search?origin=${origin}&destination=${destination}`;
      console.log("Fetching flights from:", url);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Search failed: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Flights fetched:", data, "count:", data.length);
      return data;
    },
    enabled: !!origin && !!destination,
  });

  // When selecting a flight, navigate to the booking flow with query params

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="pt-32 px-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Available Flights</h1>

        {isLoading && <p>Loading flights...</p>}

        {error && (
          <p className="text-red-500 font-semibold">Error: {(error as Error).message}</p>
        )}

        {!isLoading && flights.length === 0 && !error && (
          <p className="text-slate-400">No flights found.</p>
        )}

        {flights.map((flight: any) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onSelect={() => setLocation(`/booking?flightId=${flight.id}&passengers=1&class=economy`)}
          />
        ))}
      </main>
    </div>
  );
}
 