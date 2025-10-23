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
import axios from "axios";

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

const getTodayDateMMDDYYYY = () => {
  const today = new Date();
  const mm = (today.getMonth() + 1).toString().padStart(2, "0");
  const dd = today.getDate().toString().padStart(2, "0");
  const yyyy = today.getFullYear().toString();
  return mm + "/" + dd + "/" + yyyy;
};

export default function TransaksiPenjualanSampahAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [dataSampah, setDataSampah] = useState(inisialisasiDataSampah);
  const [listJenisSampah, setListJenisSampah] = useState({});
  const [tanggalPenjualan, setTanggalPenjualan] = useState("");
  const [tanggalInput, setTanggalInput] = useState("");
  const [listVendor, setListVendor] = useState({});
  const [listSampah, setListSampah] = useState([]);
  const [listKode, setListKode] = useState("");
  const [formattedHarga, setFormattedHarga] = useState("Rp 0");
  const [jenisSampah, setJenisSampah] = useState("");
  const [totalHargaJual, setTotalHargaJual] = useState(0);

  const formDataRef = useRef({
    kode: "",
    namaPenjualan: "",
    totalHargaJual: "",
    jenisSampah: "",
    dokumenPenjualanSampah: "",
    deskripsi: "",
    alamatVendor: "",
    vendor: "",
    tanggalPenjualan: "",
    tanggalInput: "",
  });

  const createDataRef = () => {
    const totalHargaJual = dataSampah.reduce((acc, row) => {
      const qty = parseFloat(row["Quantity Keluar"] ?? 0);
      const harga = parseFloat(row["Harga Satuan"] ?? 0);
      return acc + (isNaN(qty) || isNaN(harga) ? 0 : qty * harga);
    }, 0);

    const data = {
      kode: formDataRef.current.kode,
      idVendor: formDataRef.current.vendor,
      namaPenjualan: formDataRef.current.namaPenjualan,
      totalHargaJual: totalHargaJual,
      dokumen: formDataRef.current.dokumenPenjualanSampah,
      deskripsi: formDataRef.current.deskripsi,
      tanggalPenjualan: formDataRef.current.tanggalPenjualan,
      tanggalInput: formDataRef.current.tanggalInput,
    };

    return data;
  };

  const dokumenPenjualanSampahRef = useRef(null);
  const tanggalPenjualanRef = useRef(null);

  const userSchema = object({
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    if (name === "jenisSampah") {
      formDataRef.current.jenisSampah = value;
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

  const handleInputTableChange = (rowIndex, key, value) => {
    const updated = [...dataSampah];
    updated[rowIndex][key] = value;

    if (key === "Quantity Keluar") {
      const quantityMasuk =
        parseFloat(updated[rowIndex]["Quantity Masuk"]) || 0;
      const quantityKeluar = parseFloat(value) || 0;

      if (quantityMasuk === 0 && quantityKeluar === 0) {
        SweetAlert(
          "Warning",
          "Quantity masuk dan keluar tidak boleh sama-sama nol.",
          "warning"
        );
        updated[rowIndex]["Quantity Keluar"] = "";
      } else if (quantityKeluar > quantityMasuk) {
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

  const generateKode = async () => {
    try {
      const data = await UseFetch(
        API_LINK + "TransaksiPenjualanSampah/getKodePenjualanSampah",
        {}
      );

      const lastKode =
        Array.isArray(data) && data.length > 0 ? data[0].Kode : null;

      if (!lastKode) {
        formDataRef.current.kode = "001/PJS/2025";
        setListKode("001/PJS/2025");
        return;
      }

      const kodeNumber = parseInt(lastKode.split("/")[0], 10);
      const nextKodeNumber = (kodeNumber + 1).toString().padStart(3, "0");
      const currentYear = new Date().getFullYear();
      const newKode = `${nextKodeNumber}/PJS/${currentYear}`;

      formDataRef.current.kode = newKode;
      setListKode(newKode);
    } catch (error) {
      console.error("Gagal generate kode:", error);
      formDataRef.current.kode = "001/PJS/2025";
      setListKode("001/PJS/2025");
    }
  };

  useEffect(() => {
    generateKode();
  }, []);
  useEffect(() => {
    formDataRef.current.tanggalPenjualan = tanggalPenjualan;
  }, [tanggalPenjualan]);

  useEffect(() => {
    const today = getTodayDateMMDDYYYY();
    setTanggalInput(today);
    formDataRef.current.tanggalInput = today;
  }, []);

  const fetchDataSampahFormatted = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const apiData = await UseFetch(
        API_LINK + "TransaksiPenjualanSampah/GetListDataSampah",
        {}
      );

      if (apiData === "ERROR") {
        throw new Error("Gagal mengambil data sampah");
      } else {
        const formattedData = apiData.map((item, index) => ({
          Key: item.Value,
          No: index + 1,
          "Kode Sampah": item.kode,
          "Nama Sampah": item.namaSampah,
          "Quantity Masuk": item.qtyMasuk,
          "Quantity Keluar": "",
          "Harga Satuan": item.hargaSatuan,
          "Total Harga": item.totalHarga,
          Count: index + 1,
          Alignment: [
            "center",
            "center",
            "left",
            "center",
            "center",
            "center",
            "center",
            "center",
            "center",
          ],
        }));

        setDataSampah(formattedData);
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setDataSampah([]);
    }
  };

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "TransaksiPenjualanSampah/GetListDataVendor",
      {},
      setListVendor,
      "Terjadi kesalahan: Gagal mengambil vendor."
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

  useEffect(() => {
    if (jenisSampah) {
      fetchDataByEndpointAndParams(
        API_LINK + "TransaksiPenjualanSampah/GetListDataSampah",
        { p1: jenisSampah },
        setListSampah,
        "Terjadi kesalahan: Gagal mengambil daftar sampah."
      );
    } else {
      setListSampah([]);
    }
  }, [jenisSampah]);

  useEffect(() => {
    const total = dataSampah.reduce((acc, row) => {
      const qty = parseFloat(row["Quantity Keluar"] ?? 0);
      const harga = parseFloat(row["Harga Satuan"] ?? 0);
      return acc + (isNaN(qty) || isNaN(harga) ? 0 : qty * harga);
    }, 0);

    setFormattedHarga(formatNumber(total)); // hanya untuk tampilan
    setTotalHargaJual(total); // nilai asli untuk dikirim ke backend
  }, [dataSampah]);

  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    setTanggalInput(getToday());
    setTanggalPenjualan(getToday());
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
        console.log("📋 dataSampah sebelum createDataRef:", dataSampah);

        console.log("Data dikirim ke API (CreatePenjualanSampah):", dataToSend);

        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanSampah/CreatePenjualanSampah",
          dataToSend
        );

        console.log("📦 Response dari CreatePenjualanSampah:", data);

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data penjualan sampah."
          );
        } else {
          console.log("Data jalan:");
          const currentID = data[0]?.hasil;
          console.log("Maju ", currentID);
          if (currentID) {
            const detailPromises = dataSampah.map((item) => {
              const detailToSend = {
                idPenjualan: currentID,
                idSampah: item.Key,
                qtyKeluar: item["Quantity Keluar"],
                hargaSatuan: item["Harga Satuan"],
                totalHarga: item["Total Harga"],
              };
              console.log(
                "Detail dikirim ke API (detailPenjualanSampah):",
                detailToSend
              );
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
            Tambah Data Penjualan Sampah Baru
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
                  readOnly
                  value={formDataRef.current.kode}
                  onChange={handleInputChange}
                  errorMessage={errors.kode}
                />
              </div>
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
                  type="text"
                  forInput="tanggalInput"
                  name="tanggalInput"
                  label="Tanggal Input"
                  disabled
                  value={formDataRef.current.tanggalInput}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalInput}
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
              </div>
              <div className="col-lg-6">
                <Input
                  ref={tanggalPenjualanRef}
                  forInput="tanggalPenjualan"
                  label="Tanggal Penjualan"
                  type="date"
                  isRequired
                  value={tanggalPenjualan}
                  onChange={(e) => {
                    setTanggalPenjualan(e.target.value);
                  }}
                />
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
                              value={value ?? ""}
                              style={inputStyle}
                              readOnly
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
                        return (
                          <div className="d-flex justify-content-center">
                            <Input
                              type="text"
                              value={formatNumber(value)}
                              style={inputStyle}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                handleInputTableChange(rowIndex, key, rawValue); // simpan nilai asli (2000)
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

                    <div className="d-flex justify-content-end align-items-center mt-1 px-2">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginRight: "85px", // bisa dikurangi lagi sesuai kebutuhan
                          gap: "4px", // Jarak antara label dan input diperkecil
                        }}
                      >
                        <input
                          type="text"
                          id="totalHarga"
                          value={formattedHarga}
                          readOnly
                          className="form-control"
                          style={{ width: "150px", height: "36px" }} // ukuran input bisa disesuaikan
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Baris 1: Vendor & Alamat Vendor */}
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
                    name="dokumenPenjualanSampah"
                    label="Dokumen Penjualan Sampah"
                    formatFile=".jpg,.jpeg,.png,.pdf,.zip"
                    isRequired
                    ref={dokumenPenjualanSampahRef}
                    onChange={() =>
                      handleFileChange(
                        dokumenPenjualanSampahRef,
                        "jpg,jpeg,png,pdf,zip"
                      )
                    }
                    errorMessage={errors.dokumenPenjualanSampah}
                  />
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
