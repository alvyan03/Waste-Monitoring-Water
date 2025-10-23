import { useState } from "react";
import TransaksiProduksiIndex from "./Index";
import TransaksiProduksiAdd from "./Add";
import TransaksiProduksiEdit from "./Edit";
import TransaksiProduksiDetail from "./Detail";

export default function TransaksiProduksi() {
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
        return <TransaksiProduksiIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <TransaksiProduksiAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <TransaksiProduksiEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <TransaksiProduksiDetail
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
