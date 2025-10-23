import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Label from "../../part/Label";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import ImagePreview from "../../part/ImagePreview";

export default function MasterTempatPenyimpananEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const formDataRef = useRef({
    idTempatPenyimpanan: "",
    namaTempatPenyimpanan: "",
    lokasiTempatPenyimpanan: "",
    fotoTempatPenyimpanan: "",
  });

  const fotoTempatPenyimpananRef = useRef(null);

  const userSchema = object({
    idTempatPenyimpanan: string(),
    namaTempatPenyimpanan: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    lokasiTempatPenyimpanan: string()
      .max(100, "maksimum 50 karakter")
      .required("harus diisi"),
    fotoTempatPenyimpanan: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));
      console.log(
        "isi edit sebelum api TempatPenyimpanan",
        formDataRef.current
      );
      try {
        const data = await UseFetch(
          API_LINK + "MasterTempatPenyimpanan/GetDataTempatPenyimpananById",
          { id: withID }
        );

        console.log("isi edit  api TempatPenyimpanan", data);

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data Tempat Penyimpanan."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
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
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleFileChange = (ref, extAllowed) => {
    const file = ref.current.files[0];
    const fileName = file?.name || "";
    const fileSize = file?.size || 0;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = validateInput(
      ref.current.name,
      fileName,
      userSchema
    );

    let error = "";

    if (fileSize / 1024576 > 10) {
      error = "berkas terlalu besar";
    } else if (!extAllowed.split(",").includes(fileExt)) {
      error = "format berkas tidak valid (hanya jpg, jpeg, png)";
    }

    if (error) {
      ref.current.value = "";
      setPreviewImage(null);
    } else {
      setPreviewImage(URL.createObjectURL(file));
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
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

      const uploadPromises = [];

      if (fotoTempatPenyimpananRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fotoTempatPenyimpananRef.current).then(
            (data) =>
              (formDataRef.current["fotoTempatPenyimpanan"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterTempatPenyimpanan/EditTempatPenyimpanan",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data Tempat Penyimpanan."
          );
        } else {
          SweetAlert(
            "Sukses",
            "Data Tempat Penyimpanan berhasil disimpan",
            "success"
          );
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
            Ubah Data Tempat Penyimpanan
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="namaTempatPenyimpanan"
                  label="Nama Tempat Penyimpanan"
                  isRequired
                  value={formDataRef.current.namaTempatPenyimpanan}
                  onChange={handleInputChange}
                  errorMessage={errors.namaTempatPenyimpanan}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="lokasiTempatPenyimpanan"
                  label="Lokasi Tempat Penyimpanan"
                  isRequired
                  value={formDataRef.current.lokasiTempatPenyimpanan}
                  onChange={handleInputChange}
                  errorMessage={errors.lokasiTempatPenyimpanan}
                />
              </div>
              <div className="col-lg-3">
                {(previewImage ||
                  formDataRef.current.fotoTempatPenyimpanan) && (
                  <ImagePreview
                    src={
                      previewImage
                        ? previewImage
                        : FILE_LINK + formDataRef.current.fotoTempatPenyimpanan
                    }
                  />
                )}
                <FileUpload
                  forInput="fotoTempatPenyimpanan"
                  label="Foto Tempat Penyimpanan"
                  formatFile=".jpg,.jpeg,.png"
                  isRequired
                  ref={fotoTempatPenyimpananRef}
                  onChange={() =>
                    handleFileChange(fotoTempatPenyimpananRef, "jpg,jpeg,png")
                  }
                  errorMessage={errors.fotoTempatPenyimpanan}
                  hasExisting={formDataRef.current.fotoTempatPenyimpanan}
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
