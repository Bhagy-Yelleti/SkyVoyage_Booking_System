import { useMutation } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import { generateTicketPDF } from "@/lib/pdf-gen"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ConfirmBooking() {
  const { toast } = useToast()
  const params = new URLSearchParams(window.location.search)

  const flightId = params.get("flightId")
  const passengerName = params.get("name")
  const passengerEmail = params.get("email")
  const seatNumber = params.get("seat")

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/bookings", {
        flightId,
        passengerName,
        passengerEmail,
        seatNumber,
      })
      return res.json()
    },
    onSuccess: (data) => {
      toast({ title: "Booking Confirmed" })
      generateTicketPDF(data)
    },
  })

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl mb-6">Confirm Booking</h1>

      <p>Name: {passengerName}</p>
      <p>Email: {passengerEmail}</p>
      <p>Seat: {seatNumber}</p>

      <Button
        className="mt-6"
        onClick={() => bookingMutation.mutate()}
      >
        Confirm & Download Ticket
      </Button>
    </div>
  )
}
