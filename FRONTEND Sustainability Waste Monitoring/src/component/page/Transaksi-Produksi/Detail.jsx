import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Card from "../../part/Card";
import TableInput from "../../part/TableInput";

export default function TransaksiProduksiDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [sampah, setSampah] = useState([]);
  const [idProduksi, setIdProduksi] = useState("");
  const [formData, setFormData] = useState({
    idDetailProduksi: "",
    idProduksi: "",
    kode: "",
    kodeProduk: "",
    namaProduk: "",
    jumlahProduk: "",
    dokumen: "",
    deskripsi: "",
    tanggalProduksi: "",
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

  useEffect(() => {
    if (formData.idProduksi) {
      setIdProduksi(formData.idProduksi);
    }
  }, [formData.idProduksi]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("ID yang dikirim ke API:", idProduksi);

        const data = await UseFetch(
          API_LINK + "TransaksiProduksi/detailSampahProduksi",
          { id: idProduksi }
        );

        console.log("Respon API detailSampah:", data);

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

    if (idProduksi) {
      fetchData();
    }
  }, [idProduksi]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiProduksi/detailProduksi",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data pembuangan sampah."
          );
        } else {
          setFormData(data[0]);
          setIdProduksi(data[0].idProduksi);
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
            Detail Produksi
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Label forLabel="kode" title="Kode" data={formData.kode} />
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
                  forLabel="kodeProduk"
                  title="Kode Produk"
                  data={formData.kodeProduk}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="tanggalProduksi"
                  title="Tanggal Produksi"
                  data={formData.tanggalProduksi}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="namaProduk"
                  title="Nama Produk"
                  data={formData.namaProduk}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="jenisSampah"
                  title="Jenis Sampah"
                  data={sampah[0]?.jenisSampah}
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

              {/* Baris 1: Deskripsi dan Jumlah Produk */}
              <div className="row mt-4">
                <div className="col-lg-6">
                  <Label
                    forLabel="deskripsi"
                    title="Deskripsi"
                    data={formData.deskripsi}
                  />
                </div>
                <div className="col-lg-6">
                  <Label
                    forLabel="jumlahProduk"
                    title="Jumlah Produk"
                    data={formData.jumlahProduk}
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-lg-6">
                  <div className="col-lg-6"></div>
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
                          rel="noreferrer"
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
