import { useState } from "react";
import MasterJenisSampahIndex from "./Index";
import MasterJenisSampahAdd from "./Add";
import MasterJenisSampahEdit from "./Edit";
import MasterJenisSampahDetail from "./Detail";

export default function MasterJenisSampah() {
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
        return <MasterJenisSampahIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterJenisSampahAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterJenisSampahEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <MasterJenisSampahDetail
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
