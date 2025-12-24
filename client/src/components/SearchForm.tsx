import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { Calendar as CalendarIcon, MapPin, PlaneTakeoff, PlaneLanding } from "lucide-react";
import type { Airport } from "@shared/schema"; 

export function SearchForm({ defaultValues }: any) {
  const [, setLocation] = useLocation();

  // Fetch the list of airports from the DB
  const { data: airports, isLoading } = useQuery<Airport[]>({
    queryKey: ["/api/airports"],
  });

  const form = useForm({
    defaultValues: defaultValues || {
      origin: "",
      destination: "",
      date: new Date()
    }
  });

  const onSubmit = (data: any) => {
    if (!data.origin || !data.destination) return;
    const searchParams = new URLSearchParams({
      origin: data.origin,
      destination: data.destination,
      date: data.date.toISOString()
    });
    setLocation(`/search?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-slate-900/40 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Origin Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <PlaneTakeoff size={14} /> From
          </label>
          <Select onValueChange={(val) => form.setValue("origin", val)}>
            <SelectTrigger className="bg-black/50 border-slate-700 h-12 text-white focus:ring-blue-500">
              <SelectValue placeholder={isLoading ? "Loading..." : "Select Departure"} />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              {airports?.map((ap) => (
                <SelectItem key={ap.id} value={ap.id.toString()}>
                  {ap.city} ({ap.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destination Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <PlaneLanding size={14} /> To
          </label>
          <Select onValueChange={(val) => form.setValue("destination", val)}>
            <SelectTrigger className="bg-black/50 border-slate-700 h-12 text-white focus:ring-blue-500">
              <SelectValue placeholder={isLoading ? "Loading..." : "Select Destination"} />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              {airports?.map((ap) => (
                <SelectItem key={ap.id} value={ap.id.toString()}>
                  {ap.city} ({ap.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <CalendarIcon size={14} /> Departure Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-12 justify-start text-left font-normal bg-black/50 border-slate-700 hover:bg-slate-800">
                {form.watch("date") ? format(form.watch("date"), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
              <Calendar
                mode="single"
                selected={form.watch("date")}
                onSelect={(date) => form.setValue("date", date || new Date())}
                initialFocus
                className="text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 text-lg transition-all transform hover:scale-[1.01] shadow-lg shadow-blue-900/20">
        SEARCH FLIGHTS
      </Button>
    </form>
  );
}