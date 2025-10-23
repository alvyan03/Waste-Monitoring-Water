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

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function TransaksiPembuanganSampahDetail({
  onChangePage,
  withID,
}) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [sampah, setSampah] = useState([]);
  const [formData, setFormData] = useState({
    kode: "",
    idPembuangan: "",
    dokumen: "",
    vendor: "",
    deskripsi: "",
    tanggalPembuangan: "",
    tanggalInput: "",
    totalBiaya: "",
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
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "TransaksiPembuanganSampah/detailSampahPembuangan",
          { id: withID }
        );

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
          API_LINK + "TransaksiPembuanganSampah/detailPembuanganSampah",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data pembuangan sampah."
          );
        } else {
          setFormData({
            ...data[0],
            totalBiaya:
              data[0].totalBiaya != null
                ? "Rp " + formatNumber(data[0].totalBiaya)
                : "",
          });
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
    "Biaya Buang": item.biaya,
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
            Detail Pembuangan Sampah
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
                  forLabel="jenisSampah"
                  title="Jenis Sampah"
                  data={sampah[0]?.jenisSampah}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="tanggalPembuangan"
                  title="Tanggal Pembuangan"
                  data={formData.tanggalPembuangan}
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
              <div className="row">
                <div className="col-lg-6 offset-lg-6 mt-3">
                  <Label
                    forLabel="totalBiaya"
                    title="Total Biaya"
                    data={formData.totalBiaya}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-lg-6 mt-3">
                  <Label
                    forLabel="vendor"
                    title="Vendor"
                    data={formData.vendor}
                  />
                </div>
                <div className="col-lg-6 mt-3">
                  <Label
                    forLabel="alamatVendor"
                    title="Alamat Vendor"
                    data={formData.alamatVendor}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-lg-6 mt-3">
                  <Label
                    forLabel="deskripsi"
                    title="Deskripsi"
                    data={formData.deskripsi}
                  />
                </div>
                <div className="col-lg-6 mt-3">
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
