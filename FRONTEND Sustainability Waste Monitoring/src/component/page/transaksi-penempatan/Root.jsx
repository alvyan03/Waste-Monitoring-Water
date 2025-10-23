import { useState } from "react";
import TransaksiPenempatanIndex from "./Index";
import TransaksiPenempatanAdd from "./Add";
import TransaksiPenempatanDetail from "./Detail";
import TransaksiPenempatanEdit from "./Edit";

export default function TransaksiPenempatan() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <TransaksiPenempatanIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <TransaksiPenempatanAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <TransaksiPenempatanDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <TransaksiPenempatanEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      default:
        return <TransaksiPenempatanIndex onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
