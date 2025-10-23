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

const inisialisasiDataProduk = [
  {
    Key: null,
    No: 1,
    "Kode Produk": null,
    "Nama Produk": null,
    Stock: null,
    Qty: null,
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

export default function TransaksiPenjualanProdukEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [dataProduk, setDataProduk] = useState(inisialisasiDataProduk);
  const [dokumen, setDokumen] = useState("");
  const [listVendor, setListVendor] = useState({});
  const [listProduk, setListProduk] = useState([]);

  const formDataRef = useRef({
    idPenjualan: "",
    kode: "",
    namaPenjualan: "",
    dokumenPenjualanProduk: "",
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
      dokumenPenjualanProduk: formDataRef.current.dokumenPenjualanProduk,
      deskripsi: formDataRef.current.deskripsi,
      tanggalPenjualan: formDataRef.current.tanggalPenjualan,
      totalHargaJual: Number(
        formDataRef.current.totalHargaJual.toString().replace(/\./g, "")
      ),
    };
    return data;
  };

  const dokumenPenjualanProdukRef = useRef(null);

  const userSchema = object({
    idPenjualan: string(),
    kode: string(),
    namaPenjualan: string().required("Harus diisi"),
    totalHargaJual: string(),
    dokumenPenjualanProduk: string(),
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
    console.log("DataProduk Terbaru:", dataProduk);
  }, [dataProduk]);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "TransaksiPenjualanProduk/GetListDataVendor",
      {},
      setListVendor,
      "Terjadi kesalahan: Gagal mengambil vendor."
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanProduk/DetailProdukPenjualan",
          { id: withID }
        );

        console.log("Raw data dari API:", data); // 👈 Tambahkan log ini

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data.");
        } else {
          const formattedData = data.map((item, index) => ({
            Key: item.idProduk,
            No: index + 1,
            "Kode Produk": item.kodeProduk,
            "Nama Produk": item.namaProduk,
            Stock: item.qtyTotal,
            Qty: item.qtyKeluar,
            "Harga Satuan": item.hargaSatuan,
            "Total Harga": item.totalHarga,
            Aksi: "delete",
          }));

          setDataProduk(formattedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [withID]);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "TransaksiPenjualanProduk/GetListDataProduk",
      {},
      setListProduk,
      "Terjadi kesalahan: Gagal mengambil produk."
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanProduk/GetDataPenjualanProdukById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data penjualan produk."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          setDokumen(data[0].dokumenPenjualanProduk);
          console.log("Isi formDataRef setelah fetch:", formDataRef.current); // 👈 Tambahkan ini
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
    const updated = [...dataProduk];
    updated[rowIndex][key] = value;

    if (key === "Qty") {
      const quantityMasuk = updated[rowIndex]["Qty"] || 0;
      const quantityKeluar = value || 0;

      if (quantityKeluar > quantityMasuk) {
        SweetAlert(
          "Warning",
          "Qty tidak boleh melebihi Stock. Mohon periksa kembali jumlah yang dimasukkan.",
          "warning"
        );

        updated[rowIndex]["Qty"] = "";
      }
    }

    setDataProduk(updated);
  };

  const handleAddRowProduk = () => {
    const nextNo = dataProduk.length + 1;
    const newRow = {
      Key: null,
      No: nextNo,
      "Kode Produk": null,
      "Nama Produk": null,
      Stock: null,
      Qty: null,
      "Harga Satuan": null,
      "Total Harga": null,
      Aksi: null,
      Count: nextNo,
    };
    setDataProduk((prev) => [...prev, newRow]);
  };

  const handleDeleteProduk = (rowIndex) => {
    const updated = [...dataProduk];
    updated.splice(rowIndex, 1);

    const relabeled = updated.map((item, idx) => ({
      ...item,
      No: idx + 1,
      Count: idx + 1,
    }));

    setDataProduk(relabeled);
  };

  const handleChangeKode = (rowIndex, item) => {
    const selectedKey = item.Value?.toString();

    const isDuplicate = dataProduk.some(
      (row, index) => row.Key?.toString() === selectedKey && index !== rowIndex
    );

    if (isDuplicate) {
      SweetAlert("Warning", "Data Produk sudah ada!", "warning");

      const updated = [...dataProduk];
      updated[rowIndex]["Kode Produk"] = "";
      updated[rowIndex]["Nama Produk"] = "";
      updated[rowIndex]["Stock"] = "";
      updated[rowIndex]["Key"] = null;
      updated[rowIndex]["Harga Satuan"] = ""; // kosongkan juga harga

      setDataProduk(updated);
      return;
    }

    const updated = [...dataProduk];
    updated[rowIndex] = {
      ...updated[rowIndex],
      "Kode Produk": item.Text ?? "",
      "Nama Produk": item.NamaProduk ?? "",
      Stock: item.QuantityTotal ?? "",
      "Harga Satuan": item.HargaSatuan ?? "", // <-- ini ditambahkan
      Key: selectedKey,
    };
    setDataProduk(updated);
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
    delete formDataRef.current.dokumenPenjualanSampah;

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
    console.log("Validation errors:", validationErrors);

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const uploadPromises = [];

      if (dokumenPenjualanProdukRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(dokumenPenjualanProdukRef.current).then(
            (data) =>
              (formDataRef.current["dokumenPenjualanProduk"] = data.Hasil)
          )
        );
      }

      try {
        await Promise.all(uploadPromises);
        const dataToSend = createDataRef();
        if (!dataProduk.some((item) => item.Key !== null)) {
          SweetAlert(
            "Data Produk Wajib Diisi",
            "Minimal Pilih Satu Produk",
            "warning"
          );
          return;
        }

        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanProduk/EditPenjualanProduk",
          dataToSend
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data penjualan produk."
          );
        } else {
          const currentID = data[0]?.hasil;

          if (currentID) {
            const detailPromises = dataProduk.map((item) => {
              const detailToSend = {
                idPenjualan: currentID,
                idProduk: item.Key,
                qtyKeluar: item["Qty"],
                hargaSatuan: item["Harga Satuan"],
                totalHarga: item["Total Harga"],
              };

              return UseFetch(
                API_LINK +
                  "TransaksiPenjualanProduk/createDetailPenjualanProduk",
                detailToSend
              );
            });

            await Promise.all(detailPromises);

            SweetAlert(
              "Sukses",
              "Data Penjualan Produk berhasil disimpan",
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
            Edit Data Penjualan Produk Baru
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

            <div className="mt-4">
              <div className="border rounded-0 shadow-sm pt-0 pb-1 px-0 bg-white">
                <TableInput
                  titleHeader="Rincian Transaksi Data Produk"
                  data={dataProduk}
                  columns={[
                    "No",
                    "Kode Produk",
                    "Nama Produk",
                    "Stock",
                    "Qty",
                    "Harga Satuan",
                    "Total Harga",
                    "Aksi",
                  ]}
                  renderCell={(rowIndex, key, value) => {
                    const inputStyle = { width: "150px" };

                    if (key === "Kode Produk") {
                      return (
                        <div className="d-flex justify-content-center">
                          <Autocomplete
                            key={rowIndex}
                            placeholder="Cari kode..."
                            value={value ?? ""}
                            onChange={(newValue) =>
                              handleChangeKode(rowIndex, newValue)
                            }
                            data={listProduk.map((item) => ({
                              Text: item.Text ?? "",
                              Value: item.Value?.toString() ?? "",
                              Kode: item.Kode ?? "",
                              NamaProduk: item.NamaProduk ?? "",
                              QuantityTotal: item.QuantityTotal ?? "",
                              HargaSatuan: item.HargaSatuan ?? "",
                            }))}
                            style={{ width: "150px" }}
                          />
                        </div>
                      );
                    }

                    if (key === "Nama Produk") {
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

                    if (key === "Stock") {
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

                    if (key === "Qty") {
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
                            type="number"
                            value={formatNumber(value ?? "")}
                            style={inputStyle}
                            readOnly
                          />
                        </div>
                      );
                    }

                    if (key === "Total Harga") {
                      const row = dataProduk[rowIndex];
                      const qty = parseFloat(row["Qty"] ?? 0);
                      const harga = parseFloat(row["Harga Satuan"] ?? 0);
                      const total =
                        isNaN(qty) || isNaN(harga) ? 0 : qty * harga;

                      if (dataProduk[rowIndex]) {
                        dataProduk[rowIndex]["Total Harga"] = total;
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
                            onClick={() => handleDeleteProduk(rowIndex)}
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
                    onClick={handleAddRowProduk}
                  >
                    <Icon name="add" cssClass="text-primary fs-4" />
                    <span style={{ color: "black" }}>
                      Tambahkan Data Produk Baru
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
                value={formatNumber(formDataRef.current.totalHargaJual)}
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
                  forInput="dokumenPenjualanProduk"
                  label="Dokumen"
                  formatFile=".pdf"
                  hasExisting={dokumen}
                  ref={dokumenPenjualanProdukRef}
                  onChange={() =>
                    handleFileChange(dokumenPenjualanProdukRef, "pdf,zip")
                  }
                  errorMessage={errors.dokumenPenjualanProduk}
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
