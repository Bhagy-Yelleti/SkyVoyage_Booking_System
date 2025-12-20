import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { generateTicketPDF } from "@/lib/pdf-gen"; // Import your PDF utility
import {
  Plane,
  Users,
  TrendingUp,
  Plus,
  Search,
  Calendar,
  BarChart3,
  Download,
  IndianRupee,
} from "lucide-react";
import type { FlightWithDetails, BookingWithDetails, Airport, Airline } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddFlightOpen, setIsAddFlightOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required.",
        variant: "destructive",
      });
      setTimeout(() => { window.location.href = "/"; }, 1000);
    }
  }, [isAuthenticated, authLoading, user, toast]);

  // Queries
  const { data: flights, isLoading: flightsLoading } = useQuery<FlightWithDetails[]>({
    queryKey: ["/api/admin/flights"],
    enabled: !!user?.isAdmin,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: !!user?.isAdmin,
  });

  const { data: airports } = useQuery<Airport[]>({ queryKey: ["/api/airports"] });
  const { data: airlines } = useQuery<Airline[]>({ queryKey: ["/api/airlines"] });

  // Mutation for adding flights
  const createFlightMutation = useMutation({
    mutationFn: async (newFlight: any) => {
      const res = await apiRequest("POST", "/api/admin/flights", newFlight);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flights"] });
      toast({ title: "Flight Added", description: "New flight is now live." });
      setIsAddFlightOpen(false);
    },
  });

  const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0) || 0;

  const stats = [
    { label: "Total Flights", value: flights?.length || 0, icon: Plane, change: "+12%" },
    { label: "Total Bookings", value: bookings?.length || 0, icon: Users, change: "+8%" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, change: "+23%" },
    { label: "Occupancy", value: "78%", icon: TrendingUp, change: "+5%" },
  ];

  const filteredFlights = flights?.filter(f => 
    f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.originAirport.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || !user?.isAdmin) return <div className="p-8 text-center">Checking credentials...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-8">System Overview & PNR Management</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="flights">
            <TabsList className="mb-6">
              <TabsTrigger value="flights"><Plane className="h-4 w-4 mr-2" /> Flights</TabsTrigger>
              <TabsTrigger value="bookings"><Calendar className="h-4 w-4 mr-2" /> Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="flights">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Flight Schedule</CardTitle>
                  <Button onClick={() => setIsAddFlightOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Flight</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Flight</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Departure</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFlights?.map((flight) => (
                        <TableRow key={flight.id}>
                          <TableCell className="font-medium">{flight.flightNumber}</TableCell>
                          <TableCell>{flight.originAirport.code} → {flight.destinationAirport.code}</TableCell>
                          <TableCell>{format(new Date(flight.departureTime), "MMM d, HH:mm")}</TableCell>
                          <TableCell>₹{parseFloat(flight.economyPrice).toFixed(0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader><CardTitle>PNR Logs</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PNR</TableHead>
                        <TableHead>Passenger</TableHead>
                        <TableHead>Flight</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Ticket</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono font-bold text-blue-600">{booking.pnr}</TableCell>
                          <TableCell>{booking.passengers[0]?.firstName} {booking.passengers[0]?.lastName}</TableCell>
                          <TableCell>{booking.flight.flightNumber}</TableCell>
                          <TableCell className="font-semibold">₹{parseFloat(booking.totalAmount).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => generateTicketPDF(booking, booking.flight)}
                            >
                              <Download className="h-4 w-4 mr-2" /> PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}