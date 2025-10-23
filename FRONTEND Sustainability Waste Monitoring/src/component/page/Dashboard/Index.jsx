import "../../../index.css";
import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import UseFetch from "../../util/UseFetch";
import { API_LINK } from "../../util/Constants";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

export default function DashboardIndex() {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isErrorProduk, setIsErrorProduk] = useState(false);
  const [isErrorPendapatan, setIsErrorPendapatan] = useState(false);
  const [isLoadingProduk, setIsLoadingProduk] = useState(true);
  const [isLoadingPendapatan, setIsLoadingPendapatan] = useState(true);
  const [listJenisSampah, setListJenisSampah] = useState([]);
  const [totalSampahDibuang, setTotalSampahDibuang] = useState("0%");
  const [totalSampahDijual, setTotalSampahDijual] = useState("0%");
  const [totalSampahDidaurUlang, setTotalSampahDidaurUlang] = useState("0%");
  const [totalProdukDaurUlangTerjual, setTotalProdukDaurUlangTerjual] =
    useState("0%");
  const [chartData, setChartData] = useState(null);
  const [chartDataProduk, setChartDataProduk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedYearProduk, setSelectedYearProduk] = useState(
    new Date().getFullYear().toString()
  );

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") {
        throw new Error(errorMessage);
      } else {
        setter(data);
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setter({});
    }
  };

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Dashboard/pieJenisSampah",
      {},
      setListJenisSampah,
      "Terjadi kesalahan: Gagal mengambil jenis sampah."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Dashboard/totalSampahDibuang",
      {},
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const { persen_dibuang, total_sampah_masuk } = data[0];
          setTotalSampahDibuang(
            `${persen_dibuang.toFixed(
              2
            )}% dari ${total_sampah_masuk.toLocaleString()} total volume`
          );
        } else {
          setTotalSampahDibuang("0% dari 0 total volume");
        }
      },
      "Terjadi kesalahan: Gagal mengambil total sampah."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Dashboard/totalSampahDijual",
      {},
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const { persen_dijual, total_sampah_masuk } = data[0];
          setTotalSampahDijual(
            `${persen_dijual.toFixed(
              2
            )}% dari ${total_sampah_masuk.toLocaleString()} total volume`
          );
        } else {
          setTotalSampahDijual("0% dari 0 total volume");
        }
      },
      "Terjadi kesalahan: Gagal mengambil total sampah dijual."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Dashboard/totalSampahDidaurUlang",
      {},
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const { persen_didaur_ulang, total_sampah_masuk } = data[0];
          setTotalSampahDidaurUlang(
            `${persen_didaur_ulang.toFixed(
              2
            )}% dari ${total_sampah_masuk.toLocaleString()} total volume`
          );
        } else {
          setTotalSampahDidaurUlang("0% dari 0 total volume");
        }
      },
      "Terjadi kesalahan: Gagal mengambil total sampah didaur ulang."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Dashboard/totalProdukDaurUlangTerjual",
      {},
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const { persen_produk_terjual, total_produk } = data[0];
          setTotalProdukDaurUlangTerjual(
            `${persen_produk_terjual.toFixed(
              2
            )}% dari ${total_produk.toLocaleString()} total produk`
          );
        } else {
          setTotalProdukDaurUlangTerjual("0% dari 0 total produk");
        }
      },
      "Terjadi kesalahan: Gagal mengambil data produk hasil daur ulang yang berhasil dijual."
    );
  }, []);

  const statData = [
    {
      title: "Jumlah sampah dibuang",
      percentage: `${totalSampahDibuang}`,
      color: "#3B82F6",
    },
    {
      title: "Jumlah sampah dijual",
      percentage: `${totalSampahDijual}`,
      color: "#FACC15",
    },
    {
      title: "Jumlah sampah yang didaur ulang",
      percentage: `${totalSampahDidaurUlang}`,
      color: "#F59E0B",
    },
    {
      title: "Produk hasil daur ulang yang berhasil dijual",
      percentage: `${totalProdukDaurUlangTerjual}`,
      color: "#10B981",
    },
  ];

  const warnaPie = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#64748B",
  ];

  const pieData = {
    labels: listJenisSampah.map((item) => item.jenis),
    datasets: [
      {
        label: "Jumlah Sampah",
        data: listJenisSampah.map((item) => item.jumlah),
        backgroundColor: listJenisSampah.map(
          (_, i) => warnaPie[i % warnaPie.length]
        ),
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 20,
          padding: 20,
        },
      },
      datalabels: {
        color: "#fff",
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (acc, val) => acc + val,
            0
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return `${
            context.chart.data.labels[context.dataIndex]
          }: ${percentage}%`;
        },
        font: {
          weight: "bold",
          size: 12,
        },
      },
    },
    layout: {
      padding: {
        top: 10,
      },
    },
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      setIsErrorPendapatan(false);
      setIsLoadingPendapatan(true);

      try {
        const response = await UseFetch(
          API_LINK + "Dashboard/GetPendapatanPengeluaranData",
          { Tahun: selectedYear }
        );

        console.log("isi GetPendapatanPengeluaranData", response);

        if (!Array.isArray(response) || response === "ERROR") {
          throw new Error("Data tidak valid atau gagal diambil");
        }

        const pendapatanData = [];
        const pengeluaranData = [];
        const bulanLabels = [];

        for (let i = 1; i <= 12; i++) {
          const dataPendapatan = response.find(
            (item) => item.Bulan === i && item.Tipe === "Pendapatan"
          );
          const dataPengeluaran = response.find(
            (item) => item.Bulan === i && item.Tipe === "Pengeluaran"
          );

          bulanLabels.push(i);

          pendapatanData.push(
            dataPendapatan ? dataPendapatan.TotalPendapatan : 0
          );
          pengeluaranData.push(
            dataPengeluaran ? dataPengeluaran.TotalPendapatan : 0
          );
        }

        setChartData({
          labels: bulanLabels.map((month) => {
            const monthNames = [
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ];
            return monthNames[month - 1];
          }),
          datasets: [
            {
              label: "Pendapatan",
              data: pendapatanData,
              backgroundColor: "rgba(182, 153, 203, 0.7)",
              borderColor: "rgba(182, 153, 203, 1)",
              borderWidth: 1,
            },
            {
              label: "Pengeluaran",
              data: pengeluaranData,
              backgroundColor: "rgba(9, 157, 232, 0.7)",
              borderColor: "rgba(9, 157, 232, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Gagal mengambil data pendapatan/pengeluaran:", error);
        setIsErrorPendapatan(true);
      } finally {
        setIsLoadingPendapatan(false);
      }
    };

    fetchDataFromAPI();
  }, [selectedYear]);

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Bulan",
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Jumlah Uang (IDR)",
        },
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Rp ${context.raw.toLocaleString()}`;
          },
        },
      },
    },
  };

  useEffect(() => {
    const fetchDataByEndpointAndParams = async () => {
      setIsErrorProduk(false);
      setIsLoadingProduk(true);

      try {
        const response = await UseFetch(
          API_LINK + "Dashboard/getJumlahProdukDanPenjualanProdukDaurUlang",
          { Tahun: selectedYearProduk }
        );

        if (!Array.isArray(response) || response === "ERROR") {
          throw new Error("Data tidak valid.");
        }

        const produkData = [];
        const produkDaurUlangData = [];
        const bulanLabels = [];

        for (let i = 1; i <= 12; i++) {
          const dataProduk = response.find(
            (item) => item.Bulan === i && item.Tipe === "Produk"
          );
          const dataProdukDaurUlang = response.find(
            (item) => item.Bulan === i && item.Tipe === "Produk Daur Ulang"
          );

          bulanLabels.push(i);

          produkData.push(dataProduk ? dataProduk.Total : 0);
          produkDaurUlangData.push(
            dataProdukDaurUlang ? dataProdukDaurUlang.Total : 0
          );
        }

        setChartDataProduk({
          labels: bulanLabels.map((month) => {
            const monthNames = [
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ];
            return monthNames[month - 1];
          }),
          datasets: [
            {
              label: "Produk Daur Ulang",
              data: produkData,
              backgroundColor: "rgba(182, 153, 203, 0.7)",
              borderColor: "rgba(182, 153, 203, 1)",
              borderWidth: 1,
            },
            {
              label: "Produk Daur Ulang Terjual",
              data: produkDaurUlangData,
              backgroundColor: "rgba(9, 157, 232, 0.7)",
              borderColor: "rgba(9, 157, 232, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
        setIsErrorProduk(true);
      } finally {
        setIsLoadingProduk(false);
      }
    };

    fetchDataByEndpointAndParams();
  }, [selectedYearProduk]);

  const optionsProduk = {
    responsive: true,
    animation: {
      duration: 1000, // durasi animasi dalam ms
      easing: "easeOutQuart", // gaya animasi
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Bulan",
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: "Jumlah Produk",
        },
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => context.raw.toLocaleString(),
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      <div className="stat-box-container">
        {statData.map((stat, index) => (
          <div key={index} className="stat-box">
            <div className="stat-title" style={{ backgroundColor: stat.color }}>
              {stat.title}
            </div>
            <div className="stat-value">{stat.percentage}</div>
          </div>
        ))}
      </div>

      <div className="pie-container">
        <h2 className="section-title">
          Jumlah Jenis Sampah di Politeknik Astra
        </h2>
        <p className="section-subtitle">
          Grafik Jumlah Jenis Sampah berdasarkan sampah <br />
        </p>
        <div className="pie-chart-wrapper">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>

      <div className="bar-container">
        <h2 className="section-title">
          Hasil dan Performa Produk dan Penjualan Produk Daur Ulang
        </h2>
        <p className="section-subtitle">
          Jumlah Produk dan Penjualan Produk Daur Ulang <br />
        </p>
        <div className="d-flex align-items-center mb-4">
          <h5>Filter Tahun</h5>
          <select
            className="form-select me-3"
            value={selectedYearProduk}
            onChange={(e) => setSelectedYearProduk(e.target.value)}
            style={{ width: "150px" }}
          >
            {getYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {isErrorProduk && (
          <div className="alert alert-danger">Gagal mengambil data produk</div>
        )}

        <div style={{ position: "relative", minHeight: "400px" }}>
          {chartDataProduk && (
            <Bar data={chartDataProduk} options={optionsProduk} />
          )}
        </div>
      </div>

      <div className="bar-container">
        <h2 className="section-title">
          Perbandingan Pendapatan Pembuangan & Penjualan Sampah
        </h2>
        <p className="section-subtitle">
          Grafik Pendapatan Pembuangan dan Penjualan Sampah <br />
        </p>
        <div className="d-flex align-items-center mb-4">
          <h5>Filter Tahun</h5>
          <select
            className="form-select me-3"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ width: "150px" }}
          >
            {getYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {isErrorPendapatan && (
          <div className="alert alert-danger">
            Gagal mengambil data pendapatan/pengeluaran
          </div>
        )}

        <div style={{ position: "relative", minHeight: "400px" }}>
          {chartData && <Bar data={chartData} options={options} />}
        </div>
      </div>
    </div>
  );
}
