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
    "Biaya Buang": null,
    Aksi: null,
    Count: 0,
  },
];

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function TransaksiPembuanganSampahEdit({
  onChangePage,
  withID,
}) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listJenisSampah, setListJenisSampah] = useState({});
  const [listVendor, setListVendor] = useState({});
  const [dokumen, setDokumen] = useState("");
  const [tanggalInput, setTanggalInput] = useState("");
  const [dataSampah, setDataSampah] = useState(inisialisasiDataSampah);
  const [listSampah, setListSampah] = useState([]);
  const [jenisSampah, setJenisSampah] = useState("");

  const formDataRef = useRef({
    idPembuangan: "",
    kode: "",
    jenisSampah: "",
    namaPembuangan: "",
    dokumenPembuanganSampah: "",
    deskripsi: "",
    alamatVendor: "",
    vendor: "",
    tanggalPembuangan: "",
    tanggalInput: "",
    totalBiaya: "",
  });

  const createDataRef = () => {
    const data = {
      idPembuangan: formDataRef.current.idPembuangan,
      idVendor: formDataRef.current.vendor,
      namaPembuangan: formDataRef.current.namaPembuangan,
      dokumenPembuanganSampah: formDataRef.current.dokumenPembuanganSampah,
      deskripsi: formDataRef.current.deskripsi,
      tanggalPembuangan: formDataRef.current.tanggalPembuangan,
      totalBiaya: Number(
        formDataRef.current.totalBiaya.toString().replace(/\./g, "")
      ),
    };
    return data;
  };

  const fileDokumenPembuanganRef = useRef(null);

  const userSchema = object({
    idPembuangan: string(),
    kode: string(),
    dokumenPembuanganSampah: string(),
    namaPembuangan: string()
      .max(100, "maksimum 255 karakter")
      .required("harus diisi"),
    jenisSampah: string().required("harus dipilih"),
    vendor: string().required("harus dipilih"),
    deskripsi: string()
      .max(100, "maksimum 200 karakter")
      .required("harus diisi"),
    alamatVendor: string(),
    tanggalPembuangan: string().required("Tanggal Pembuangan harus diisi"),
    tanggalInput: string(),
    totalBiaya: string(),
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
      API_LINK + "TransaksiPembuanganSampah/GetListDataVendor",
      {},
      setListVendor,
      "Terjadi kesalahan: Gagal mengambil vendor."
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPembuanganSampah/detailSampahPembuangan",
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
            "Biaya Buang": item.biaya,
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
          "Biaya Buang": "",
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
          "Biaya Buang": null,
          Aksi: null,
          Count: 1,
        },
      ]);
    }
    console.log("Trigger useEffect jenisSampah:", jenisSampah);
    console.log("DataSampah sebelum reset:", dataSampah);
  }, [jenisSampah]);

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPembuanganSampah/GetDataPembuangansampahById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data pembuangan sampah."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          setDokumen(data[0].dokumenPembuanganSampah);
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

    if (key === "Biaya Buang") {
      const rawValue = value || 0;
      updated[rowIndex]["Biaya Buang"] = rawValue;

      const total = updated.reduce((acc, row) => {
        const angka = parseInt(
          (row["Biaya Buang"] ?? "0").replace(/\./g, ""),
          10
        );
        return acc + (isNaN(angka) ? 0 : angka);
      }, 0);

      formDataRef.current.totalBiaya = total.toLocaleString("id-ID");
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
      "Biaya Buang": null,
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

      if (fileDokumenPembuanganRef.current.files.length > 0) {
        uploadPromises.push(
          UploadFile(fileDokumenPembuanganRef.current).then(
            (data) =>
              (formDataRef.current["dokumenPembuanganSampah"] = data.Hasil)
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
          API_LINK + "TransaksiPembuanganSampah/EditPembuanganSampah",
          dataToSend
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data pembuangan sampah."
          );
        } else {
          const currentID = data[0]?.hasil;

          if (currentID) {
            const detailPromises = dataSampah.map((item) => {
              const detailToSend = {
                idPembuangan: currentID,
                idSampah: item.Key,
                qtyKeluar: item["Quantity Keluar"],
                biayaBuang: item["Biaya Buang"],
              };

              return UseFetch(
                API_LINK +
                  "TransaksiPembuanganSampah/createDetailPembuanganSampah",
                detailToSend
              );
            });

            await Promise.all(detailPromises);

            SweetAlert(
              "Sukses",
              "Data Pembuangan Sampah berhasil disimpan",
              "success"
            );
            onChangePage("index");
          } else {
            throw new Error("ID Pembuangan tidak ditemukan.");
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
            Ubah Data Pembuangan Sampah
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
                <Input
                  type="text"
                  forInput="namaPembuangan"
                  label="Nama Pembuangan"
                  isRequired
                  value={formDataRef.current.namaPembuangan}
                  onChange={handleInputChange}
                  errorMessage={errors.namaPembuangan}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="date"
                  forInput="tanggalPembuangan"
                  label="Tanggal Pembuangan"
                  isRequired
                  value={formDataRef.current.tanggalPembuangan}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalPembuangan}
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
                    "Biaya Buang",
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

                    if (key === "Biaya Buang") {
                      const rawValue =
                        dataSampah[rowIndex]["Biaya Buang"] || "";

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
                                  (row["Biaya Buang"] ?? "0").replace(
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
                  type="text"
                  forInput="totalBiaya"
                  name="totalBiaya"
                  label="Total Biaya"
                  readOnly
                  disabled
                  value={formDataRef.current.totalBiaya}
                  onChange={handleInputChange}
                  errorMessage={errors.totalBiaya}
                />
              </div>
            </div>

            <div className="row mt-3">
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
                  disabled
                  value={formDataRef.current.alamatVendor}
                  onChange={handleInputChange}
                  errorMessage={errors.alamatVendor}
                />
              </div>
            </div>

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
                  forInput="dokumenPembuanganSampah"
                  label="Dokumen"
                  formatFile=".pdf"
                  hasExisting={dokumen}
                  ref={fileDokumenPembuanganRef}
                  onChange={() =>
                    handleFileChange(fileDokumenPembuanganRef, "pdf,zip")
                  }
                  errorMessage={errors.dokumenPembuanganSampah}
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
