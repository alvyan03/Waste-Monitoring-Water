import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { formatToRupiah } from "../../util/FormatRupiah";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import DropDown from "../../part/Dropdown";
import ImagePreview from "../../part/ImagePreview";
import TableInput from "../../part/TableInput";
import Autocomplete from "../../part/Autocomplete";
import Icon from "../../part/Icon";

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function MasterProdukEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [formattedHarga, setFormattedHarga] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const formDataRef = useRef({
    idProduk: "",
    namaProduk: "",
    hargaProduk: "",
    gambarProduk: "",
  });

  const userSchema = object({
    idProduk: string(),
    namaProduk: string().required("Nama produk harus diisi").max(255),
    hargaProduk: number()
      .required("Harga satuan harus diisi")
      .typeError("Harga satuan harus berupa angka"),
    gambarProduk: string(),
  });

  const gambarProdukRef = useRef(null);

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") {
        throw new Error(errorMessage);
      } else {
        setter(data);
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setter({});
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterProduk/GetDataProdukById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Produk.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          setFormattedHarga(formatNumber(data[0].hargaProduk));
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

    if (name === "hargaProduk") {
      const numericValue = value.replace(/\D/g, "");
      const formatted = formatNumber(numericValue);

      formDataRef.current[name] = numericValue;
      setFormattedHarga(formatted);

      const validationError = validateInput(name, numericValue, userSchema);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [validationError.name]: validationError.error,
      }));
    } else {
      formDataRef.current[name] = value;

      const validationError = validateInput(name, value, userSchema);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [validationError.name]: validationError.error,
      }));
    }
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

      if (gambarProdukRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(gambarProdukRef.current).then(
            (data) => (formDataRef.current["gambarProduk"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterProduk/EditProduk",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data produk.");
        } else {
          SweetAlert("Sukses", "Data produk berhasil disimpan", "success");
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
      {isError.error && <Alert type="danger" message={isError.message} />}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Ubah Data Produk
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="namaProduk"
                  label="Nama Produk"
                  isRequired
                  value={formDataRef.current.namaProduk}
                  onChange={handleInputChange}
                  errorMessage={errors.namaProduk}
                />
              </div>
              <div className="col-lg-6">
                <label htmlFor="hargaSatuan" className="form-label fw-bold">
                  Harga Satuan <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">Rp</span>
                  <input
                    type="text"
                    id="hargaSatuan"
                    name="hargaSatuan"
                    className={`form-control ${
                      errors.hargaSatuan ? "is-invalid" : ""
                    }`}
                    value={formattedHarga}
                    onChange={handleInputChange}
                  />
                  {errors.hargaSatuan && (
                    <div className="invalid-feedback">{errors.hargaSatuan}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              {(previewImage || formDataRef.current.gambarProduk) && (
                <ImagePreview
                  src={
                    previewImage
                      ? previewImage
                      : FILE_LINK + formDataRef.current.gambarProduk
                  }
                />
              )}
              <FileUpload
                forInput="gambarProduk"
                label="Gambar Produk"
                formatFile=".jpg,.jpeg,.png"
                isRequired
                ref={gambarProdukRef}
                onChange={() =>
                  handleFileChange(gambarProdukRef, "jpg,jpeg,png")
                }
                errorMessage={errors.gambarProduk}
                hasExisting={formDataRef.current.gambarProduk}
              />
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
