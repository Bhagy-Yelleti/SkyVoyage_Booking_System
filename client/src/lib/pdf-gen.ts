import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateTicketPDF = (booking: any) => {
  const doc = new jsPDF();
  
  // Header Design
  doc.setFillColor(15, 23, 42); // Dark Slate
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("SKYVOYAGE BOARDING PASS", 105, 25, { align: "center" });

  // Reset text for body
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`PNR: ${booking.pnr || "GUEST"}`, 14, 50);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, 14, 55);

  autoTable(doc, {
    startY: 65,
    head: [['Passenger Info', 'Flight Details']],
    body: [
      ['Name', booking.passengerName],
      ['Airline', booking.flight?.airline?.name || "N/A"],
      ['Flight No', booking.flight?.flightNumber || "N/A"],
      ['From', `${booking.flight?.originAirport?.city || "N/A"} (${booking.flight?.originAirport?.code || ""})`],
      ['To', `${booking.flight?.destinationAirport?.city || "N/A"} (${booking.flight?.destinationAirport?.code || ""})`],
      ['Seat', booking.seatNumber],
      ['Status', 'CONFIRMED'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] }
  });

  doc.save(`Ticket_SkyVoyage_${booking.pnr || booking.id}.pdf`);
};