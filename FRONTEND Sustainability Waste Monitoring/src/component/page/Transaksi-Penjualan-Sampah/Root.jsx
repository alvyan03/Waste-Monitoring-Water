import { useState } from "react";
import TransaksiPenjualanSampahIndex from "./Index";
// import MasterSampahAdd from "./Add";
// import MasterSampahEdit from "./Edit";
import TransaksiPenjualanSampahAdd from "./Add";
import TransaksiPenjualanSampahEdit from "./Edit";
import TransaksiPenjualanSampahDetail from "./Detail";

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
          <TransaksiPenjualanSampahIndex onChangePage={handleSetPageMode} />
        );
      case "add":
        return <TransaksiPenjualanSampahAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <TransaksiPenjualanSampahEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <TransaksiPenjualanSampahDetail
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
