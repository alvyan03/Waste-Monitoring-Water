import { useRef, useState, useEffect } from "react";
import { object, string, number } from "yup";
import { API_LINK } from "../../util/Constants";
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
import ImagePreview from "../../part/ImagePreview";
import TableInput from "../../part/TableInput";
import Autocomplete from "../../part/Autocomplete";
import Icon from "../../part/Icon";
import DropDown from "../../part/Dropdown";

const inisialisasiDataSampah = [
  {
    Key: null,
    No: 1,
    "Kode Sampah": null,
    "Nama Sampah": null,
    "Quantity Masuk": null,
    "Quantity Keluar": null,
    Aksi: null,
    Count: 0,
  },
];

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function MasterProdukAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [formattedHarga, setFormattedHarga] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [dataSampah, setDataSampah] = useState(inisialisasiDataSampah);
  const [listSampah, setListSampah] = useState([]);
  const [listKode, setListKode] = useState("");
  const [jenisSampah, setJenisSampah] = useState("");
  const [listJenisSampah, setListJenisSampah] = useState({});

  const formDataRef = useRef({
    nama: "",
    hargaSatuan: "",
    gambar: "",
  });

  const gambarProdukRef = useRef(null);

  const userSchema = object({
    nama: string().required("Nama produk harus diisi").max(255),
    hargaSatuan: number()
      .required("Harga satuan harus diisi")
      .typeError("Harga satuan harus berupa angka"),
    gambar: string(),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "hargaSatuan") {
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
            (data) => (formDataRef.current["gambar"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterProduk/CreateProduk",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data produk.");
        } else {
          SweetAlert("Sukses", "Data Produk berhasil disimpan", "success");
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
            Tambah Data Produk Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="nama"
                  label="Nama Produk"
                  isRequired
                  value={formDataRef.current.nama}
                  onChange={handleInputChange}
                  errorMessage={errors.nama}
                />
              </div>
              <div className="col-lg-6">
                <ImagePreview src={previewImage} />
                <FileUpload
                  forInput="gambar"
                  label="Gambar Produk (.jpg, .jpeg, .png)"
                  formatFile=".jpg,.jpeg,.png"
                  ref={gambarProdukRef}
                  onChange={() =>
                    handleFileChange(gambarProdukRef, "jpg,jpeg,png")
                  }
                  errorMessage={errors.gambar}
                />
              </div>
            </div>
            <div className="row">
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
