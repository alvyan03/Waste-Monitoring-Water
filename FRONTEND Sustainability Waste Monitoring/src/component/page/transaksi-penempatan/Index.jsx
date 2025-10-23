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

const initialData = [
  {
    Key: null,
    No: null,
    "No Komponen": null,
    "Ruangan": null,
    "Jenis": null,
    Status: null,
    Count: 0,
  },
];

const filterSortOptions = [
  { Value: "kom_no_komponen ASC", Text: "No Komponen [↑]" },
  { Value: "kom_no_komponen DESC", Text: "No Komponen [↓]" },
  { Value: "rgn_kode ASC", Text: "Nama Ruangan [↑]" },
  { Value: "rgn_kode DESC", Text: "Nama Ruangan [↓]" },
  { Value: "rgn_lantai ASC", Text: "Lantai [↑]" },
  { Value: "rgn_lantai DESC", Text: "Lantai [↓]" },
];

export default function TransaksiPenempatanIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    sortBy: "kom_no_komponen",
    sortDirection: "ASC",
    status: "Aktif",
    query: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({ ...prevFilter, page: newCurrentPage }));
  }

  const handleSearch = () => {
    setIsLoading(true);

    // Check if refs are properly set
    const sortFilter = searchFilterSort.current;
    if (!sortFilter || !sortFilter.value) {
      console.error("Sort filter is not available.");
      setIsLoading(false);
      return;
    }

    const [sortBy, sortDirection] = sortFilter.value.split(" ");
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sortBy,
      sortDirection,
      status: searchFilterStatus.current ? searchFilterStatus.current.value : "Aktif",
    }));
  };

  async function handleSetStatus(id) {
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
          status: currentFilter.status, // Status filter yang akan digunakan
          query: currentFilter.query,
        }
      );
    } catch (error) {
      console.error("Error updating status:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "TrsPenempatan/GetDataPenempatan",
          {
            page: currentFilter.page,
            pageSize: currentFilter.pageSize,
            sortBy: currentFilter.sortBy,
            sortDirection: currentFilter.sortDirection,
            p5: currentFilter.status || "Aktif", // Kirim nilai status
            query: currentFilter.query,
          }
        );
  
        if (!data || data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(initialData);
        } else {
          // Menghapus kolom 'Status Ruangan' dari data
          const formattedData = data.map((value) => {
            const { "Status Ruangan": _, ...rest } = value; // Menghapus Status Ruangan
            return {
              ...rest,
              Aksi: ["Detail", value["Status Ruangan"] === "Tidak Aktif" ? "Edit" : null].filter(Boolean),
              Alignment: [
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
              ],
            };
          });
          setCurrentData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
              message="Terjadi kesalahan: Gagal mengambil data penempatan."
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
                defaultValue="kom_no_komponen ASC"
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
                onToggle={handleSetStatus}
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
    </>
  );
}
