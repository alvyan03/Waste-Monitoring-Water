import * as XLSX from "xlsx";

export const unduhExcel = (data, fileName = "Laporan_Proposal.xlsx") => {
  const headers = [
    "No",
    "No. Proposal",
    "Judul Proposal",
    "Skema Pengabdian",
    "Ketua Pengusul",
    "Total Dana",
    "Tanggal Kirim",
    "Status",
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

  const worksheetData = [headers, ...body];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Proposal");
  XLSX.writeFile(workbook, fileName);
};
