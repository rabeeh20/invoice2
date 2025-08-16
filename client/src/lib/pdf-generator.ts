import jsPDF from "jspdf";
import type { InvoiceWithLineItems } from "@shared/schema";

export async function generatePDF(invoice: InvoiceWithLineItems): Promise<void> {
  const pdf = new jsPDF();
  
  // Set font
  pdf.setFont("helvetica");
  
  // Company header
  pdf.setFontSize(20);
  pdf.setTextColor(59, 130, 246); // Primary blue
  pdf.text("Elegant Catering Co.", 20, 30);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Professional Catering Services", 20, 40);
  
  // Company details
  pdf.setFontSize(10);
  pdf.text("123 Culinary Drive", 20, 55);
  pdf.text("Foodtown, CA 90210", 20, 62);
  pdf.text("(555) 123-4567", 20, 69);
  pdf.text("info@elegantcatering.com", 20, 76);
  
  // Invoice details
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text("INVOICE", 150, 30);
  
  pdf.setFontSize(10);
  pdf.text(`Invoice #: ${invoice.number}`, 150, 45);
  pdf.text(`Date: ${new Date(invoice.createdAt!).toLocaleDateString()}`, 150, 52);
  if (invoice.eventDate) {
    pdf.text(`Event Date: ${invoice.eventDate}`, 150, 59);
  }
  if (invoice.eventType) {
    pdf.text(`Event Type: ${invoice.eventType}`, 150, 66);
  }
  
  // Customer details
  pdf.setFontSize(12);
  pdf.text("Bill To:", 20, 95);
  
  pdf.setFontSize(10);
  pdf.text(invoice.customerName, 20, 105);
  
  const addressLines = invoice.customerAddress.split('\n');
  let yPos = 112;
  addressLines.forEach(line => {
    pdf.text(line, 20, yPos);
    yPos += 7;
  });
  
  if (invoice.customerEmail) {
    pdf.text(invoice.customerEmail, 20, yPos);
  }
  
  // Line items table
  const tableStartY = 140;
  let currentY = tableStartY;
  
  // Table headers
  pdf.setFillColor(249, 250, 251); // Gray background
  pdf.rect(20, currentY, 170, 10, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Description", 22, currentY + 7);
  pdf.text("Qty", 120, currentY + 7);
  pdf.text("Rate", 140, currentY + 7);
  pdf.text("Amount", 165, currentY + 7);
  
  currentY += 15;
  
  // Table rows
  invoice.lineItems.forEach((item) => {
    pdf.text(item.description, 22, currentY);
    pdf.text(item.quantity.toString(), 120, currentY);
    pdf.text(`$${parseFloat(item.rate).toFixed(2)}`, 140, currentY);
    pdf.text(`$${parseFloat(item.amount).toFixed(2)}`, 165, currentY);
    currentY += 10;
  });
  
  // Totals
  currentY += 10;
  const totalsX = 130;
  
  pdf.text("Subtotal:", totalsX, currentY);
  pdf.text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, 170, currentY);
  currentY += 8;
  
  pdf.text(`Tax (${(parseFloat(invoice.taxRate) * 100).toFixed(2)}%):`, totalsX, currentY);
  pdf.text(`$${parseFloat(invoice.taxAmount).toFixed(2)}`, 170, currentY);
  currentY += 8;
  
  // Draw line above total
  pdf.line(totalsX, currentY, 190, currentY);
  currentY += 5;
  
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Total:", totalsX, currentY);
  pdf.text(`$${parseFloat(invoice.total).toFixed(2)}`, 170, currentY);
  
  // Notes
  if (invoice.notes) {
    currentY += 20;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Notes:", 20, currentY);
    
    currentY += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    const notesLines = pdf.splitTextToSize(invoice.notes, 170);
    pdf.text(notesLines, 20, currentY);
  }
  
  // Save the PDF
  pdf.save(`Invoice-${invoice.number}.pdf`);
}
