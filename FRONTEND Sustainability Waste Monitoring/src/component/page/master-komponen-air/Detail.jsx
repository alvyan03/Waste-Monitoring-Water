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
    Lokasi: null,
    "Volume Air": null,
    "Tanggal Penggunaan Air": null,
    "Tanggal Perpindahan Komponen": null,
    Count: 0,
  },
];

// const dataFilterSort = [
//   { Value: "[Tanggal] asc", Text: "Tanggal [↑]" },
//   { Value: "[Tanggal] desc", Text: "Tanggal [↓]", },
//   { Value: "[Lokasi] asc", Text: "Lokasi [↑]" },
//   { Value: "[Lokasi] desc", Text: "Lokasi [↓]", },
// ];

export default function MasterKomponenDetail({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Lokasi] asc",
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

  // function handleSearch() {
  //   setIsLoading(true);
  //   setCurrentFilter((prevFilter) => {
  //     return {
  //       ...prevFilter,
  //       page: 1,
  //       query: searchQuery.current.value,
  //       sort: searchFilterSort.current.value,
  //     };
  //   });
  // }
  const formDataRef = useRef({
    noKomponen: "",
    lokasi: "",
    kondisi: "",
    posisi: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterKomponenAir/DetailKomponenAir",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data komponen.");
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
          API_LINK + "MasterKomponenAir/DetailLogKomponenAir",
          { id: withID }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data detail log komponen."
          );
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Tanggal Penggunaan Air":
              value["Tanggal Penggunaan Air"] === "-"
                ? "-"
                : formatDate(value["Tanggal Penggunaan Air"]),
            "Tanggal Perpindahan Komponen":
              value["Tanggal Perpindahan Komponen"] === "-"
                ? "-"
                : formatDate(value["Tanggal Perpindahan Komponen"]),
            "Volume Air":
              value["Volume Air"] === null ? "-" : value["Volume Air"],
            Alignment: ["center", "center", "center", "center", "center"],
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
          Detail Data Komponen vvvvvvvvv
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="nomorKomponen"
                title="Nomor Komponen"
                data={formDataRef.current.noKomponen}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="lokasiKomponen"
                title="Lokasi"
                data={formDataRef.current.lokasi}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="kondisiKomponen"
                title="Kondisi"
                data={formDataRef.current.kondisi}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="posisiKomponen"
                title="Posisi"
                data={formDataRef.current.posisi}
              />
            </div>
          </div>
        </div>
      </div>
      <br />
      <div className="lead fw-medium text-center">
        History Penggunaan Air Komponen
      </div>
      <br />
      <div className="d-flex flex-column">
        <div className="flex-fill">
          {/* <div className="input-group">
            <Input
              ref={searchQuery}
              forInput="pencarianPenggunaanKomponen"
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
          </div> */}
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table data={currentData} isDetailTable={true} />
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
