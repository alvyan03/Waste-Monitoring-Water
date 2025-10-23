import { useState, useEffect } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import ImagePreview from "../../part/ImagePreview";
import TableInput from "../../part/TableInput";
import Label from "../../part/Label";

export default function TransaksiPenjualanSampahDetail({
  onChangePage,
  withID,
}) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [sampah, setSampah] = useState([]);
  const [formData, setFormData] = useState({
    kode: "",
    idPenjualan: "",
    namaPenjualan: "",
    totalHargaPenjualan: "",
    dokumen: "",
    namaVendor: "",
    deskripsi: "",
    tanggalPenjualan: "",
    tanggalInput: "",
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

  console.log("withID:", withID);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanSampah/detailSampahPenjualan",
          { id: withID }
        );

        console.log("Respon API detailSampahPenjualan:", data);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil sampah.");
        } else {
          setSampah(data);
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError({
          error: true,
          message: error.message,
        });
        setSampah([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPenjualanSampah/DetailPenjualanSampah",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data Penjualan sampah."
          );
        } else {
          setFormData(data[0]);
        }
      } catch (error) {
        console.error(error.message);
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [withID]);

  const mappedSampah = sampah.map((item, index) => ({
    No: index + 1,
    "Kode Sampah": item.kodeSampah,
    "Nama Sampah": item.namaSampah,
    "Quantity Keluar": item.qtyKeluar,
    "Harga Satuan": item.hargaSatuan,
    "Total Harga": item.totalHarga,
  }));

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}

      <form>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Detail Penjualan Sampah
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Label forLabel="kode" title="Kode" data={formData.kode} />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="namaPenjualan"
                  title="Nama Penjualan"
                  data={formData.namaPenjualan}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="tanggalInput"
                  title="Tanggal Input"
                  data={formData.tanggalInput}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="jenisSampah"
                  title="Jenis Sampah"
                  data={sampah[0]?.jenisSampah}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="tanggalPenjualan"
                  title="Tanggal Penjualan"
                  data={formData.tanggalPenjualan}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="totalHargaJual"
                  title="Total Harga Jual"
                  data={formData.totalHargaJual}
                />
              </div>
              <div className="mt-4">
                <div className="border rounded-0 shadow-sm p-0 bg-white">
                  <TableInput
                    titleHeader="Rincian Transaksi Data Sampah"
                    data={mappedSampah}
                    renderCell={(rowIndex, key) => {
                      const row = mappedSampah[rowIndex];
                      return (
                        <span className="d-block text-center">
                          {row[key] ?? ""}
                        </span>
                      );
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-6 mt-3">
                <Label
                  forLabel="vendor"
                  title="Vendor"
                  data={formData.namaVendor}
                />
              </div>
              <div className="col-lg-6 mt-3">
                <Label
                  forLabel="alamatVendor"
                  title="Alamat Vendor"
                  data={formData.alamatVendor}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="deskripsi"
                  title="Deskripsi"
                  data={formData.deskripsi}
                />
              </div>
              <div className="col-lg-3">
                <Label
                  forLabel="dokumen"
                  title="Dokumen"
                  data={
                    formData.dokumen.replace("-", "") === "" ? (
                      "-"
                    ) : (
                      <a
                        href={FILE_LINK + formData.dokumen}
                        className="text-decoration-none"
                        target="_blank"
                      >
                        Unduh berkas
                      </a>
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-start my-4">
          <Button
            type="button"
            classType="secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("index")}
          />
        </div>
      </form>
    </>
  );
}
