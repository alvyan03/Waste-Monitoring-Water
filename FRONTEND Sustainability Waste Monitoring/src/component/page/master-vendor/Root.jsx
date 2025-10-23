import { useState } from "react";
import MasterVendorAdd from "./Add";
import MasterVendorEdit from "./Edit";
import MasterVendorIndex from "./Index";
import MasterVendorDetail from "./Detail";

export default function MasterVendor() {
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
        return <MasterVendorIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterVendorAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterVendorEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "detail":
        return (
          <MasterVendorDetail
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
