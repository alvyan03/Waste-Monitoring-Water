import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import { formatDate } from "../../util/Formatting";
import { formatDate } from "../../util/Formatting";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Table from "../../part/Table";

// Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon untuk Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

// Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon untuk Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Lokasi: null,
    "Volume Air": null,
    "Tanggal Penggunaan Air": null,
    "Tanggal Perpindahan Komponen": null,
    Count: 0,
  },
];

export default function MasterKomponenDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const formDataRef = useRef({
    noKomponen: "",
    lokasi: "",
    kondisi: "",
    posisi: "",
    latitude: "",
    longitude: "",
    latitude: "",
    longitude: "",
  });

  // Ambil detail komponen
  // Ambil detail komponen
  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      setIsError({ error: false, message: "" });
      try {
        const data = await UseFetch(
          API_LINK + "MasterKomponenAir/DetailKomponenAir",
          { id: withID }
        );

        if (data === "ERROR" || !data || data.length === 0) {
          throw new Error("Gagal mengambil data komponen.");
        }

        formDataRef.current = { ...formDataRef.current, ...data[0] };
      } catch (error) {
        setIsError({ error: true, message: error.message });
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);
  }, [withID]);

  // Ambil history log komponen
  // Ambil history log komponen
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "MasterKomponenAir/DetailLogKomponenAir",
          { id: withID }
        );

        if (data === "ERROR" || !data || data.length === 0) {
        if (data === "ERROR" || !data || data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            "Tanggal Penggunaan Air":
              value["Tanggal Penggunaan Air"] === "-"
                ? "-"
                : formatDate(value["Tanggal Penggunaan Air"]),
            "Tanggal Perpindahan Komponen":
              value["Tanggal Perpindahan Komponen"] === "-"
                ? "-"
                : formatDate(value["Tanggal Perpindahan Komponen"]),
            "Volume Air":
              value["Volume Air"] === null ? "-" : value["Volume Air"],
            Alignment: ["center", "center", "center", "center", "center"],
          }));
          setCurrentData(formattedData);
        }
      } catch (error) {
        console.error(error);
        console.error(error);
      }
    };

    fetchData();
  }, [withID]);
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}

      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          Detail Data Komponen
        </div>
        <div className="card-body">
          <div className="row mb-3">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-lg-3">
              <Label
                title="Nomor Komponen"
                data={formDataRef.current.noKomponen}
              />
            </div>
            <div className="col-lg-3">
              <Label title="Lokasi" data={formDataRef.current.lokasi} />
            </div>
            <div className="col-lg-3">
              <Label title="Kondisi" data={formDataRef.current.kondisi} />
            </div>
            <div className="col-lg-3">
              <Label title="Posisi" data={formDataRef.current.posisi} />
            </div>
          </div>

          {/* Map */}
          {formDataRef.current.latitude && formDataRef.current.longitude ? (
            <MapContainer
              center={[
                parseFloat(formDataRef.current.latitude),
                parseFloat(formDataRef.current.longitude),
              ]}
              zoom={15}
              style={{ height: 300, width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[
                  parseFloat(formDataRef.current.latitude),
                  parseFloat(formDataRef.current.longitude),
                ]}
              >
                <Popup>
                  {formDataRef.current.lokasi} <br />{" "}
                  {formDataRef.current.posisi}
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p className="text-center text-muted">Map tidak tersedia</p>
          )}
        </div>
      </div>

      <div className="mb-3 text-center fw-medium">
        History Penggunaan Air Komponen
      </div>
      <Table data={currentData} isDetailTable={true} />

      <div className="float-end mt-4">

      <div className="mb-3 text-center fw-medium">
        History Penggunaan Air Komponen
      </div>
      <Table data={currentData} isDetailTable={true} />

      <div className="float-end mt-4">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
