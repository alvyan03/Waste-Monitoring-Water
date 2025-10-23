import { useState } from "react";
import MasterSampahIndex from "./Index";
import MasterSampahAdd from "./Add";
import MasterSampahEdit from "./Edit";
import MasterSampahDetail from "./Detail";

export default function MasterSampah() {
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
        return <MasterSampahIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterSampahAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterSampahEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "detail":
        return (
          <MasterSampahDetail
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
