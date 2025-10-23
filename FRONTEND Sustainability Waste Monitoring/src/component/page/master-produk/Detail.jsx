import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Card from "../../part/Card";
import ImagePreview from "../../part/ImagePreview";
import TableInput from "../../part/TableInput";

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function MasterProdukDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sampah, setSampah] = useState([]);
  const [formData, setFormData] = useState({
    kode: "",
    namaProduk: "",
    produksiAwal: "",
    produksiAkhir: "",
    totalProduksi: "",
    hargaSatuan: "",
    gambarProduk: "",
    dibuatOleh: "",
    diubahOleh: "",
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await UseFetch(API_LINK + "MasterProduk/DetailProduk", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data gudang.");
        } else {
          setFormData({
            ...data[0],
            hargaSatuan:
              data[0].hargaSatuan != null
                ? "Rp " + formatNumber(data[0].hargaSatuan)
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
            Detail Produk
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Label
                  forLabel="kode"
                  title="Kode Produk"
                  data={formData.kode}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="namaProduk"
                  title="Nama Produk"
                  data={formData.namaProduk}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="produksiAwal"
                  title="Produksi Awal"
                  data={formData.produksiAwal}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="produksiAkhir"
                  title="Produksi Akhir"
                  data={formData.produksiAkhir}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="Total Produk"
                  title="totalProduksi"
                  data={formData.totalProduksi}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="hargaSatuan"
                  title="Harga Satuan"
                  data={formData.hargaSatuan}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="dibuatOleh"
                  title="Dibuat Oleh"
                  data={formData.dibuatOleh}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="diubahOleh"
                  title="Diubah Oleh"
                  data={formData.diubahOleh}
                />
              </div>
              <div className="col-lg-3">
                <Label forLabel="gambarProduk" title="Gambar Produk" />
                {(previewImage || formData.gambarProduk) && (
                  <ImagePreview
                    src={
                      previewImage
                        ? previewImage
                        : FILE_LINK + formData.gambarProduk
                    }
                  />
                )}
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
