import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterLokasiEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    idLokasi: "",
    namaGedung: "",
    lantai: "",
    jumlahHulu: "",
    jumlahHilir: "",
  });

  const userSchema = object({
    idLokasi: string().required("harus diisi"),
    namaGedung: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    lantai: string().required("harus diisi"),
    jumlahHulu: string().required("harus diisi"),
    jumlahHilir: string().required("harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "MasterLokasi/GetDataLokasiById", { id: withID });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data komponen.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
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
    };

    fetchData();
  }, [withID]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "namaGedung") {
      const filteredValue = value.replace(/[^A-Za-z\s]/g, "");
      formDataRef.current[name] = filteredValue;
      e.target.value = filteredValue;
    } else if (["jumlahHulu", "jumlahHilir"].includes(name)) {
      const numericValue = value.replace(/\D/g, "");
      formDataRef.current[name] = numericValue;
      e.target.value = numericValue;
    } else {
      formDataRef.current[name] = value;
    }

    const validationError = await validateInput(name, formDataRef.current[name], userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault(); // Pastikan ini ada di awal

    const validationErrors = await validateAllInputs(formDataRef.current, userSchema, setErrors);

    if (Object.values(validationErrors).every((error) => !error)) {
        setIsLoading(true);
        setIsError({ error: false, message: "" });
        setErrors({});

        try {
            console.log("Sending data:", formDataRef.current); // Debugging
            const data = await UseFetch(API_LINK + "MasterLokasi/EditLokasi", formDataRef.current);

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
    } else {
        console.log("Validation errors:", validationErrors); // Debugging
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
                <Input
                  type="text"
                  forInput="namaGedung"
                  label="Nama Gedung"
                  isRequired
                  value={formDataRef.current.namaGedung}
                  onChange={handleInputChange}
                  errorMessage={errors.namaGedung}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="lantai"
                  label="Lantai"
                  isRequired
                  value={formDataRef.current.lantai}
                  onChange={handleInputChange}
                  errorMessage={errors.lantai}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="jumlahHulu"
                  label="Jumlah Hulu"
                  isRequired
                  value={formDataRef.current.jumlahHulu}
                  onChange={handleInputChange}
                  errorMessage={errors.jumlahHulu}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="jumlahHilir"
                  label="Jumlah Hilir"
                  isRequired
                  value={formDataRef.current.jumlahHilir}
                  onChange={handleInputChange}
                  errorMessage={errors.jumlahHilir}
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
