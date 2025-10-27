import React, { useState, useEffect } from "react";
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
import Label from "../../part/Label";
import DropDown from "../../part/Dropdown";

const letak = [
  { Value: "Hulu", Text: "Hulu" },
  { Value: "Hilir", Text: "Hilir" },
];

export default function MasterKomponenEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listLokasi, setListLokasi] = useState([]);
  const [formData, setFormData] = useState({
    lokasi: "",
    kondisi: "",
    lantai: "",
    letak: "",
  });

  const userSchema = object({
    nomorKomponen: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    kondisi: string().required("harus diisi"),
    lantai: string().required("harus diisi"),
    letak: string().required("harus diisi"),
    idKomponen: string().required("harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsError({ error: false, message: "" });
        setIsLoading(true);

        const lokasiData = await UseFetch(
          API_LINK + "MasterLokasi/GetListLokasi",
          {}
        );
        if (lokasiData === "ERROR")
          throw new Error("Gagal mengambil daftar lokasi.");
        setListLokasi(lokasiData);
  
        // Fetch data komponen berdasarkan ID
        const komponenData = await UseFetch(API_LINK + "MasterKomponenAir/GetDataKomponenAirById", { id: withID });
        console.log(komponenData); // Pastikan data komponen ada
        if (komponenData === "ERROR" || komponenData.length === 0) throw new Error("Gagal mengambil data komponen.");
        setFormData(komponenData[0]); // Update state formData dengan data komponen
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const validationError = await validateInput(name, value, userSchema);
    setErrors((prev) => ({
      ...prev,
      [validationError.name]: validationError.error,
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
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

      try {
        const data = await UseFetch(API_LINK + "MasterKomponenAir/EditKomponenAir", formData);

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

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        setFormData((prev) => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}
      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Komponen
          </div>
          <div className="card-body p-4">
            <div className="row mb-3">
              <div className="col-lg-4">
                <DropDown
                  forInput="lokasi"
                  label="Lokasi"
                  arrData={listLokasi}
                  isRequired
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  errorMessage={errors.lokasi}
                />
              </div>
              <div className="col-lg-4">
                <label className="form-label">Posisi</label>
                <input
                  type="text"
                  className="form-control"
                  name="posisi"
                  value={formData.posisi}
                  readOnly
                />
              </div>
              <div className="col-lg-12">
                <Input
                  type="textarea"
                  forInput="kondisi"
                  label="Kondisi & Keterangan"
                  value={formData.kondisi}
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
                  center={
                    position
                      ? [position.lat, position.lng]
                      : [-6.3485, 107.1484]
                  }
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
