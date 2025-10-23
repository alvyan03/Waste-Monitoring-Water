import "../../../index.css";
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardAirIndex() {
  const [chartType, setChartType] = useState("Monthly");

  // Data grafik dummy
  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Ags",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
    datasets: [
      {
        label: "Water Consumption (m³)",
        data: [10, 15, 9, 14, 18, 11, 20, 17, 14, 22, 19, 16],
        backgroundColor: "#3B82F6",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#E5E7EB" },
        ticks: { color: "#1E3A8A", font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#1E3A8A", font: { size: 10 } },
      },
    },
  };

  // Data komponen dummy
  const topComponents = [
    {
      id: "COM002",
      lokasi: "Dormitory",
      volume: 25,
      tanggal: "19 Desember 2024",
    },
    {
      id: "COM004",
      lokasi: "Workshop",
      volume: 22,
      tanggal: "20 Desember 2024",
    },
    { id: "COM009", lokasi: "Office", volume: 19, tanggal: "21 Desember 2024" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-blue-700 text-white text-lg font-semibold p-4 rounded-t-xl shadow-md text-center">
        Progress Pencapaian Water Withdrawal
      </div>

      {/* TABEL UTAMA */}
      <div className="bg-white shadow-md rounded-b-xl overflow-x-auto border border-gray-200 mb-8">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead className="bg-blue-50">
            <tr>
              <th className="border p-2 w-36"></th>
              <th className="border p-2 font-bold text-blue-700">
                YTD. Oct 2025
              </th>
              {[
                "JAN",
                "FEB",
                "MAR",
                "APR",
                "MEI",
                "JUN",
                "JUL",
                "AGS",
                "SEP",
                "OCT",
                "NOV",
                "DES",
              ].map((m) => (
                <th key={m} className="border p-2 font-bold text-blue-700">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-green-50">
              <td className="border p-2 text-left font-semibold">
                Water Consumption
              </td>
              <td className="border p-2">AKTUAL</td>
              {Array(12)
                .fill("0.00m³")
                .map((v, i) => (
                  <td
                    key={i}
                    className="border p-2 text-green-700 font-semibold"
                  >
                    {v}
                  </td>
                ))}
            </tr>
            <tr className="bg-green-100">
              <td className="border p-2 text-left font-semibold">
                Water Consumption/Individu
              </td>
              <td className="border p-2">AKTUAL</td>
              {Array(12)
                .fill("0.00m³")
                .map((v, i) => (
                  <td
                    key={i}
                    className="border p-2 text-green-700 font-semibold"
                  >
                    {v}
                  </td>
                ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="border p-2 text-left font-semibold">TARGET</td>
              <td className="border p-2 font-bold text-blue-700">12.00m³</td>
              {Array(12)
                .fill("1.00m³")
                .map((v, i) => (
                  <td key={i} className="border p-2 text-blue-700">
                    {v}
                  </td>
                ))}
            </tr>
            <tr className="bg-green-50">
              <td className="border p-2 text-left font-semibold">
                Water Withdrawal Intensity Reduction (%)
              </td>
              <td className="border p-2">AKTUAL</td>
              {Array(12)
                .fill("0.00%")
                .map((v, i) => (
                  <td
                    key={i}
                    className="border p-2 text-green-700 font-semibold"
                  >
                    {v}
                  </td>
                ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="border p-2 text-left font-semibold">TARGET</td>
              <td className="border p-2 font-bold text-blue-700">-6%</td>
              {Array(12)
                .fill("-6%")
                .map((v, i) => (
                  <td key={i} className="border p-2 text-blue-700">
                    {v}
                  </td>
                ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* BAGIAN BAWAH: Grafik & Tabel Komponen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GRAFIK */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="bg-blue-700 text-white p-3 font-semibold rounded-t-xl text-center">
            Grafik Penggunaan Air ({chartType})
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Tampilan:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="border border-gray-300 rounded-md p-1 text-sm"
              >
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="h-56">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* TABEL KOMPONEN */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="bg-blue-700 text-white p-3 font-semibold rounded-t-xl text-center">
            Komponen Dengan Penggunaan Air Terbanyak
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm text-center border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2 w-8">No</th>
                  <th className="border p-2">No Komponen</th>
                  <th className="border p-2">Lokasi</th>
                  <th className="border p-2">Total Volume Air (m³)</th>
                  <th className="border p-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {topComponents.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-blue-50"
                    } hover:bg-blue-100 transition`}
                  >
                    <td className="border p-2 font-semibold">{i + 1}</td>
                    <td className="border p-2">{c.id}</td>
                    <td className="border p-2">{c.lokasi}</td>
                    <td className="border p-2 text-blue-700 font-semibold">
                      {c.volume}
                    </td>
                    <td className="border p-2">{c.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
