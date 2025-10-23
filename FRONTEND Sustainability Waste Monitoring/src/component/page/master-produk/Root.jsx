import { useState } from "react";
import Mast from "./Index";
import MasterProdukAdd from "./Add";
import MasterProdukEdit from "./Edit";
import MasterProdukIndex from "./Index";
import MasterProdukDetail from "./Detail";

export default function MasterProduk() {
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
        return <MasterProdukIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterProdukAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterProdukEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "detail":
        return (
          <MasterProdukDetail
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
