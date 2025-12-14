import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Seat } from "@shared/schema";

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSelections: number;
  seatClass: "economy" | "business" | "first";
}

export function SeatMap({ seats, selectedSeats, onSeatSelect, maxSelections, seatClass }: SeatMapProps) {
  const filteredSeats = seats.filter(s => s.seatClass === seatClass);
  
  const rows = [...new Set(filteredSeats.map(s => s.row))].sort((a, b) => a - b);
  const columns = seatClass === "first" ? ["A", "B", "C", "D"] : 
                  seatClass === "business" ? ["A", "B", "C", "D"] : 
                  ["A", "B", "C", "D", "E", "F"];

  const getSeat = (row: number, column: string) => {
    return filteredSeats.find(s => s.row === row && s.column === column);
  };

  const getSeatStatus = (seat: Seat | undefined) => {
    if (!seat) return "none";
    if (!seat.isAvailable) return "occupied";
    if (selectedSeats.includes(seat.id)) return "selected";
    return "available";
  };

  const handleSeatClick = (seat: Seat | undefined) => {
    if (!seat || !seat.isAvailable) return;
    if (selectedSeats.includes(seat.id)) {
      onSeatSelect(seat.id);
    } else if (selectedSeats.length < maxSelections) {
      onSeatSelect(seat.id);
    }
  };

  const selectedTotal = selectedSeats.reduce((total, seatId) => {
    const seat = seats.find(s => s.id === seatId);
    return total + (seat ? parseFloat(seat.price) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-muted border border-border" />
            <span className="text-sm text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary" />
            <span className="text-sm text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-destructive/20 border border-destructive/30" />
            <span className="text-sm text-muted-foreground">Occupied</span>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected
          </Badge>
        )}
      </div>

      <Card className="p-6 overflow-x-auto">
        <div className="flex flex-col items-center min-w-fit">
          <div className="bg-muted rounded-t-3xl px-8 py-2 mb-6">
            <span className="text-sm font-medium text-muted-foreground">Front of Aircraft</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {columns.map((col, i) => (
              <div key={col} className="flex items-center gap-2">
                <div className="w-10 h-6 flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {col}
                </div>
                {(seatClass === "economy" && i === 2) && <div className="w-8" />}
                {(seatClass !== "economy" && i === 1) && <div className="w-8" />}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-2">
                {columns.map((col, i) => {
                  const seat = getSeat(row, col);
                  const status = getSeatStatus(seat);

                  return (
                    <div key={`${row}-${col}`} className="flex items-center gap-2">
                      <button
                        onClick={() => handleSeatClick(seat)}
                        disabled={status === "occupied" || status === "none"}
                        className={cn(
                          "w-10 h-10 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center",
                          status === "available" && "bg-muted border border-border hover:bg-accent hover:border-primary cursor-pointer",
                          status === "selected" && "bg-primary text-primary-foreground shadow-md scale-105",
                          status === "occupied" && "bg-destructive/20 border border-destructive/30 cursor-not-allowed",
                          status === "none" && "invisible"
                        )}
                        data-testid={seat ? `button-seat-${seat.seatNumber}` : undefined}
                        aria-label={seat ? `Seat ${seat.seatNumber}${status === "occupied" ? " (occupied)" : ""}` : undefined}
                      >
                        {seat?.seatNumber}
                      </button>
                      {(seatClass === "economy" && i === 2) && (
                        <div className="w-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                          {row}
                        </div>
                      )}
                      {(seatClass !== "economy" && i === 1) && (
                        <div className="w-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                          {row}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="bg-muted rounded-b-3xl px-8 py-2 mt-6">
            <span className="text-sm font-medium text-muted-foreground">Rear of Aircraft</span>
          </div>
        </div>
      </Card>

      {selectedSeats.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-medium">Selected Seats</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {selectedSeats.map((seatId) => {
                  const seat = seats.find(s => s.id === seatId);
                  return seat ? (
                    <Badge key={seatId} variant="secondary">
                      {seat.seatNumber} - ${parseFloat(seat.price).toFixed(2)}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Seat charges</p>
              <p className="text-xl font-bold text-primary" data-testid="text-seat-total">
                ${selectedTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
