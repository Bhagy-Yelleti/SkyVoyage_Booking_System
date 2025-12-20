import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export const generateTicketPDF = (booking: any) => {
  const doc = new jsPDF();
  const flight = booking.flight;

  if (!flight) {
    console.error("Flight details missing from booking object");
    return;
  }

  // Header Logo/Text
  doc.setFontSize(22);
  doc.setTextColor(40, 78, 152); 
  doc.text("SKY VOYAGE E-TICKET", 105, 20, { align: "center" });

  // PNR & Status Row
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`PNR: ${booking.pnr}`, 20, 35);
  doc.text(`Booking ID: #${booking.id}`, 20, 42);
  doc.text(`Status: ${booking.status.toUpperCase()}`, 150, 35);
  doc.text(`Date: ${format(new Date(), "dd MMM yyyy")}`, 150, 42);

  // Flight Info Table
  autoTable(doc, {
    startY: 50,
    head: [["Flight", "From", "To", "Departure", "Arrival"]],
    body: [[
      `${flight.airline?.name || 'Airline'} (${flight.flightNumber})`,
      `${flight.originAirport?.code} - ${flight.originAirport?.city}`,
      `${flight.destinationAirport?.code} - ${flight.destinationAirport?.city}`,
      format(new Date(flight.departureTime), "MMM dd, hh:mm a"),
      format(new Date(flight.arrivalTime), "MMM dd, hh:mm a"),
    ]],
    theme: "striped",
    headStyles: { fillColor: [40, 78, 152] },
  });

  // Passenger Info Table
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Passenger Name", "Title", "Seat Number", "Passport"]],
    body: booking.passengers?.map((p: any) => [
      `${p.firstName} ${p.lastName}`,
      p.title,
      p.seatId ? `Seat ${p.seatId}` : "Assigned at Check-in",
      p.passportNumber || "N/A"
    ]) || [["No passenger data", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [70, 70, 70] },
  });

  // Financial Summary
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount Paid: INR ${booking.totalAmount}`, 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("* Includes taxes and dynamic surge pricing where applicable.", 20, finalY + 7);

  // Footer
  doc.setTextColor(150);
  doc.text("Thank you for choosing Sky Voyage. Please carry a valid ID at the airport.", 105, 285, { align: "center" });

  // Save the PDF
  doc.save(`SkyVoyage_Ticket_${booking.pnr}.pdf`);
};