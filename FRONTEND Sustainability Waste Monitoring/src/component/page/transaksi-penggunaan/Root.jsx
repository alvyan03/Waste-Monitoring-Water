import { useState } from "react";
import TransaksiPenggunaanAirIndex from "./Index";
import TransaksiPenggunaanAirDetail from "./Detail";

export default function TransaksiPenggunaanAir() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState(null);

  function handleSetPageMode(mode, withID = null) {
    if (withID !== null) {
      setDataID(withID);
    }
    setPageMode(mode);
  }

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <TransaksiPenggunaanAirIndex onChangePage={handleSetPageMode} />;
      case "detail":
      return (
        <TransaksiPenggunaanAirDetail
          onChangePage={handleSetPageMode}
          withID={dataID}
        />
      );
      default:
        return <TransaksiPenggunaanAirIndex onChangePage={handleSetPageMode} />;
    }
  }


  return <div>{getPageMode()}</div>;
}
