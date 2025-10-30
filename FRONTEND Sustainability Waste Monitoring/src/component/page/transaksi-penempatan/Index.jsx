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
    "Data Sensor Bocor": null,
    Judul: null,
    "Penanggung Jawab": null,
    "Tanggal Pengecekan": null,
    Status: null,
    Count: 0,
  },
];

const filterSortOptions = [
  { Value: "[Nomor Transaksi] asc", Text: "Nomor Transaksi [↑]" },
  { Value: "[Nomor Transaksi] desc", Text: "Nomor Transaksi [↓]" },
  { Value: "[Nomor Komponen] asc", Text: "Nomor Komponen [↑]" },
  { Value: "[Nomor Komponen] desc", Text: "Nomor Komponen [↓]" },
  { Value: "[Tanggal Rencana Mulai] asc", Text: "Tanggal Rencana Mulai [↑]" },
  { Value: "[Tanggal Rencana Mulai] desc", Text: "Tanggal Rencana Mulai [↓]" },
  {
    Value: "[Tanggal Rencana Selesai] asc",
    Text: "Tanggal Rencana Selesai [↑]",
  },
  {
    Value: "[Tanggal Rencana Selesai] desc",
    Text: "Tanggal Rencana Selesai [↓]",
  },
  { Value: "[Tanggal Pengecekan] asc", Text: "Tanggal Pengecekan [↑]" },
  { Value: "[Tanggal Pengecekan] desc", Text: "Tanggal Pengecekan [↓]" },
  { Value: "[Tanggal Aktual Selesai] asc", Text: "Tanggal Aktual Selesai [↑]" },
  {
    Value: "[Tanggal Aktual Selesai] desc",
    Text: "Tanggal Aktual Selesai [↓]",
  },
  { Value: "pnm_tanggal ASC", Text: "Tanggal Pengecekan [↑]" },
  { Value: "pnm_tanggal DESC", Text: "Tanggal Pengecekan [↓]" },
  { Value: "kom_id ASC", Text: "Judul [↑]" },
  { Value: "kom_id DESC", Text: "Judul [↓]" },
  { Value: "rgn_id ASC", Text: "Penanggung Jawab [↑]" },
  { Value: "rgn_id DESC", Text: "Penanggung Jawab [↓]" },
  { Value: "[Nomor Transaksi] asc", Text: "Nomor Transaksi [↑]" },
  { Value: "[Nomor Transaksi] desc", Text: "Nomor Transaksi [↓]" },
  { Value: "[Nomor Komponen] asc", Text: "Nomor Komponen [↑]" },
  { Value: "[Nomor Komponen] desc", Text: "Nomor Komponen [↓]" },
  { Value: "[Tanggal Rencana Mulai] asc", Text: "Tanggal Rencana Mulai [↑]" },
  { Value: "[Tanggal Rencana Mulai] desc", Text: "Tanggal Rencana Mulai [↓]" },
  {
    Value: "[Tanggal Rencana Selesai] asc",
    Text: "Tanggal Rencana Selesai [↑]",
  },
  {
    Value: "[Tanggal Rencana Selesai] desc",
    Text: "Tanggal Rencana Selesai [↓]",
  },
  { Value: "[Tanggal Pengecekan] asc", Text: "Tanggal Pengecekan [↑]" },
  { Value: "[Tanggal Pengecekan] desc", Text: "Tanggal Pengecekan [↓]" },
  { Value: "[Tanggal Aktual Selesai] asc", Text: "Tanggal Aktual Selesai [↑]" },
  {
    Value: "[Tanggal Aktual Selesai] desc",
    Text: "Tanggal Aktual Selesai [↓]",
  },
];

