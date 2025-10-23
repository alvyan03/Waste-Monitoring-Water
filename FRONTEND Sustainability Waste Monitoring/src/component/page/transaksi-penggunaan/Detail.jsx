import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import { formatDate, separator } from "../../util/Formatting";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";


const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nomor Komponen": null,
    "Total Volume Air": null,
    Keterangan: null,
    "Tanggal": null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Tanggal] asc", Text: "Tanggal [↑]" },
  { Value: "[Tanggal] desc", Text: "Tanggal [↓]", },
  { Value: "[Nomor Komponen] asc", Text: "Nomor Komponen [↑]" },
  { Value: "[Nomor Komponen] desc", Text: "Nomor Komponen [↓]", },
];

export default function MasterLokasiDetail({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nomor Komponen] asc",
    id: withID,
    status: "",
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

  function formatDate(dateString) {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const date = new Date(dateString);
  
    // Mendapatkan nama hari
    const dayName = days[date.getDay()];
  
    // Format tanggal
    const formattedDate = date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  
    return `${dayName}, ${formattedDate}`;
  }

  const formDataRef = useRef({
    lokasi: "",
    jumlahHulu: "",
    jumlahHilir: "",
    tanggalDibuat: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenggunaanAir/DetailPenggunaanAirHarian",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data volume air."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenggunaanAir/DetailTransaksiKomponen",
          { id: withID }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data detail per komponen."
          );
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Tanggal": formatDate(value["Tanggal"]),
            Alignment: ["center", "center", "center", "center"],
          }));
          setCurrentData(formattedData);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Data Penggunaan Air Harian
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="lokasi"
                title="Lokasi"
                data={formDataRef.current.lokasi}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="jumlahHulu"
                title="Jumlah Hulu"
                data={formDataRef.current.jumlahHulu}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="jumlahHulu"
                title="Jumlah Hilir"
                data={formDataRef.current.jumlahHilir}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="tanggalDibuat"
                title="Tanggal Dibuat"
                data={formDataRef.current.tanggalDibuat}
              />
            </div>
          </div>
        </div>
      </div><br />
      <div className="lead fw-medium text-center">
        Komponen yang digunakan
      </div><br />
      <div className="d-flex flex-column">
        <div className="flex-fill">
          <div className="input-group">
            {/* <Input
              ref={searchQuery}
              forInput="pencarianTransaksiKomponen"
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
                defaultValue="[Nomor Komponen] asc"
              />
            </Filter> */}
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
              />
              {/* <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              /> */}
            </div>
          )}
        </div>
      </div>
      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}