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
import {
  Plane,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Calendar,
  BarChart3,
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
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, user, toast]);

  const { data: flights, isLoading: flightsLoading } = useQuery<FlightWithDetails[]>({
    queryKey: ["/api/admin/flights"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: airports } = useQuery<Airport[]>({
    queryKey: ["/api/airports"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: airlines } = useQuery<Airline[]>({
    queryKey: ["/api/airlines"],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const stats = [
    {
      label: "Total Flights",
      value: flights?.length || 0,
      icon: Plane,
      change: "+12%",
    },
    {
      label: "Total Bookings",
      value: bookings?.length || 0,
      icon: Users,
      change: "+8%",
    },
    {
      label: "Revenue",
      value: `$${(bookings?.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0) || 0).toLocaleString()}`,
      icon: DollarSign,
      change: "+23%",
    },
    {
      label: "Occupancy Rate",
      value: "78%",
      icon: TrendingUp,
      change: "+5%",
    },
  ];

  const filteredFlights = flights?.filter(
    (f) =>
      f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.originAirport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.destinationAirport.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-12 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage flights, bookings, and view analytics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={stat.label}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold" data-testid={`text-admin-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-chart-2">
                      {stat.change} this month
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="flights" className="animate-fade-in">
            <TabsList className="mb-6">
              <TabsTrigger value="flights" data-testid="tab-admin-flights">
                <Plane className="h-4 w-4 mr-2" />
                Flights
              </TabsTrigger>
              <TabsTrigger value="bookings" data-testid="tab-admin-bookings">
                <Calendar className="h-4 w-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-admin-analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flights">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle>Flight Management</CardTitle>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search flights..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                          data-testid="input-search-flights"
                        />
                      </div>
                      <Dialog open={isAddFlightOpen} onOpenChange={setIsAddFlightOpen}>
                        <DialogTrigger asChild>
                          <Button data-testid="button-add-flight">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Flight
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Add New Flight</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                              <Label>Flight Number</Label>
                              <Input placeholder="e.g., SK101" />
                            </div>
                            <div>
                              <Label>Airline</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select airline" />
                                </SelectTrigger>
                                <SelectContent>
                                  {airlines?.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                      {a.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Origin</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select origin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {airports?.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                      {a.code} - {a.city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Destination</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                                <SelectContent>
                                  {airports?.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                      {a.code} - {a.city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Departure Time</Label>
                              <Input type="datetime-local" />
                            </div>
                            <div>
                              <Label>Arrival Time</Label>
                              <Input type="datetime-local" />
                            </div>
                            <div>
                              <Label>Economy Price ($)</Label>
                              <Input type="number" placeholder="299" />
                            </div>
                            <div>
                              <Label>Business Price ($)</Label>
                              <Input type="number" placeholder="699" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsAddFlightOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => setIsAddFlightOpen(false)}>
                              Add Flight
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {flightsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Flight</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Economy</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFlights?.map((flight) => (
                          <TableRow key={flight.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                  <Plane className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{flight.flightNumber}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {flight.airline.name}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {flight.originAirport.code} → {flight.destinationAirport.code}
                            </TableCell>
                            <TableCell>
                              {format(new Date(flight.departureTime), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  flight.status === "scheduled"
                                    ? "bg-chart-2/10 text-chart-2 border-chart-2/30"
                                    : "bg-muted"
                                }
                              >
                                {flight.status}
                              </Badge>
                            </TableCell>
                            <TableCell>${parseFloat(flight.economyPrice).toFixed(0)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>PNR</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Flight</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings?.slice(0, 10).map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono font-bold">
                              {booking.pnr}
                            </TableCell>
                            <TableCell>
                              {booking.passengers[0]?.firstName} {booking.passengers[0]?.lastName}
                            </TableCell>
                            <TableCell>{booking.flight.flightNumber}</TableCell>
                            <TableCell>
                              {format(new Date(booking.createdAt || new Date()), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  booking.status === "confirmed"
                                    ? "bg-chart-2/10 text-chart-2 border-chart-2/30"
                                    : "bg-destructive/10 text-destructive border-destructive/30"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${parseFloat(booking.totalAmount).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Revenue chart visualization</p>
                        <p className="text-sm">Coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Trend chart visualization</p>
                        <p className="text-sm">Coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
