import { useState } from "react";
import TransaksiPenjualanProduksiIndex from "./Index";
import TransaksiPenjualanProduksiAdd from "./Add";
import TransaksiPenjualanProduksiDetail from "./Detail";
import TransaksiPenjualanProduksiEdit from "./Edit";

export default function TransaksiPenjualanProduksi() {
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
          <TransaksiPenjualanProduksiIndex onChangePage={handleSetPageMode} />
        );
      case "add":
        return (
          <TransaksiPenjualanProduksiAdd onChangePage={handleSetPageMode} />
        );
      case "edit":
        return (
          <TransaksiPenjualanProduksiEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "detail":
        return (
          <TransaksiPenjualanProduksiDetail
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
