import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK, FILE_LINK } from "../../util/Constants";
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
    Kode: null,
    "Nama Sampah": null,
    Qty: null,
    "Harga Jual": null,
    "Total Harga": null,
    Vendor: null,
    Tanggal: null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Kode] asc", Text: "Kode [↑]" },
  { Value: "[Kode] desc", Text: "Kode [↓]" },
];

function formatTanggal(dateString) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);

    // Periksa apakah tanggal valid
    if (isNaN(date.getTime())) return dateString;

    // Daftar nama bulan singkat
    const bulan = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const day = date.getDate().toString().padStart(2, "0");
    const month = bulan[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (error) {
    return dateString; // Kembalikan string asli jika ada error
  }
}

export default function TransaksiPenjualanSampahIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [dokumen, setDokumen] = useState({});
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[KODE] DESC",
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
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
      };
    });
  }

  useEffect(() => {
    const fetchDokumen = async () => {
      try {
        const response = await UseFetch(
          API_LINK + "TransaksiPenjualanSampah/cekDokumenPenjualanSampah",
          {}
        );
        setDokumen(response);
      } catch (error) {
        console.error("Gagal mengambil dokumen:", error);
      }
    };

    fetchDokumen();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanSampah/GetDataPenjualanSampah",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => {
            const isDraft = value.Status?.toLowerCase() === "draft"; // cek status

            return {
              ...value,
              // Format tanggal di sini
              Tanggal: formatTanggal(value.Tanggal),
              Aksi: isDraft ? ["Sent", "Detail", "Edit"] : ["Detail"],
              Alignment: [
                "center",
                "left",
                "left",
                "left",
                "left",
                "left",
                "center",
                "center",
              ],
            };
          });

          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  async function handleSent(id) {
    const dokumenData = dokumen.find((item) => item.idPenjualan === id);
    const dokumenLengkap = dokumenData?.dokumen?.trim() !== "";

    const pesan = dokumenLengkap
      ? "Apakah Anda yakin ingin tetap mengirim Data Penjualan Sampah ini?"
      : "Anda belum melengkapi data pada bagian Dokumen.\nApakah Anda yakin ingin tetap mengirim Data Penjualan Sampah ini?";

    const result = await SweetAlert(
      "Kirim Data Penjualan Sampah",
      pesan,
      "warning",
      "Ya, Saya Yakin!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(API_LINK + "TransaksiPenjualanSampah/SentPenjualanSampah", {
        idPermintaan: id,
      })
        .then((data) => {
          if (data === "ERROR") setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Data Penjualan Sampah berhasil dikirim",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .then(() => {
          setIsLoading(false);
          setReloadKey((prevKey) => prevKey + 1);
        });
    }
  }

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data penjualan sampah."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Button
              iconName="add"
              classType="success"
              label="Tambah"
              onClick={() => onChangePage("add")}
            />
            <Input
              ref={searchQuery}
              forInput="pencarianJenisSampah"
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
                defaultValue="[Key] asc"
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
                onEdit={onChangePage}
                onDetail={onChangePage}
                onSent={handleSent}
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
