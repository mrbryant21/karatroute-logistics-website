function downloadAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Add logo (if available)
  // doc.addImage(logoData, 'PNG', 10, 10, 50, 15);
  
  // Add title
  doc.setFontSize(18);
  doc.text('KaratRoute Logistics - Tracking Details', 15, 30);
  
  // Add tracking info
  doc.setFontSize(12);
  doc.text(`Tracking ID: ${trackingId}`, 15, 45);
  doc.text(`Status: ${status}`, 15, 55);
  doc.text(`Current Location: ${location}`, 15, 65);
  doc.text(`Estimated Delivery: ${estimatedDelivery}`, 15, 75);
  doc.text(`Receiver: ${receiverName}`, 15, 85);
  
  // Add footer
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 120);
  doc.text('KaratRoute Logistics - www.karatroute-logistics.com', 15, 130);
  
  // Save the PDF
  doc.save(`KaratRoute_Tracking_${trackingId}.pdf`);
}