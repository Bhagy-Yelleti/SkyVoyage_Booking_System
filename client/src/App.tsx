import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/Landing";
import Search from "@/pages/Search";
import Booking from "@/pages/Booking";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import PassengerDetails from "@/pages/PassengerDetails";
import ConfirmBooking from "@/pages/ConfirmBooking";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/search" component={Search} />

      {/* NEW FLOW */}
      <Route path="/passenger" component={PassengerDetails} />
      <Route path="/confirm" component={ConfirmBooking} />

      {/* Existing */}
      <Route path="/booking" component={Booking} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="skyvoyage-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; // 🔥 THIS LINE FIXES EVERYTHING
