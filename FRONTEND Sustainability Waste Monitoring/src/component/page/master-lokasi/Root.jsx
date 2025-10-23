import { useState } from "react";
import MasterLokasiIndex from "./Index";
import MasterLokasiAdd from "./Add";
import MasterLokasiDetail from "./Detail";
import MasterLokasiEdit from "./Edit";

export default function MasterLokasi() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterLokasiIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterLokasiAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterLokasiDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterLokasiEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
