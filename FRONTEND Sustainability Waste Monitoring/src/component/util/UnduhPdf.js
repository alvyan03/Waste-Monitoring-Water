import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const unduhPdf = (data, fileName = "Laporan_Proposal.pdf") => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Laporan Proposal", 10, 10);

  const headers = [
    [
      "No",
      "No. Proposal",
      "Judul Proposal",
      "Skema Pengabdian",
      "Ketua Pengusul",
      "Total Dana",
      "Tanggal Kirim",
      "Status",
    ],
  ];

  const body = data.map((item) => [
    item.No,
    item["No. Proposal"],
    item["Judul Proposal"],
    item["Skema Pengabdian"],
    item["Ketua Pengusul"],
    item["Total Dana"],
    item["Tanggal Kirim"],
    item.Status,
  ]);

  doc.autoTable({
    head: headers,
    body: body,
    startY: 20,
  });

  doc.save(fileName);
};
