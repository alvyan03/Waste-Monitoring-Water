import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Tanggal: null,
    Lokasi: null,
    "Volume Air": null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Lokasi] asc", Text: "Lokasi [↑]" },
  { Value: "[Lokasi] desc", Text: "Lokasi [↓]" },
];

export default function TransaksiPenggunaanAirIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Lokasi] asc",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current ? searchQuery.current.value : "",
        sort: searchFilterSort.current
          ? searchFilterSort.current.value
          : "[Lokasi] asc",
      };
    });
  }
  function formatDate(dateString) {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const date = new Date(dateString);

    // Mendapatkan nama hari
    const dayName = days[date.getDay()];

    // Format tanggal
    const formattedDate = date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format waktu dengan force 24-hour clock
    const formattedTime = date
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Menggunakan format 24 jam
      })
      .replace(/\./g, ":"); // Mengganti semua titik dengan titik dua

    return `${dayName}, ${formattedDate} ${formattedTime}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true); // Set loading sebelum mulai proses
      try {
        // 3. Memanggil API GetDataPenggunaanAir
        const data = await UseFetch(
          API_LINK + "TransaksiPenggunaanAir/GetDataPenggunaanAir",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
          setCurrentData(inisialisasiData); // Reset data jika terjadi error
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData); // Reset jika data kosong
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Volume Air": parseFloat(value["Volume Air"]).toFixed(2),
            Tanggal: value["Tanggal"] ? formatDate(value["Tanggal"]) : "-", // Tetapkan '-' jika tanggal tidak ada
            Aksi: ["Detail"],
            Alignment: [
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
          }));
          setCurrentData(formattedData);
        }
      } catch (error) {
        console.error(error);
        setIsError(true);
      } finally {
        setIsLoading(false); // Set loading selesai setelah proses selesai
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data Air."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Input
              ref={searchQuery}
              forInput="pencarianLokasi"
              placeholder="Cari"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
            <Filter>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="none"
                arrData={dataFilterSort}
                defaultValue="[Lokasi] asc"
              />
            </Filter>
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onDetail={onChangePage}
                onEdit={onChangePage}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
