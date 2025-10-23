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

export default function MasterVendorDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    kodeVendor: "",
    namaVendor: "",
    noTelepon: "",
    email: "",
    alamat: "",
    kota: "",
    dokumen: "",
    status: "",
    dibuatOleh: "",
    diubahOleh: "",
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await UseFetch(API_LINK + "MasterVendor/DetailVendor", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data vendor.");
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
            Detail Tempat Penyimpanan
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Label
                  forLabel="kode"
                  title="Kode Vendor"
                  data={formData.kodeVendor}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="nama"
                  title="Nama Vendor"
                  data={formData.namaVendor}
                />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="noTelepon"
                  title="No Telepon"
                  data={formData.noTelepon}
                />
              </div>
              <div className="col-lg-4">
                <Label forLabel="email" title="Email" data={formData.email} />
              </div>
              <div className="col-lg-4">
                <Label
                  forLabel="alamat"
                  title="Alamat"
                  data={formData.alamat}
                />
              </div>
              <div className="col-lg-4">
                <Label forLabel="kota" title="Kota" data={formData.kota} />
              </div>
              <div className="col-lg-4">
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
