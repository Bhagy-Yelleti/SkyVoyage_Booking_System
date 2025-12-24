import { useState } from "react"
import { useLocation } from "wouter"
import { Button } from "@/components/ui/button"

export default function PassengerDetails() {
  const [, setLocation] = useLocation()
  const params = new URLSearchParams(window.location.search)

  const flightId = params.get("flightId")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [seat, setSeat] = useState("12A")

  const handleContinue = () => {
    if (!name || !email) return alert("Fill passenger details")

    setLocation(
      `/confirm?flightId=${flightId}&name=${name}&email=${email}&seat=${seat}`
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Passenger Details</h1>

      <input
        className="block mb-4 p-2 bg-slate-800 w-full"
        placeholder="Passenger Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="block mb-4 p-2 bg-slate-800 w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <select
        className="block mb-6 p-2 bg-slate-800 w-full"
        value={seat}
        onChange={(e) => setSeat(e.target.value)}
      >
        <option>12A</option>
        <option>12B</option>
        <option>14A</option>
        <option>14B</option>
      </select>

      <Button onClick={handleContinue}>
        Continue to Booking
      </Button>
    </div>
  )
}
