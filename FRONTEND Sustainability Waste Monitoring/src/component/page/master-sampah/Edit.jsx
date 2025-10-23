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

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function MasterSampahEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [listGudang, setListGudang] = useState({});
  const [listJenisSampah, setListJenisSampah] = useState({});
  const [formattedQty, setFormattedQty] = useState("");

  const formDataRef = useRef({
    idSampah: "",
    namaTempatPenyimpanan: "",
    jenisSampah: "",
    namaSampah: "",
    qtyMasuk: "",
    satuan: "",
    fotoSampah: "",
  });

  const fotoSampahRef = useRef(null);

  const userSchema = object({
    idSampah: string(),
    namaTempatPenyimpanan: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    jenisSampah: string()
      .max(100, "maksimum 50 karakter")
      .required("harus diisi"),
    namaSampah: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    qtyMasuk: string().required("harus diisi"),
    satuan: string().required("harus dipilih"),
    fotoSampah: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterSampah/GetDataSampahById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Sampah.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          setFormattedQty(formatNumber(data[0].qtyMasuk));
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

    if (name === "qtyMasuk") {
      const numericValue = value.replace(/\D/g, "");
      const formatted = formatNumber(numericValue);

      formDataRef.current[name] = numericValue;
      setFormattedQty(formatted);

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
    fetchDataByEndpointAndParams(
      API_LINK + "MasterSampah/GetListDataTempatPenyimpanan",
      {},
      setListGudang,
      "Terjadi kesalahan: Gagal mengambil tempat penyimpanan."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "MasterSampah/GetListDataJenisSampah",
      {},
      setListJenisSampah,
      "Terjadi kesalahan: Gagal mengambil jenis sampah."
    );
  }, []);

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

      if (fotoSampahRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fotoSampahRef.current).then(
            (data) => (formDataRef.current["fotoSampah"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);
        console.log("isi edit sebelum api sampah", formDataRef.current);

        const data = await UseFetch(
          API_LINK + "MasterSampah/EditSampah",
          formDataRef.current
        );
        console.log("isi edit sampah", data);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data Sampah.");
        } else {
          SweetAlert("Sukses", "Data Sampah berhasil disimpan", "success");
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
            Ubah Data Sampah
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="namaSampah"
                  name="namaSampah"
                  label="Nama Sampah"
                  isRequired
                  value={formDataRef.current.namaSampah}
                  onChange={handleInputChange}
                  errorMessage={errors.namaSampah}
                />
                <DropDown
                  forInput="namaTempatPenyimpanan"
                  label="Nama Tempat Penyimpanan"
                  arrData={listGudang}
                  isRequired
                  value={formDataRef.current.namaTempatPenyimpanan}
                  onChange={handleInputChange}
                  errorMessage={errors.namaTempatPenyimpanan}
                />
                {(previewImage || formDataRef.current.fotoSampah) && (
                  <ImagePreview
                    src={
                      previewImage
                        ? previewImage
                        : FILE_LINK + formDataRef.current.fotoSampah
                    }
                  />
                )}
                <FileUpload
                  forInput="fotoSampah"
                  label="Foto Tempat Penyimpanan"
                  formatFile=".jpg,.jpeg,.png"
                  isRequired
                  ref={fotoSampahRef}
                  onChange={() =>
                    handleFileChange(fotoSampahRef, "jpg,jpeg,png")
                  }
                  errorMessage={errors.fotoSampah}
                  hasExisting={formDataRef.current.fotoSampah}
                />
              </div>

              <div className="col-lg-6">
                <DropDown
                  forInput="jenisSampah"
                  label="Jenis Sampah"
                  arrData={listJenisSampah}
                  isRequired
                  value={formDataRef.current.jenisSampah}
                  onChange={handleInputChange}
                  errorMessage={errors.jenisSampah}
                />
                <div className="row">
                  <div className="col-md-6">
                    <Input
                      type="text"
                      forInput="qtyMasuk"
                      name="qtyMasuk"
                      label="Quantity Masuk"
                      isRequired
                      value={formattedQty}
                      onChange={handleInputChange}
                      errorMessage={errors.qtyMasuk || errors.satuan}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="pt32">
                      <DropDown
                        forInput="satuan"
                        label="Satuan"
                        arrData={[
                          { Value: "kg", Text: "kg" },
                          { Value: "liter", Text: "liter" },
                        ]}
                        isRequired
                        value={formDataRef.current.satuan}
                        onChange={handleInputChange}
                        errorMessage={""}
                        showLabel={false}
                      />
                    </div>
                  </div>
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
