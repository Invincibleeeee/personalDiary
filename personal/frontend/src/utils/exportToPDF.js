import jsPDF from "jspdf";

export const exportEntriesToPDF = (entries = []) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("My Journal Entries", 14, 20);

  let y = 30;

  entries.forEach((entry, index) => {
    doc.setFontSize(14);
    doc.text(`${index + 1}. ${entry.heading}`, 14, y);
    y += 8;

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(entry.content || "", 180);
    doc.text(lines, 14, y);
    y += lines.length * 7 + 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("my-journal.pdf");
};
