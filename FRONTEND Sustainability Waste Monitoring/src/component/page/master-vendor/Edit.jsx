import { useEffect, useRef, useState } from "react";
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

export default function MasterVendorEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    idVendor: "",
    nama: "",
    no_telp: "",
    email: "",
    alamat: "",
    kota: "",
    dokumen: "",
  });

  const userSchema = object({
    nama: string().required("Nama vendor harus diisi").max(255),
    no_telp: string().required("Nomor telepon harus diisi").max(13),
    email: string().required("Email harus diisi").email("Format email tidak valid"),
    alamat: string().required("Alamat harus diisi"),
    kota: string().required("Kota harus diisi"),
    dokumen: string().notRequired(),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(API_LINK + "MasterVendor/GetDataVendorById", { id: withID });
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data vendor.");
        }

        const vendor = data[0];
        formDataRef.current = {
          idVendor: vendor.Key,
          nama: vendor["Nama Vendor"],
          no_telp: vendor["No Telepon"],
          email: vendor["Email"],
          alamat: vendor["Alamat"],
          kota: vendor["Kota"],
          dokumen: vendor["Dokumen"] || "",
        };
      } catch (err) {
        setIsError({ error: true, message: err.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;

    const validationError = validateInput(name, value, userSchema);
    setErrors((prev) => ({
      ...prev,
      [validationError.name]: validationError.error,
    }));
  };

  const handleFileChange = (e) => {
    formDataRef.current.dokumen = e.target.files[0];
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    const inputToValidate = { ...formDataRef.current };
    delete inputToValidate.idVendor;

    const validationErrors = await validateAllInputs(inputToValidate, userSchema, setErrors);

    if (Object.values(validationErrors).every((err) => !err)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        let dokumenPath = formDataRef.current.dokumen;
        if (dokumenPath instanceof File) {
          dokumenPath = await UploadFile({ files: [dokumenPath] });
          if (!dokumenPath || dokumenPath === "ERROR") {
            throw new Error("Gagal mengunggah dokumen.");
          }
        }

        const payload = {
          p1: formDataRef.current.idVendor,
          p2: formDataRef.current.nama,
          p3: formDataRef.current.no_telp,
          p4: formDataRef.current.email,
          p5: formDataRef.current.alamat,
          p6: formDataRef.current.kota,
          p7: dokumenPath || formDataRef.current.dokumen,
          p8: "admin",
        };

        const data = await UseFetch(API_LINK + "MasterVendor/EditVendor", payload);

        if (data === "ERROR") {
          throw new Error("Gagal memperbarui data vendor.");
        }

        SweetAlert("Sukses", "Data vendor berhasil diperbarui", "success");
        onChangePage("index");
      } catch (err) {
        setIsError({ error: true, message: err.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}
      <form onSubmit={handleEdit}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">Ubah Data Vendor</div>
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
                  label="Nomor Telepon"
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
                  label="Dokumen"
                  onChange={handleFileChange}
                  errorMessage={errors.dokumen}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button classType="secondary me-2 px-4 py-2" label="BATAL" onClick={() => onChangePage("index")} />
          <Button classType="primary ms-2 px-4 py-2" type="submit" label="SIMPAN" />
        </div>
      </form>
    </>
  );
}
