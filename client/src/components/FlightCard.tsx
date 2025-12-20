import { useState } from "react";
import { Plane, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function FlightCard({ flight, seatClass, passengers, onSelect }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const departureTime = new Date(flight?.departureTime || Date.now());
  const arrivalTime = new Date(flight?.arrivalTime || Date.now());

  return (
    <Card className="mb-4 overflow-hidden border-slate-800 bg-slate-900/50">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
              <Plane className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-white">{flight?.airline?.name || "Airline"}</p>
              <p className="text-sm text-slate-400">{flight?.flightNumber}</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between px-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{format(departureTime, "HH:mm")}</p>
              <p className="text-sm text-slate-400">{flight?.originAirport?.code}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-px bg-slate-700 my-2 relative">
                <Plane className="h-3 w-3 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
              </div>
              <Badge variant="outline" className="text-[10px]">Non-stop</Badge>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{format(arrivalTime, "HH:mm")}</p>
              <p className="text-sm text-slate-400">{flight?.destinationAirport?.code}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="text-2xl font-bold text-blue-500">${flight?.economyPrice}</p>
            <Button onClick={() => onSelect(flight.id)} className="bg-blue-600 hover:bg-blue-700">Select</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}