export default function TransaksiPenempatanIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    sortBy: "pnm_tanggal",
    sortDirection: "[Nomor Transaksi] asc",
    status: "ALL",
    sortBy: "pnm_tanggal",
    sortDirection: "[Nomor Transaksi] asc",
    status: "ALL",
    query: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  const handleSetCurrentPage = (newPage) => {
  const handleSetCurrentPage = (newPage) => {
    setIsLoading(true);
    setCurrentFilter((prev) => ({ ...prev, page: newPage }));
  };
    setCurrentFilter((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    const sortFilter = searchFilterSort.current;
    if (!sortFilter || !sortFilter.value) return;
    if (!sortFilter || !sortFilter.value) return;

    const [sortBy, sortDirection] = sortFilter.value.split(" ");
    setCurrentFilter((prev) => ({
      ...prev,
    setCurrentFilter((prev) => ({
      ...prev,
      page: 1,
      query: searchQuery.current?.value || "",
      query: searchQuery.current?.value || "",
      sortBy,
      sortDirection,
      status: searchFilterStatus.current
        ? searchFilterStatus.current.value
        : "Aktif",
      status: searchFilterStatus.current
        ? searchFilterStatus.current.value
        : "Aktif",
    }));
  };

  const fetchData = async () => {
  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await UseFetch(
        API_LINK + "TransaksiKontrolKomponenAir/GetDataTrsKontrolKomponenAir",
        API_LINK + "TransaksiKontrolKomponenAir/GetDataTrsKontrolKomponenAir",
        {
          // page: currentFilter.page,
          // pageSize: currentFilter.pageSize,
          // sortBy: currentFilter.sortBy,
          // sortDirection: currentFilter.sortDirection,
          // status: currentFilter.status,
          // query: currentFilter.query,
          // page: currentFilter.page,
          // pageSize: currentFilter.pageSize,
          // sortBy: currentFilter.sortBy,
          // sortDirection: currentFilter.sortDirection,
          // status: currentFilter.status,
          // query: currentFilter.query,
          page: currentFilter.page,
          query: currentFilter.query,
          sortBy: currentFilter.sortDirection,
          status: currentFilter.status,
        }
      );
      console.log(data);
      console.log(currentFilter);
      if (
        !data ||
        data === "ERROR" ||
        !Array.isArray(data) ||
        data.length === 0
      ) {
        setIsError(true);
        setCurrentData(initialData);
      } else {
        const formattedData = data.map((item, index) => ({
          Key: item.Key || index,
          No: index + 1,
          Judul: item.Judul,
          Kondisi: item.Kondisi,
          "Nomor Komponen": item["Nomor Komponen"],
          PIC: item.PIC,
          "Status Perbaikan": item["Status Perbaikan"],
          Aksi: [
            "Detail",
            item.pnm_status === "Tidak Aktif" ? "Edit" : null,
          ].filter(Boolean),
          Alignment: Array(6).fill("center"),
        }));
        setCurrentData(formattedData);
      }
    } catch (err) {
      setIsError(true);
      setCurrentData(initialData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
          pageSize: currentFilter.pageSize,
          sortBy: currentFilter.sortBy,
          sortDirection: currentFilter.sortDirection,
          query: currentFilter.query,
          sortBy: currentFilter.sortDirection,
          status: currentFilter.status,
        }
      );
      console.log(data);
      console.log(currentFilter);
      if (
        !data ||
        data === "ERROR" ||
        !Array.isArray(data) ||
        data.length === 0
      ) {
        setIsError(true);
        setCurrentData(initialData);
      } else {
        const formattedData = data.map((item, index) => ({
          Key: item.Key || index,
          No: index + 1,
          Judul: item.Judul,
          Kondisi: item.Kondisi,
          "Nomor Komponen": item["Nomor Komponen"],
          PIC: item.PIC,
          "Status Perbaikan": item["Status Perbaikan"],
          Aksi: [
            "Detail",
            item.pnm_status === "Tidak Aktif" ? "Edit" : null,
          ].filter(Boolean),
          Alignment: Array(6).fill("center"),
        }));
        setCurrentData(formattedData);
      }
    } catch (err) {
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
            defaultValue="[Nomor Transaksi] asc"
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
            defaultValue="[Nomor Transaksi] asc"
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
