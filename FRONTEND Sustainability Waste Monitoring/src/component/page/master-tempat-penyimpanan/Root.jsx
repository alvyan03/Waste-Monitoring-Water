import { useState } from "react";
import MasterTempatPenyimpananIndex from "./Index";
import MasterTempatPenyimpananAdd from "./Add";
import MasterTempatPenyimpananEdit from "./Edit";
import MasterTempatPenyimpananDetail from "./Detail";

export default function MasterTempatPenyimpanan() {
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
          <MasterTempatPenyimpananIndex onChangePage={handleSetPageMode} />
        );
      case "add":
        return <MasterTempatPenyimpananAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterTempatPenyimpananEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <MasterTempatPenyimpananDetail
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
