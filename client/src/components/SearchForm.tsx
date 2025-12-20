import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useLocation } from "wouter";
import type { Airport } from "@shared/schema";

export function SearchForm({ defaultValues }: any) {
  const [, setLocation] = useLocation();
  
  // FETCH AIRPORTS FROM DB
  const { data: airports } = useQuery<Airport[]>({ 
    queryKey: ["/api/airports"] 
  });

  const form = useForm({
    defaultValues: defaultValues || {
      origin: "",
      destination: "",
      date: new Date(),
    }
  });

  const onSubmit = (data: any) => {
    const params = new URLSearchParams({
      origin: data.origin,
      destination: data.destination,
      date: format(data.date, "yyyy-MM-dd"),
    });
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap gap-4 items-end justify-center bg-card p-6 rounded-xl border">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-muted-foreground">From</label>
        <Select onValueChange={(v) => form.setValue("origin", v)} value={form.watch("origin")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={airports ? "Select Origin" : "Loading..."} />
          </SelectTrigger>
          <SelectContent>
            {airports?.map((a) => (
              <SelectItem key={a.id} value={a.code}>{a.city} ({a.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-muted-foreground">To</label>
        <Select onValueChange={(v) => form.setValue("destination", v)} value={form.watch("destination")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={airports ? "Select Destination" : "Loading..."} />
          </SelectTrigger>
          <SelectContent>
            {airports?.map((a) => (
              <SelectItem key={a.id} value={a.code}>{a.city} ({a.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-muted-foreground">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] text-left">
              {form.watch("date") ? format(form.watch("date"), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Calendar mode="single" selected={form.watch("date")} onSelect={(d) => form.setValue("date", d!)} />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="bg-primary px-8 h-10">Search Flights</Button>
    </form>
  );
}