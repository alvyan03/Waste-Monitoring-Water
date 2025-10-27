import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

const posisi = [{ Value: "Hilir", Text: "Hilir" }];

export default function MasterKomponenAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listLokasi, setListLokasi] = useState({});

  const formDataRef = useRef({
    lokasi: "",
    kondisi: "",
    posisi: "",
  });

  const userSchema = object({
    lokasi: string().required("harus dipilih"),
    kondisi: string().required("harus dipilih"),
    posisi: string().required("harus dipilih"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterLokasi/GetListLokasi2",
          {}
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar lokasi.");
        } else {
          setListLokasi(data);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
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
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "MasterKomponenAir/CreateKomponenAir",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data komponen.");
        } else {
          SweetAlert("Sukses", "Data komponen berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
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
            Tambah Data Komponen Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
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
                <DropDown
                  forInput="posisi"
                  label="Posisi"
                  arrData={posisi}
                  isRequired
                  onChange={handleInputChange}
                  errorMessage={errors.posisi}
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
