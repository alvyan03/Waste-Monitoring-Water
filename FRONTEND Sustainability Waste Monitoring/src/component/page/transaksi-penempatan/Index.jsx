import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import DropDown from "../../part/Dropdown";
import Filter from "../../part/Filter";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";

const initialData = [
  {
    Key: null,
    No: null,
    "Data Sensor Bocor": null,
    Judul: null,
    "Penanggung Jawab": null,
    "Tanggal Pengecekan": null,
    Status: null,
    Count: 0,
  },
];

const filterSortOptions = [
  { Value: "pnm_tanggal ASC", Text: "Tanggal Pengecekan [↑]" },
  { Value: "pnm_tanggal DESC", Text: "Tanggal Pengecekan [↓]" },
  { Value: "kom_id ASC", Text: "Judul [↑]" },
  { Value: "kom_id DESC", Text: "Judul [↓]" },
  { Value: "rgn_id ASC", Text: "Penanggung Jawab [↑]" },
  { Value: "rgn_id DESC", Text: "Penanggung Jawab [↓]" },
];

export default function TransaksiPenempatanIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    sortBy: "pnm_tanggal",
    sortDirection: "ASC",
    status: "Aktif",
    query: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  const handleSetCurrentPage = (newPage) => {
    setIsLoading(true);
    setCurrentFilter((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    const sortFilter = searchFilterSort.current;
    if (!sortFilter || !sortFilter.value) return;

    const [sortBy, sortDirection] = sortFilter.value.split(" ");
    setCurrentFilter((prev) => ({
      ...prev,
      page: 1,
      query: searchQuery.current?.value || "",
      sortBy,
      sortDirection,
      status: searchFilterStatus.current
        ? searchFilterStatus.current.value
        : "Aktif",
    }));
  };

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await UseFetch(
        API_LINK + "TrsPenempatan/GetDataPenempatan",
        {
          page: currentFilter.page,
          pageSize: currentFilter.pageSize,
          sortBy: currentFilter.sortBy,
          sortDirection: currentFilter.sortDirection,
          status: currentFilter.status,
          query: currentFilter.query,
        }
      );

      if (!data || data === "ERROR") {
        setIsError(true);
        setCurrentData(initialData);
      } else if (data.length === 0) {
        setCurrentData(initialData);
      } else {
        const formattedData = data.map((item, index) => ({
          Key: item.pnm_id || index,
          No: index + 1,
          Judul: item.kom_id,
          "Penanggung Jawab": item.rgn_id,
          "Tanggal Pengecekan": item.pnm_tanggal,
          Status: item.pnm_status,
          Aksi: [
            "Detail",
            item.pnm_status === "Tidak Aktif" ? "Edit" : null,
          ].filter(Boolean),
          Alignment: Array(6).fill("center"),
        }));
        setCurrentData(formattedData);
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setCurrentData(initialData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentFilter]);

  return (
    <div className="d-flex flex-column">
      {isError && (
        <Alert
          type="warning"
          message="Terjadi kesalahan: Gagal mengambil data penempatan."
        />
      )}

      <div className="input-group">
        <Button
          iconName="add"
          classType="success"
          label="Tambah"
          onClick={() => onChangePage("add")}
        />
        <Input
          ref={searchQuery}
          forInput="pencarianPenempatan"
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
            arrData={filterSortOptions}
            defaultValue="pnm_tanggal ASC"
          />
        </Filter>
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
              totalData={currentData[0]?.Count || 0}
              navigation={handleSetCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
