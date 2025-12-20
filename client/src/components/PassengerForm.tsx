import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, CheckCircle2, UserCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// 1. Schema for Validation
const passengerSchema = z.object({
  title: z.enum(["Mr", "Mrs", "Ms", "Miss", "Dr"]),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  passportNumber: z.string().optional(),
});

export type PassengerFormData = z.infer<typeof passengerSchema>;

interface PassengerFormProps {
  index: number;
  seatNumber?: string;
  onSubmit: (data: PassengerFormData) => void;
  defaultValues?: Partial<PassengerFormData>;
}

export function PassengerForm({ index, seatNumber, onSubmit, defaultValues }: PassengerFormProps) {
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<PassengerFormData>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: defaultValues?.title || "Mr",
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      dateOfBirth: defaultValues?.dateOfBirth,
      passportNumber: defaultValues?.passportNumber || "",
    },
  });

  // Handle local submit and notify parent (Booking.tsx)
  const handleLocalSubmit = (data: PassengerFormData) => {
    onSubmit(data);
    setIsSaved(true);
  };

  return (
    <Card className={cn(
      "overflow-visible transition-all duration-300 border-2", 
      isSaved ? "border-green-500 bg-green-50/20" : "border-transparent"
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCircle className={cn("h-5 w-5", isSaved ? "text-green-500" : "text-primary")} />
            <span>Passenger {index + 1}</span>
            {isSaved && <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in" />}
          </div>
          {seatNumber && (
            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
              Seat: {seatNumber}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLocalSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Title Selection */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth Picker */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PP") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passport Number */}
            <FormField
              control={form.control}
              name="passportNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passport Number (Required for International)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Z1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button inside the Card */}
            <Button 
              type="submit" 
              variant={isSaved ? "outline" : "default"} 
              className={cn("w-full transition-all", isSaved ? "border-green-500 text-green-600 hover:bg-green-50" : "")}
            >
              {isSaved ? "Details Saved Successfully" : "Confirm Passenger Details"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}