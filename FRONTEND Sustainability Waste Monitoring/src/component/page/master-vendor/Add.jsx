import { useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterVendorAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const dokumenVendorRef = useRef(null);

  const formDataRef = useRef({
    nama: "",
    no_telp: "",
    email: "",
    alamat: "",
    kota: "",
    dokumen: "",
  });

  const userSchema = object({
    nama: string().required("Nama vendor harus diisi").max(255),
    no_telp: string()
      .required("No telp harus diisi")
      .matches(/^\d+$/, "No telp hanya boleh berisi angka")
      .min(10, "No telp minimal 10 digit")
      .max(13, "No telp maksimal 13 digit"),
    email: string()
      .required("Email harus diisi")
      .email("Format email tidak valid"),
    alamat: string().required("Alamat harus diisi"),
    kota: string().required("Kota harus diisi"),
    dokumen: string().required("Dokumen harus diunggah"),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleFileChange = (e) => {
    formDataRef.current["dokumen"] = e.target;
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

      const uploadPromises = [];

      if (dokumenVendorRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(dokumenVendorRef.current).then(
            (data) => (formDataRef.current["dokumen"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterVendor/CreateVendor",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Vendor.");
        } else {
          SweetAlert("Sukses", "Data Vendor berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    } else window.scrollTo(0, 0);
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
            Tambah Data Vendor Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="nama"
                  label="Nama Vendor"
                  isRequired
                  value={formDataRef.current.nama}
                  onChange={handleInputChange}
                  errorMessage={errors.nama}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="no_telp"
                  label="No Telepon"
                  isRequired
                  value={formDataRef.current.no_telp}
                  onChange={handleInputChange}
                  errorMessage={errors.no_telp}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="email"
                  label="Email"
                  isRequired
                  value={formDataRef.current.email}
                  onChange={handleInputChange}
                  errorMessage={errors.email}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="alamat"
                  label="Alamat"
                  isRequired
                  value={formDataRef.current.alamat}
                  onChange={handleInputChange}
                  errorMessage={errors.alamat}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="kota"
                  label="Kota"
                  isRequired
                  value={formDataRef.current.kota}
                  onChange={handleInputChange}
                  errorMessage={errors.kota}
                />
              </div>
              <div className="col-lg-4">
                <FileUpload
                  forInput="dokumen"
                  label="Dokumen Vendor"
                  isRequired
                  ref={dokumenVendorRef}
                  onChange={handleFileChange}
                  errorMessage={errors.dokumen}
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
