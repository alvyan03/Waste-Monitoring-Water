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

const formatNumber = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function MasterSampahDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    kode: "",
    namaGudang: "",
    jenisSampah: "",
    namaSampah: "",
    beratMasuk: "",
    beratKeluar: "",
    foto: "",
    satuan: "",
    dibuatOleh: "",
    diubahOleh: "",
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await UseFetch(API_LINK + "MasterSampah/DetailSampah", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data gudang.");
        } else {
          setFormData({
            ...data[0],
            beratMasuk: formatNumber(data[0].beratMasuk),
            beratKeluar: formatNumber(data[0].beratKeluar),
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
            Detail Sampah
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Label
                  forLabel="kode"
                  title="Kode Sampah"
                  data={formData.kode}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="namaSampah"
                  title="Nama Sampah"
                  data={formData.namaSampah}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="jenisSampah"
                  title="Nama Jenis Sampah"
                  data={formData.jenisSampah}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="nama"
                  title="Nama Tempat Penyimpanan"
                  data={formData.namaGudang}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="beratMasuk"
                  title="Qty Masuk"
                  data={formData.beratMasuk}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="beratKeluar"
                  title="Qty Keluar"
                  data={formData.beratKeluar}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="satuan"
                  title="Satuan"
                  data={formData.satuan}
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
                <Label forLabel="foto" title="Foto Sampah" />
                {(previewImage || formData.foto) && (
                  <ImagePreview
                    src={
                      previewImage ? previewImage : FILE_LINK + formData.foto
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
