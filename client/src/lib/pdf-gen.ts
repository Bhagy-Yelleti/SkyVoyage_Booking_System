import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateTicketPDF = (booking: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(30, 58, 138); // Blue
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("SKYVOYAGE E-TICKET", 105, 25, { align: "center" });

  // Booking Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Booking ID: #BK-${booking.id}`, 14, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 58);

  autoTable(doc, {
    startY: 70,
    head: [['Flight Details', 'Information']],
    body: [
      ['Passenger Name', booking.passengerName],
      ['Airline', booking.flight.airline.name],
      ['Flight Number', booking.flight.flightNumber],
      ['Route', `${booking.flight.originAirport.city} (${booking.flight.originAirport.code}) to ${booking.flight.destinationAirport.city} (${booking.flight.destinationAirport.code})`],
      ['Seat Number', booking.seatNumber],
      ['Status', booking.status.toUpperCase()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] }
  });

  doc.save(`SkyVoyage_Ticket_${booking.id}.pdf`);
};