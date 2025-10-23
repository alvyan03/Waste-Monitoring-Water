import { useState } from "react";
import MasterEvaluasiTargetIndex from "./Index";
import MasterEvaluasiTargetAdd from "./Add";
import MasterEvaluasiTargetDetail from "./Detail";
import MasterEvaluasiTargetEdit from "./Edit";

export default function MasterEvaluasiTarget() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterEvaluasiTargetIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterEvaluasiTargetAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterEvaluasiTargetDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterEvaluasiTargetEdit
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