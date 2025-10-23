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
import ImageInTable from "../../part/ImageInTable";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Kode: null,
    "Nama Produk": null,
    "Jumlah Awal": null,
    "Jumlah Akhir": null,
    "Jumlah Produk": null,
    "Harga Satuan": null,
    Gambar: null,
    Status: null,
    Aksi: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Nama Produk] asc", Text: "Nama Produk [↑]" },
  { Value: "[Nama Produk] desc", Text: "Nama Produk [↓]" },
];

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function MasterProdukIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Key] asc",
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

  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  async function handleDelete(id) {
    try {
      const confirmation = await SweetAlert(
        "Konfirmasi",
        "Apakah Anda yakin ingin menghapus data ini?",
        "warning",
        (confirm = "Ya")
      );

      if (confirmation) {
        const response = await UseFetch(
          API_LINK + "MasterProduk/DeleteProduk",
          { id }
        );

        if (response === "ERROR") {
          throw new Error("Gagal menghapus data");
        }

        SweetAlert("Sukses", "Data berhasil dihapus", "success");
        setCurrentFilter((prev) => ({ ...prev }));
      }
    } catch (error) {
      SweetAlert("Error", error.message, "error");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "MasterProduk/GetDataProduk",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Quantity Awal": formatNumber(value["Quantity Awal"]),
            "Quantity Akhir": formatNumber(value["Quantity Akhir"]),
            "Total Produksi": formatNumber(value["Total Produksi"]),
            "Harga Satuan":
              value["Harga Satuan"] != null
                ? "Rp " + formatNumber(value["Harga Satuan"])
                : "",

            Aksi: ["Detail", "Edit", "Delete"],
            Gambar: value.Gambar ? (
              <ImageInTable src={FILE_LINK + value.Gambar} />
            ) : (
              "-"
            ),
            Alignment: [
              "center",
              "center",
              "left",
              "right",
              "right",
              "right",
              "right",
              "center",
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

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data Produk."
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
              forInput="pencarianProduk"
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
                onDelete={handleDelete}
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
