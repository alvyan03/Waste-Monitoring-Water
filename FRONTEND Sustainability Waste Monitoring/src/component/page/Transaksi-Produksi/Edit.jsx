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
    Aksi: null,
    Count: 0,
  },
];

export default function TransaksiProduksiEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listJenisSampah, setListJenisSampah] = useState({});
  const [dokumen, setDokumen] = useState("");
  const [tanggalInput, setTanggalInput] = useState("");
  const [dataSampah, setDataSampah] = useState(inisialisasiDataSampah);
  const [listSampah, setListSampah] = useState([]);
  const [jenisSampah, setJenisSampah] = useState("");
  const [listProduk, setProduk] = useState({});
  const [idProduksi, setIdProduksi] = useState("");
  const [produksiData, setProduksiData] = useState(null);

  const formDataRef = useRef({
    idProduksi: "",
    kode: "",
    jumlahProduk: "",
    tanggalProduksi: "",
    deskripsi: "",
    dokumenProduksi: "",
    tanggalInput: "",
    produk: "",
    namaProduk: "",
    jenisSampah: "",
  });

  const createDataRef = () => {
    const data = {
      idProduksi: formDataRef.current.idProduksi,
      produk: formDataRef.current.produk,
      jumlahProduk: formDataRef.current.jumlahProduk,
      tanggalProduksi: formDataRef.current.tanggalProduksi,
      deskripsi: formDataRef.current.deskripsi,
      dokumenProduksi: formDataRef.current.dokumenProduksi,
    };
    return data;
  };

  const userSchema = object({
    idProduksi: string(),
    kode: string(),
    jumlahProduk: string(),
    tanggalProduksi: string().required("Tanggal Pembuangan harus diisi"),
    deskripsi: string()
      .max(300, "maksimum 300 karakter")
      .required("harus diisi"),
    dokumenProduksi: string(),
    namaPembuangan: string()
      .max(100, "maksimum 255 karakter")
      .required("harus diisi"),
    tanggalInput: string(),
    produk: string().required("harus dipilih"),
    jenisSampah: string().required("harus dipilih"),
    namaProduk: string(),
  });

  //   const createDataRef = () => {
  //     const data = {
  //       idPembuangan: formDataRef.current.idPembuangan,
  //       namaPembuangan: formDataRef.current.namaPembuangan,
  //       dokumenPembuanganSampah: formDataRef.current.dokumenPembuanganSampah,
  //       deskripsi: formDataRef.current.deskripsi,
  //       tanggalPembuangan: formDataRef.current.tanggalPembuangan,
  //       totalBiaya: Number(
  //         formDataRef.current.totalBiaya.toString().replace(/\./g, "")
  //       ),
  //     };
  //     return data;
  //   };

  const fileDokumenProduksiRef = useRef(null);
  const tanggalProduksiRef = useRef(null);

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
      API_LINK + "TransaksiProduksi/GetListDataProduk",
      {},
      setProduk,
      "Terjadi kesalahan: Gagal mengambil produk."
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
    // console.log("DataSampah Terbaru:", dataSampah);
  }, [dataSampah]);

  useEffect(() => {
    if (formDataRef.current.idProduksi) {
      setIdProduksi(formDataRef.current.idProduksi);
    }
  }, [formDataRef.current.idProduksi]);

  useEffect(() => {
    if (produksiData) {
      const fetchDetailSampahData = async () => {
        try {
          const data = await UseFetch(
            API_LINK + "TransaksiProduksi/detailSampahProduksi",
            { id: produksiData.idProduksi }
          );

          formDataRef.current.jenisSampah = data[0]?.idJenisSampah ?? "";
          setJenisSampah(formDataRef.current.jenisSampah);
          const formattedData = data.map((item, index) => ({
            Key: item.idSampah,
            No: index + 1,
            "Kode Sampah": item.kodeSampah,
            "Nama Sampah": item.namaSampah,
            "Quantity Masuk": item.qtyMasuk,
            "Quantity Keluar": item.qtyKeluar,
            Aksi: "delete",
          }));
          setDataSampah(formattedData);
        } catch (error) {
          console.error("Error fetching detail sampah data:", error);
        }
      };

      fetchDetailSampahData();
    }
  }, [produksiData]);

  useEffect(() => {
    if (jenisSampah) {
      fetchDataByEndpointAndParams(
        API_LINK + "TransaksiPembuanganSampah/GetListDataSampah",
        { p1: jenisSampah },
        setListSampah,
        "Terjadi kesalahan: Gagal mengambil daftar sampah."
      );

      setDataSampah((prevData) =>
        prevData.map((row) => ({
          ...row,
          "Kode Sampah": "",
          "Nama Sampah": "",
          "Quantity Masuk": "",
          "Quantity Keluar": "",
          Key: null,
        }))
      );
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
          API_LINK + "TransaksiProduksi/GetDataProduksiById",
          { id: withID }
        );

        console.log("API Response:", data);

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data produksi.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          setDokumen(data[0].dokumenProduksi);
          setProduksiData(data[0]);
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
      setJenisSampah(value);
    }

    if (name === "produk") {
      const selected = listProduk.find(
        (item) => item.Value.toString() === value
      );
      formDataRef.current.namaProduk = selected?.namaProduk ?? "";
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
      "Kode Sampah": item.Kode ?? "",
      "Nama Sampah": item.NamaSampah ?? "",
      "Quantity Masuk": item.QuantityMasuk ?? "",
      Key: selectedKey,
    };
    setDataSampah(updated);
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

      if (fileDokumenProduksiRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileDokumenProduksiRef.current).then(
            (data) => (formDataRef.current["dokumenProduksi"] = data.Hasil)
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
          API_LINK + "TransaksiProduksi/editProduksi",
          dataToSend
        );
        console.log("dataToSend", dataToSend);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data produksi.");
        } else {
          const currentID = data[0]?.hasil;

          if (currentID) {
            const detailPromises = dataSampah.map((item) => {
              const detailToSend = {
                idProduksi: currentID,
                idSampah: item.Key,
                qtyKeluar: item["Quantity Keluar"],
              };

              return UseFetch(
                API_LINK + "TransaksiProduksi/createDetailProduksi",
                detailToSend
              );
            });

            await Promise.all(detailPromises);

            SweetAlert(
              "Sukses",
              "Data Produksi Sampah berhasil disimpan",
              "success"
            );
            onChangePage("index");
          } else {
            throw new Error("ID Produksi tidak ditemukan.");
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
            Ubah Data Produksi Daur Ulang
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="kode"
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
                  label="Tanggal Input"
                  isRequired
                  disabled
                  value={formDataRef.current.tanggalInput}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalInput}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-lg-6">
                <DropDown
                  forInput="produk"
                  label="Produk"
                  arrData={listProduk}
                  isRequired
                  value={formDataRef.current.produk}
                  onChange={handleInputChange}
                  errorMessage={errors.produk}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="date"
                  forInput="tanggalProduksi"
                  label="Tanggal Produksi"
                  isRequired
                  value={formDataRef.current.tanggalProduksi}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalProduksi}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="namaProduk"
                  name="namaProduk"
                  label="Nama Produk"
                  readOnly
                  disabled
                  value={formDataRef.current.namaProduk}
                  onChange={handleInputChange}
                  errorMessage={errors.namaProduk}
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
                            value={dataSampah[rowIndex]["Kode Sampah"] ?? ""}
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
                            style={{ width: "180px" }}
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
                <div className="d-flex justify-content-start mt-2">
                  <div
                    className="d-flex align-items-center fw-medium gap-2 ps-2"
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
            <div className="row mt-3">
              <div className="col-lg-6 offset-lg-6">
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
            </div>

            <div className="row mt-3">
              <div className="col-lg-6">
                <Input
                  type="number"
                  forInput="jumlahProduk"
                  name="jumlahProduk"
                  label="Jumlah Produk"
                  isRequired
                  value={formDataRef.current.jumlahProduk}
                  onChange={handleInputChange}
                  errorMessage={errors.jumlahProduk}
                />
              </div>
              <div className="col-lg-6">
                <FileUpload
                  name="dokumenProduksi"
                  label="Dokumen Produksi (PDF)"
                  formatFile=".pdf"
                  hasExisting={dokumen}
                  ref={fileDokumenProduksiRef}
                  onChange={() =>
                    handleFileChange(fileDokumenProduksiRef, "jpg,png,pdf,zip")
                  }
                  errorMessage={errors.dokumenProduksi}
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
