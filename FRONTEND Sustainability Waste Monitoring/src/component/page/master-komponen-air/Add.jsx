import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icon Leaflet supaya marker muncul
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MasterKomponenAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listLokasi, setListLokasi] = useState({});
  const [position, setPosition] = useState(null); // lokasi dari map

  const formDataRef = useRef({
    lokasi: "",
    kondisi: "",
    posisi: "Hilir",
    latitude: "",
    longitude: "",
  });

  const userSchema = object({
    lokasi: string().required("Harus dipilih"),
    kondisi: string().required("Harus diisi"),
    posisi: string().notRequired(),
    latitude: string().notRequired(),
    longitude: string().notRequired(),
  });

  // Ambil daftar lokasi dari API
  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      try {
        const data = await UseFetch(
          API_LINK + "MasterLokasi/GetListLokasi",
          {}
        );
        if (data === "ERROR") throw new Error("Gagal mengambil daftar lokasi.");
        setListLokasi(data);
      } catch (error) {
        setIsError({ error: true, message: error.message });
        setListLokasi({});
      }
    };
    fetchData();
  }, []);
  // MENGAMBIL DAFTAR LOKASI -- END

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prev) => ({
      ...prev,
      [validationError.name]: validationError.error,
    }));
  };

  // Handler submit
  const handleAdd = async (e) => {
    e.preventDefault();
    console.log("TOMBOL SIMPAN DIKLIK");

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (!position) {
      SweetAlert(
        "Peringatan",
        "Silakan pilih lokasi di peta terlebih dahulu.",
        "warning"
      );
      return;
    }

    if (Object.values(validationErrors).every((err) => !err)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      const payload = {
        ...formDataRef.current,
        latitude: position.lat,
        longitude: position.lng,
      };

      try {
        const data = await UseFetch(
          API_LINK + "MasterKomponenAir/CreateKomponenAir",
          payload
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data komponen.");
        } else {
          SweetAlert("Sukses", "Data komponen berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Component untuk menangkap klik map
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        formDataRef.current.latitude = e.latlng.lat;
        formDataRef.current.longitude = e.latlng.lng;
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}

      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Data Komponen Baru vvvvvvvvvvvvvssssss
          </div>
          <div className="card-body p-4">
            <div className="row mb-3">
              <div className="col-lg-4">
                <DropDown
                  forInput="lokasi"
                  label="Lokasi"
                  arrData={listLokasi}
                  isRequired
                  value={formDataRef.current.lokasi}
                  onChange={handleInputChange}
                  errorMessage={errors.lokasi}
                />
              </div>
              <div className="col-lg-4">
                <label className="form-label">Posisi</label>
                <input
                  type="text"
                  className="form-control"
                  value={formDataRef.current.posisi}
                  readOnly
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="kondisi"
                  label="Kondisi & Keterangan"
                  value={formDataRef.current.kondisi}
                  onChange={handleInputChange}
                  errorMessage={errors.kondisi}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Pilih Lokasi di Peta</label>
              <div
                style={{
                  height: "300px",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <MapContainer
                  center={[-6.3485, 107.1484]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                  />
                  <MapClickHandler />
                </MapContainer>
              </div>
              {position && (
                <div className="mt-2 text-muted">
                  <small>
                    Koordinat: Lat {position.lat.toFixed(5)}, Lng{" "}
                    {position.lng.toFixed(5)}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
          />
        </div>
      </form>
    </>
  );
}
