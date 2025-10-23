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
    "Nama Vendor": null,
    "Tanggal Buang": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Kode] asc", Text: "Kode [↑]" },
  { Value: "[Kode] desc", Text: "Kode [↓]" },
];

export default function TransaksiProduksiIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [dokumen, setDokumen] = useState({});
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Kode] DESC",
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
    const fetchDokumen = async () => {
      try {
        const response = await UseFetch(
          API_LINK + "TransaksiProduksi/cekDokumenProduksi",
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
          API_LINK + "TransaksiProduksi/GetDataProduksi",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Aksi:
              value["Status"] === "Draft"
                ? ["Sent", "Detail", "Edit"]
                : ["Detail"],
            Alignment: [
              "center",
              "left",
              "left",
              "left",
              "left",
              "left",
              "center",
            ],
          }));

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
    setIsError(false);

    const dokumenData = dokumen.find((item) => item.idProduksi === id);
    const dokumenLengkap = dokumenData?.dokumen?.trim() !== "";

    const pesan = dokumenLengkap
      ? "Apakah Anda yakin ingin tetap mengirim Data Produksi Daur Ulang ini?"
      : "Anda belum melengkapi data pada bagian Dokumen.\nApakah Anda yakin ingin tetap mengirim Data Produksi Daur Ulang ini?";

    const result = await SweetAlert(
      "Kirim Data Produksi Daur Ulang",
      pesan,
      "warning",
      "Ya, Saya Yakin!"
    );

    if (result) {
      setIsLoading(true);
      UseFetch(API_LINK + "TransaksiProduksi/sentProduksi", {
        idProduksi: id,
      })
        .then((data) => {
          if (data === "ERROR") setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Data Produksi Daur Ulang berhasil dikirim",
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
              message="Terjadi kesalahan: Gagal mengambil data pembuangan sampah."
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
                onSent={handleSent}
                onDetail={onChangePage}
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
