import { useEffect, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
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
    idKomponen: "",
    nomorKomponen: "",
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
  
        // Fetch lokasi
        const lokasiData = await UseFetch(API_LINK + "MasterLokasi/GetListLokasi2", {});
        console.log(lokasiData); // Pastikan data lokasi diambil dengan benar
        if (lokasiData === "ERROR") throw new Error("Gagal mengambil daftar lokasi.");
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
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(formData, userSchema, setErrors);

    if (Object.values(validationErrors).every((error) => !error)) {
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

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Komponen
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Label
                  title="Nomor Komponen"
                  data={formData.nomorKomponen}
                  forLabel="nomorKomponen"
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.nomorKomponen}
                />
              </div>
              <div className="col-lg-6">
                <DropDown
                  forInput="lantai"
                  label="Lokasi"
                  arrData={listLokasi}
                  isRequired
                  value={formData.lantai}
                  onChange={handleInputChange}
                  errorMessage={errors.lantai}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="textarea"
                  forInput="kondisi"
                  label="Kondisi & Keterangan"
                  value={formData.kondisi}
                  onChange={handleInputChange}
                  errorMessage={errors.kondisi}
                />
              </div>
              <div className="col-lg-6">
                <DropDown
                  forInput="letak"
                  label="Posisi"
                  arrData={letak}
                  isRequired
                  value={formData.letak}
                  onChange={handleInputChange}
                  errorMessage={errors.letak}
                />
              </div>
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