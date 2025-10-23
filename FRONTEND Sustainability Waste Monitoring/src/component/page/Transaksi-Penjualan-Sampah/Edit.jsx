import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import ImagePreview from "../../part/ImagePreview";
import TableInput from "../../part/TableInput";
import Autocomplete from "../../part/Autocomplete";
import Icon from "../../part/Icon";

const inisialisasiDataSampah = [
  {
    Key: null,
    No: 1,
    "Kode Sampah": null,
    "Nama Sampah": null,
    "Quantity Masuk": null,
    "Quantity Keluar": null,
    "Harga Satuan": null,
    "Total Harga": null,
    Aksi: null,
    Count: 0,
  },
];

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function TransaksiPenjualanSampahEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [dataSampah, setDataSampah] = useState(inisialisasiDataSampah);
  const [listJenisSampah, setListJenisSampah] = useState({});
  const [dokumen, setDokumen] = useState("");
  const [listVendor, setListVendor] = useState({});
  const [listSampah, setListSampah] = useState([]);
  const [jenisSampah, setJenisSampah] = useState("");
  const [isManualJenisSampahChange, setIsManualJenisSampahChange] =
    useState(false);

  const formDataRef = useRef({
    idPenjualan: "",
    kode: "",
    jenisSampah: "",
    namaPenjualan: "",
    dokumenPenjualanSampah: "",
    deskripsi: "",
    alamatVendor: "",
    vendor: "",
    tanggalPenjualan: "",
    tanggalInput: "",
    totalHargaJual: "",
  });

  const createDataRef = () => {
    const data = {
      idPenjualan: formDataRef.current.idPenjualan,
      idVendor: formDataRef.current.vendor,
      namaPenjualan: formDataRef.current.namaPenjualan,
      dokumenPenjualanSampah: formDataRef.current.dokumenPenjualanSampah,
      deskripsi: formDataRef.current.deskripsi,
      tanggalPenjualan: formDataRef.current.tanggalPenjualan,
      totalHargaJual: Number(
        formDataRef.current.totalHargaJual.toString().replace(/\./g, "")
      ),
    };
    return data;
  };

  const dokumenPenjualanSampahRef = useRef(null);

  const userSchema = object({
    idPenjualan: string(),
    kode: string(),
    namaPenjualan: string().required("Harus diisi"),
    totalHargaJual: string(),
    dokumenPenjualanSampah: string(),
    jenisSampah: string().required("harus dipilih"),
    vendor: string().required("harus dipilih"),
    deskripsi: string()
      .max(100, "maksimum 200 karakter")
      .required("harus diisi"),
    alamatVendor: string(),
    tanggalPenjualan: string().required("Tanggal Penjualan harus diisi"),
    tanggalInput: string().required("Tanggal Input harus diisi"),
  });

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
      API_LINK + "MasterSampah/GetListDataJenisSampah",
      {},
      setListJenisSampah,
      "Terjadi kesalahan: Gagal mengambil jenis sampah."
    );
  }, []);

  useEffect(() => {
    console.log("DataSampah Terbaru:", dataSampah);
  }, [dataSampah]);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "TransaksiPenjualanSampah/GetListDataVendor",
      {},
      setListVendor,
      "Terjadi kesalahan: Gagal mengambil vendor."
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanSampah/DetailSampahPenjualan",
          { id: withID }
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data.");
        } else {
          formDataRef.current.jenisSampah = data[0]?.idJenisSampah ?? "";
          setJenisSampah(formDataRef.current.jenisSampah);
          const formattedData = data.map((item, index) => ({
            Key: item.idSampah,
            No: index + 1,
            "Kode Sampah": item.kodeSampah,
            "Nama Sampah": item.namaSampah,
            "Quantity Masuk": item.qtyMasuk,
            "Quantity Keluar": item.qtyKeluar,
            "Harga Satuan": item.hargaSatuan,
            "Total Harga": item.totalHarga,
            Aksi: "delete",
          }));

          setDataSampah(formattedData);
          console.log("SET jenisSampah:", formDataRef.current.jenisSampah);
          console.log("Detail Data Penjualan:", data[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [withID]);

  useEffect(() => {
    if (jenisSampah) {
      fetchDataByEndpointAndParams(
        API_LINK + "TransaksiPenjualanSampah/GetListDataSampah",
        { p1: jenisSampah },
        setListSampah,
        "Terjadi kesalahan: Gagal mengambil daftar sampah."
      );

      if (isManualJenisSampahChange) {
        setDataSampah([
          {
            Key: null,
            No: 1,
            "Kode Sampah": null,
            "Nama Sampah": null,
            "Quantity Masuk": null,
            "Quantity Keluar": null,
            "Harga Satuan": null,
            "Total Harga": null,
            Aksi: null,
            Count: 1,
          },
        ]);
      }

      setIsManualJenisSampahChange(false); // Reset flag
    } else {
      setListSampah([]);
      setDataSampah([
        {
          Key: null,
          No: 1,
          "Kode Sampah": null,
          "Nama Sampah": null,
          "Quantity Masuk": null,
          "Quantity Keluar": null,
          "Harga Satuan": null,
          "Total Harga": null,
          Aksi: null,
          Count: 1,
        },
      ]);
    }
  }, [jenisSampah]);

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanSampah/GetDataPenjualanSampahById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data penjualan sampah."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          setDokumen(data[0].dokumenPenjualanSampah);
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
    if (name === "jenisSampah") {
      formDataRef.current.jenisSampah = value;
      setIsManualJenisSampahChange(true); // Tambah ini
      setJenisSampah(value);
    }

    if (name === "vendor") {
      const selected = listVendor.find(
        (item) => item.Value.toString() === value
      );
      formDataRef.current.alamatVendor = selected?.Alamat ?? "";
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleInputTableChange = (rowIndex, key, value) => {
    const updated = [...dataSampah];
    updated[rowIndex][key] = value;

    if (key === "Quantity Keluar") {
      const quantityMasuk = updated[rowIndex]["Quantity Masuk"] || 0;
      const quantityKeluar = value || 0;

      if (quantityKeluar > quantityMasuk) {
        SweetAlert(
          "Warning",
          "Quantity keluar tidak boleh melebihi quantity masuk. Mohon periksa kembali jumlah yang dimasukkan.",
          "warning"
        );

        updated[rowIndex]["Quantity Keluar"] = "";
      }
    }

    setDataSampah(updated);
  };

  const handleAddRowSampah = () => {
    const nextNo = dataSampah.length + 1;
    const newRow = {
      Key: null,
      No: nextNo,
      "Kode Sampah": null,
      "Nama Sampah": null,
      "Quantity Masuk": null,
      "Quantity Keluar": null,
      "Harga Satuan": null,
      "Total Harga": null,
      Aksi: null,
      Count: nextNo,
    };
    setDataSampah((prev) => [...prev, newRow]);
  };

  const handleDeleteSampah = (rowIndex) => {
    const updated = [...dataSampah];
    updated.splice(rowIndex, 1);

    const relabeled = updated.map((item, idx) => ({
      ...item,
      No: idx + 1,
      Count: idx + 1,
    }));

    setDataSampah(relabeled);
  };

  const handleChangeKode = (rowIndex, item) => {
    const selectedKey = item.Value?.toString();

    const isDuplicate = dataSampah.some(
      (row, index) => row.Key?.toString() === selectedKey && index !== rowIndex
    );

    if (isDuplicate) {
      SweetAlert("Warning", "Data Sampah sudah ada!", "warning");

      const updated = [...dataSampah];
      updated[rowIndex]["Kode Sampah"] = "";
      updated[rowIndex]["Nama Sampah"] = "";
      updated[rowIndex]["Quantity Masuk"] = "";
      updated[rowIndex]["Key"] = null;

      setDataSampah(updated);
      return;
    }

    const updated = [...dataSampah];
    updated[rowIndex] = {
      ...updated[rowIndex],
      "Kode Sampah": item.Text ?? "",
      "Nama Sampah": item.NamaSampah ?? "",
      "Quantity Masuk": item.QuantityMasuk ?? "",
      Key: selectedKey,
    };
    setDataSampah(updated);
  };

  const handleFileChange = (ref, extAllowed) => {
    const { name } = ref.current;
    const file = ref.current.files[0];
    if (!file) return;

    const fileSize = file.size;
    if (fileSize / (1024 * 1024) > 10) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "Berkas terlalu besar",
      }));
      ref.current.value = "";
      return;
    }

    const fileExt = file.name.split(".").pop().toLowerCase();
    if (!extAllowed.split(",").includes(fileExt)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "Format berkas tidak valid",
      }));
      ref.current.value = "";
      return;
    }

    formDataRef.current[name] = file.name;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
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

      if (dokumenPenjualanSampahRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(dokumenPenjualanSampahRef.current).then(
            (data) =>
              (formDataRef.current["dokumenPenjualanSampah"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);
        const dataToSend = createDataRef();
        if (!dataSampah.some((item) => item.Key !== null)) {
          SweetAlert(
            "Data Sampah Wajib Diisi",
            "Minimal Pilih Satu Sampah",
            "warning"
          );
          return;
        }

        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanSampah/EditPenjualanSampah",
          dataToSend
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data penjualan sampah."
          );
        } else {
          const currentID = data[0]?.hasil;

          if (currentID) {
            const detailPromises = dataSampah.map((item) => {
              const detailToSend = {
                idPenjualan: currentID,
                idSampah: item.Key,
                qtyKeluar: item["Quantity Keluar"],
                hargaSatuan: item["Harga Satuan"],
                totalHarga: item["Total Harga"],
              };

              return UseFetch(
                API_LINK +
                  "TransaksiPenjualanSampah/createDetailPenjualanSampah",
                detailToSend
              );
            });

            await Promise.all(detailPromises);

            SweetAlert(
              "Sukses",
              "Data Penjualan Sampah berhasil disimpan",
              "success"
            );
            onChangePage("index");
          } else {
            throw new Error("ID Penjualan tidak ditemukan.");
          }
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
            Edit Data Penjualan Sampah Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="kode"
                  name="kode"
                  label="Kode"
                  isRequired
                  disabled
                  value={formDataRef.current.kode}
                  onChange={handleInputChange}
                  errorMessage={errors.kode}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="tanggalInput"
                  name="tanggalInput"
                  label="Tanggal Input"
                  disabled
                  value={formatDateToDDMMYYYY(formDataRef.current.tanggalInput)}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalInput}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="namaPenjualan"
                  name="namaPenjualan"
                  label="Nama Penjualan"
                  isRequired
                  value={formDataRef.current.namaPenjualan}
                  onChange={handleInputChange}
                  errorMessage={errors.namaPenjualan}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="date"
                  forInput="tanggalPenjualan"
                  label="Tanggal Penjualan"
                  isRequired
                  value={formDataRef.current.tanggalPenjualan}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalPenjualan}
                />
              </div>
            </div>

            <div className="row mt-3">
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
              </div>
            </div>

            <div className="mt-4">
              <div className="border rounded-0 shadow-sm pt-0 pb-1 px-0 bg-white">
                <TableInput
                  titleHeader="Rincian Transaksi Data Sampah"
                  data={dataSampah}
                  columns={[
                    "No",
                    "Kode Sampah",
                    "Nama Sampah",
                    "Quantity Masuk",
                    "Quantity Keluar",
                    "Harga Satuan",
                    "Total Harga",
                    "Aksi",
                  ]}
                  renderCell={(rowIndex, key, value) => {
                    const inputStyle = { width: "150px" };

                    if (key === "Kode Sampah") {
                      return (
                        <div className="d-flex justify-content-center">
                          <Autocomplete
                            key={rowIndex}
                            placeholder="Cari kode..."
                            value={value ?? ""}
                            onChange={(newValue) =>
                              handleChangeKode(rowIndex, newValue)
                            }
                            data={listSampah.map((item) => ({
                              Text: item.Text ?? "",
                              Value: item.Value?.toString() ?? "",
                              Kode: item.Kode ?? "",
                              NamaSampah: item.NamaSampah ?? "",
                              QuantityMasuk: item.QuantityMasuk ?? "",
                            }))}
                            disabled={!jenisSampah}
                            style={{ width: "150px" }}
                          />
                        </div>
                      );
                    }

                    if (key === "Nama Sampah") {
                      return (
                        <div className="d-flex justify-content-center">
                          <Input
                            type="text"
                            readOnly
                            value={value ?? ""}
                            style={inputStyle}
                            onChange={(e) =>
                              handleInputTableChange(
                                rowIndex,
                                key,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      );
                    }

                    if (key === "Quantity Masuk") {
                      return (
                        <div className="d-flex justify-content-center">
                          <Input
                            type="number"
                            readOnly
                            value={value ?? ""}
                            style={inputStyle}
                            onChange={(e) =>
                              handleInputTableChange(
                                rowIndex,
                                key,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      );
                    }

                    if (key === "Quantity Keluar") {
                      return (
                        <div className="d-flex justify-content-center">
                          <Input
                            type="number"
                            value={value ?? ""}
                            style={inputStyle}
                            onChange={(e) =>
                              handleInputTableChange(
                                rowIndex,
                                key,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      );
                    }

                    if (key === "Harga Satuan") {
                      const rawValue =
                        dataSampah[rowIndex]["Harga Satuan"] || "";

                      return (
                        <div className="d-flex justify-content-center">
                          <Input
                            type="text"
                            value={formatNumber(rawValue)}
                            style={{ width: "150px" }}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, "");

                              const updated = [...dataSampah];
                              updated[rowIndex] = {
                                ...updated[rowIndex],
                                [key]: cleaned,
                              };
                              setDataSampah(updated);

                              const total = updated.reduce((acc, row) => {
                                const angka = parseInt(
                                  (row["Harga Satuan"] ?? "0").replace(
                                    /\./g,
                                    ""
                                  ),
                                  10
                                );
                                return acc + (isNaN(angka) ? 0 : angka);
                              }, 0);
                              formDataRef.current.totalBiaya =
                                total.toLocaleString("id-ID");
                            }}
                          />
                        </div>
                      );
                    }

                    if (key === "Total Harga") {
                      const row = dataSampah[rowIndex];
                      const qty = parseFloat(row["Quantity Keluar"] ?? 0);
                      const harga = parseFloat(row["Harga Satuan"] ?? 0);
                      const total =
                        isNaN(qty) || isNaN(harga) ? 0 : qty * harga;

                      // ⬇ Simpan nilai total ke dalam data
                      if (dataSampah[rowIndex]) {
                        dataSampah[rowIndex]["Total Harga"] = total;
                      }

                      return (
                        <div className="d-flex justify-content-center">
                          <Input
                            type="text"
                            value={formatNumber(total)}
                            style={inputStyle}
                            disabled
                          />
                        </div>
                      );
                    }

                    if (key === "Aksi") {
                      return (
                        <div className="d-flex justify-content-center">
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDeleteSampah(rowIndex)}
                          >
                            <Icon name="trash" cssClass="text-danger fs-5" />
                          </div>
                        </div>
                      );
                    }

                    return value;
                  }}
                />
                <div className="d-flex justify-content-between align-items-center mt-2 px-2">
                  <div
                    className="d-flex align-items-center fw-medium gap-2"
                    style={{ cursor: "pointer" }}
                    onClick={handleAddRowSampah}
                  >
                    <Icon name="add" cssClass="text-primary fs-4" />
                    <span style={{ color: "black" }}>
                      Tambahkan Data Sampah Baru
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <Input
                type="text"
                forInput="totalHargaJual"
                name="totalHargaJual"
                label="Total Harga Jual"
                readOnly
                disabled
                value={formDataRef.current.totalHargaJual}
                onChange={handleInputChange}
                errorMessage={errors.totalHargaJual}
              />
            </div>

            <div className="row mt-4">
              <div className="col-lg-6">
                <DropDown
                  forInput="vendor"
                  label="Vendor"
                  arrData={listVendor}
                  isRequired
                  value={formDataRef.current.vendor}
                  onChange={handleInputChange}
                  errorMessage={errors.vendor}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="textarea"
                  forInput="alamatVendor"
                  name="alamatVendor"
                  label="Alamat Vendor"
                  readOnly
                  value={formDataRef.current.alamatVendor}
                  onChange={handleInputChange}
                  errorMessage={errors.alamatVendor}
                />
              </div>
            </div>

            {/* Baris 2: Deskripsi & Dokumen */}
            <div className="row mt-3">
              <div className="col-lg-6">
                <Input
                  type="textarea"
                  forInput="deskripsi"
                  name="deskripsi"
                  label="Deskripsi"
                  isRequired
                  value={formDataRef.current.deskripsi}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsi}
                />
              </div>
              <div className="col-lg-6">
                <FileUpload
                  forInput="dokumenPenjualanSampah"
                  label="Dokumen"
                  formatFile=".pdf"
                  hasExisting={dokumen}
                  ref={dokumenPenjualanSampahRef}
                  onChange={() =>
                    handleFileChange(dokumenPenjualanSampahRef, "pdf,zip")
                  }
                  errorMessage={errors.dokumenPenjualanSampah}
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
