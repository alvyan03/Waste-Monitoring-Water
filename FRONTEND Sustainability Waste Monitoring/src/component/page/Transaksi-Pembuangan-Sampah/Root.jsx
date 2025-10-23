import { useState } from "react";
import TransaksiPembuanganSampahIndex from "./Index";
import TransaksiPembuanganSampahAdd from "./Add";
import TransaksiPembuanganSampahDetail from "./Detail";
import TransaksiPembuanganSampahEdit from "./Edit";

export default function TransaksiPembuanganSampah() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState(null);

  function handleSetPageMode(mode, withID = null) {
    if (withID) {
      setDataID(withID);
    } else {
      setDataID(null);
    }
    setPageMode(mode);
  }

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return (
          <TransaksiPembuanganSampahIndex onChangePage={handleSetPageMode} />
        );
      case "add":
        return (
          <TransaksiPembuanganSampahAdd onChangePage={handleSetPageMode} />
        );
      case "detail":
        return (
          <TransaksiPembuanganSampahDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <TransaksiPembuanganSampahEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      default:
        return (
          <div className="alert alert-danger">Halaman tidak ditemukan</div>
        );
    }
  }

  return <div className="container-fluid">{getPageMode()}</div>;
}
