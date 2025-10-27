import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import UseFetch from "../../util/UseFetch";
import { API_LINK } from "../../util/Constants";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardAirIndex() {
  const [chartData, setChartData] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [filterVolume, setFilterVolume] = useState("volume");
  const [monthlyConsumptionData, setMonthlyConsumptionData] = useState([]);
  const [weeklyConsumptionData, setWeeklyConsumptionData] = useState(
    new Array(7).fill(0)
  );
  const [waterUsageData, setWaterUsageData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [targetData, setTargetData] = useState(new Array(12).fill(0));
  const [aktualIndividuData, setAktualIndividuData] = useState([]);
  const [targetReductionValue, setTargetReductionValue] = useState(null); // Initial value is null
  const [topKomponenData, setTopKomponenData] = useState([]);

  const [yearlyConsumptionData, setYearlyConsumptionData] = useState([]);
  const currentMonthIndex = new Date().getMonth();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ags",
    "Sep",
    "Oct",
    "Nov",
    "Des",
  ];
  const [lastMonth, setLastMonth] = useState(monthNames[currentMonthIndex]);
  const [selectedMonthForYTD, setSelectedMonthForYTD] =
    useState(currentMonthIndex);

  const chartDataConfig = {
    yearly: {
      labels: [currentYear],
      datasets: [
        {
          label: "Yearly Water Consumption",
          data: yearlyConsumptionData,
          borderColor: "#4bc0c0",
          tension: 0.4,
        },
      ],
    },
    monthly: {
      labels: monthNames,
      datasets: [
        {
          label: "Monthly Water Consumption",
          data: monthlyConsumptionData,
          borderColor: "#3e95cd",
          tension: 0.4,
        },
      ],
    },
    weekly: {
      labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
      datasets: [
        {
          label: "Weekly Water Consumption",
          data: weeklyConsumptionData,
          borderColor: "#ff6384",
          tension: 0.4,
        },
      ],
    },
    daily: {
      labels: Array.from({ length: 24 }, (_, i) => `${i + 1}`), // Label 1-24 untuk 24 jam
      datasets: [
        {
          label: "Daily Water Consumption",
          data: chartData, // Data yang diisi dari fetchDailyData
          borderColor: "#36a2eb",
          tension: 0.4,
        },
      ],
    },
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Water Consumption" },
    },
    scales: {
      y: {
        beginAtZero: chartDataConfig[filterType].datasets[0].data.every(
          (value) => value >= 0
        ),
        suggestedMin:
          Math.min(...chartDataConfig[filterType].datasets[0].data) - 50, // Buffer 50 di bawah nilai minimum
        suggestedMax:
          Math.max(...chartDataConfig[filterType].datasets[0].data) + 50, // Buffer 50 di atas nilai maksimum
      },
    },
  };

  useEffect(() => {
    const fetchDailyData = async () => {
      setIsError(false);
      try {
        // Ambil data dari API menggunakan stored procedure stn_getDailyWaterConsumption
        const data = await UseFetch(API_LINK + "Dashboard/GetDataChartDaily", {
          year: currentYear,
        });

        if (data === "ERROR") {
          setIsError(true);
        } else {
          // Buat array untuk menampung konsumsi per jam (24 jam, default 0)
          const dailyConsumption = new Array(24).fill(0);

          // Loop data yang diambil dan kelompokkan berdasarkan jam
          data.forEach((item) => {
            const date = new Date(item.Waktu); // Konversi waktu menjadi Date object
            const hour = date.getHours(); // Ambil jam dari waktu
            dailyConsumption[hour] += item.Volume; // Tambahkan volume ke jam yang sesuai
          });

          setChartData(dailyConsumption); // Simpan hasil pemrosesan ke state
        }
      } catch (error) {
        console.error("Error fetching daily data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMonthlyData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "Dashboard/GetDataChartMonthly",
          { year: currentYear }
        );
        if (data === "ERROR") {
          setIsError(true);
        } else {
          const monthlyConsumption = new Array(12).fill(0);
          data.forEach((item) => {
            monthlyConsumption[item.Bulan - 1] = item.TotalKonsumsi;
          });
          setMonthlyConsumptionData(monthlyConsumption);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWeeklyData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "Dashboard/GetDataChartWeekly", {});
        if (data === "ERROR") {
          setIsError(true);
        } else {
          const weeklyConsumption = new Array(7).fill(0);
          data.forEach(item => {
            const dayName = item.NamaHari;  // This will give you the name of the day
            const dayIndex = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].indexOf(dayName);
            if (dayIndex >= 0) {
              weeklyConsumption[dayIndex] = item.TotalKonsumsi; // Assign the TotalKonsumsi value to the appropriate index
            }
          });
          setWeeklyConsumptionData(weeklyConsumption);
        }
      } catch (error) {
        console.error("Error fetching weekly data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    

    const fetchYearlyData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "Dashboard/GetDataChartYearly", {
          year: currentYear,
        });
        if (data === "ERROR") {
          setIsError(true);
        } else {
          const yearlyConsumption =
            data.length > 0 ? [data[0].TotalKonsumsi] : [0];
          setYearlyConsumptionData(yearlyConsumption);
        }
      } catch (error) {
        setIsError(true);
        console.error("Error fetching yearly data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWaterUsageData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "Dashboard/GetDataPenggunaanAir",
          { year: currentYear }
        );
        if (data === "ERROR") {
          setIsError(true);
        } else {
          setWaterUsageData(data);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDataTargetIndividu = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "Dashboard/GetDataTargetIndividu",
          { year: currentYear }
        );
        console.log("Data target individu:", data);
        if (data === "ERROR") {
          setIsError(true);
        } else {
          const monthlyTargets = new Array(12).fill(0);

          data.forEach((item) => {
            monthlyTargets.fill(item.trg_target_bulanan_individu);
          });

          console.log("Monthly targets:", monthlyTargets);
          setTargetData(monthlyTargets);
        }
      } catch (error) {
        console.error("Error fetching target data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTargetReduction = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "Dashboard/GetTargetReduction",
          {}
        );
        if (data === "ERROR") {
          setIsError(true);
        } else {
          // Ambil nilai persentase dari hasil stored procedure
          const percentage = parseFloat(
            data[0]?.trg_persentase_target_penghematan || 0
          );
          setTargetReductionValue(percentage); // Set the value dynamically from SP
        }
      } catch (error) {
        console.error("Error fetching target reduction:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDataAktualIndividu = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "Dashboard/GetDataAktualIndividu",
          { year: currentYear }
        );
        if (data === "ERROR") {
          setIsError(true);
        } else {
          console.log("Data Aktual Individu:", data);
          setAktualIndividuData(data);
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTopKomponen = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "Dashboard/GetTopKomponen", {
          year: currentYear,
        });
        console.log("Fetched Data Volume:", data); // Log the data
        if (data === "ERROR") {
          setIsError(true);
        } else {
          setTopKomponenData(data);
        }
      } catch (error) {
        console.error("Error fetching top komponen data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTopLokasi = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "Dashboard/GetTopLokasi", {
          year: currentYear,
        });
        console.log("Fetched Data Lokasi:", data); // Log the data
        if (data === "ERROR") {
          setIsError(true);
        } else {
          setTopKomponenData(data);
        }
      } catch (error) {
        console.error("Error fetching top komponen data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTopTanggal = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "Dashboard/GetTopTanggal", {
          year: currentYear,
        });
        console.log("Fetched Data Tanggal:", data); // Log the data
        if (data === "ERROR") {
          setIsError(true);
        } else {
          setTopKomponenData(data);
        }
      } catch (error) {
        console.error("Error fetching top komponen data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTopVolume = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "Dashboard/GetTopKomponen", {
          year: currentYear,
        });
        console.log("Fetched Data Volume:", data); // Log the data
        if (data === "ERROR") {
          setIsError(true);
        } else {
          setTopKomponenData(data);
        }
      } catch (error) {
        console.error("Error fetching top komponen data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaterUsageData();
    fetchDataTargetIndividu();
    fetchDataAktualIndividu();
    fetchTargetReduction();
    fetchTopKomponen();
    fetchTopLokasi();
    fetchTopTanggal();
    if (filterType === "daily") {
      fetchDailyData();
    } else if (filterType === "yearly") {
      fetchYearlyData();
    } else if (filterType === "monthly") {
      fetchMonthlyData();
    } else {
      fetchWeeklyData();
    }

    if (filterVolume === "volume") {
      fetchTopVolume();
    } else if (filterVolume === "lokasi") {
      fetchTopLokasi();
    } else if (filterVolume === "tanggal") {
      fetchTopTanggal();
    }
  }, [filterType, filterVolume, currentYear]);

  const ytdHeader = `YTD. ${lastMonth} ${currentYear}`;

  const waterWithdrawalReduction = targetData.map((target, index) => {
    const actual = aktualIndividuData[index]?.TotalKonsumsi || 0;
    if (target === 0 || actual === 0) {
      return 0;
    }
    const reduction = ((actual - target) / target) * 100;
    return reduction.toFixed(2);
  });

  const ytdConsumptionIndividu = aktualIndividuData
    .slice(0, selectedMonthForYTD + 1)
    .reduce((acc, curr) => acc + curr.TotalKonsumsi, 0)
    .toFixed(2);

  const ytdWaterWithdrawalReduction =
    waterWithdrawalReduction
      .slice(0, selectedMonthForYTD + 1) // Ambil data hingga bulan yang dipilih
      .reduce((acc, curr) => acc + parseFloat(curr), 0) /
    (selectedMonthForYTD + 1); // Rata-rata pengurangan hingga bulan yang dipilih

  const ytdWaterWithdrawalReductionFixed = isNaN(ytdWaterWithdrawalReduction)
    ? 0
    : ytdWaterWithdrawalReduction.toFixed(2);

  const totalAktualIndividu =
    aktualIndividuData.length > 0
      ? aktualIndividuData
          .reduce((acc, curr) => acc + curr.TotalKonsumsi, 0)
          .toFixed(2)
      : 0;

  const averagePerIndividu =
    totalAktualIndividu > 0 ? (totalAktualIndividu / 2011).toFixed(2) : 0;

  return (
    <>
      <div className="card">
       
        <div className="card-body lead p-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : isError ? (
            <p>Error fetching data. Please try again later.</p>
          ) : (
            <div className="table-responsive mt-3" style={{ overflowX: 'auto', whiteSpace: 'wrap' }}>
            </div>
          )}
          
          
          {/*  */}

          <div className="table-responsive mt-3" style={{ overflowX: 'auto', whiteSpace: 'wrap' }}>
            <div className="d-flex flex-wrap justify-content-between">
              {/* Chart Section - Card */}
              <div className="chart-container flex-grow-1 p-3" style={{ minWidth: "45%", maxWidth: "50%" }}>
                <div className="card rounded-3" style={{ height: "100%" }}>
                  <div className="card-header bg-primary text-white p-4 rounded-top">
                    <span className="lead fw-medium">Grafik Penggunaan Air ({filterType})</span>
                  </div>
                  <div className="card-body p-4" style={{ height: "100%", overflow: "hidden" }}>
                    {/* Filter Dropdown for Chart */}
                    <div className="mb-4">
                      <label htmlFor="filterType" className="form-label fs-6">
                        Pilih Tampilan Chart:
                      </label>
                      <select
                        id="filterType"
                        className="form-select form-select-lg"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="yearly">Yearly</option>
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily (1-24 hours)</option>
                      </select>
                    </div>

                    {/* Chart */}
                    <div style={{ height: "485px", position: "relative", borderRadius: "10px" }}>
                      <Line
                        data={chartDataConfig[filterType]}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: "top",
                              labels: {
                                font: { size: 16 },
                              },
                            },
                            title: {
                              display: true,
                              text: `Water Consumption (${filterType})`,
                              font: { size: 18 },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: chartDataConfig[filterType].datasets[0].data.every((value) => value >= 0),
                              suggestedMin: Math.min(...chartDataConfig[filterType].datasets[0].data) - 50,
                              suggestedMax: Math.max(...chartDataConfig[filterType].datasets[0].data) + 50,
                              ticks: {
                                font: { size: 14 },
                              },
                            },
                            x: {
                              ticks: {
                                font: { size: 14 },
                              },
                            },
                          },
                        }}
                        style={{ height: "100%", width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Section - Card */}
              <div className="table-container flex-grow-1 p-3" style={{ minWidth: "45%", maxWidth: "49%" }}>
                <div className="card rounded-3">
                  <div className="card-header bg-primary text-white p-4 rounded-top">
                    <span className="lead fw-medium">Komponen Dengan Penggunaan Air Terbanyak</span>
                  </div>
                  <div className="p-3 bg-light rounded-bottom">
                    {/* Filter Dropdown for Table */}
                    <label htmlFor="filterVolume" className="form-label fs-6">
                      Urut Berdasarkan:
                    </label>
                    <select
                      id="filterVolume"
                      className="form-select form-select-lg"
                      value={filterVolume}
                      onChange={(e) => setFilterVolume(e.target.value)}
                    >
                      <option value="volume">Volume</option>
                      <option value="lokasi">Lokasi</option>
                      <option value="tanggal">Tanggal</option>
                    </select>
                  </div>
                  <div className="card-body lead p-4">
                    {isLoading ? (
                      <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : isError ? (
                      <div className="alert alert-danger" role="alert">
                        Error fetching data. Please try again later.
                      </div>
                    ) : (
                      <div className="table-responsive mt-4">
                        <table className="table table-bordered text-center">
                          <thead className="bg-primary text-white">
                            <tr>
                              <th>No</th>
                              <th>No Komponen</th>
                              <th>Lokasi</th>
                              <th>Total Volume Air</th>
                              <th>Tanggal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topKomponenData.map((komponen, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{komponen.NoKomponen}</td>
                                <td>{komponen.Lokasi || "-"}</td>
                                <td>{komponen.TotalVolumeAir}</td>
                                <td>{new Date(komponen.Tanggal).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}