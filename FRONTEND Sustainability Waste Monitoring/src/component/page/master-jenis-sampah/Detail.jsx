import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Card from "../../part/Card";

export default function MasterJenisSampahDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    kode: "",
    jenisSampah: "",
    dibuatOleh: "",
    diubahOleh: "",
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await UseFetch(
          API_LINK + "MasterJenisSampah/DetailJenisSampah",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data jenis sampah."
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
            Detail Gudang
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Label
                  forLabel="kode"
                  title="Kode Jenis Sampah"
                  data={formData.kode}
                />
              </div>
              <div className="col-lg-6">
                <Label
                  forLabel="jenisSampah"
                  title="Jenis Sampah"
                  data={formData.jenisSampah}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-lg-6">
                <Label
                  forLabel="dibuatOleh"
                  title="Dibuat Oleh"
                  data={formData.dibuatOleh}
                />
              </div>
              <div className="col-lg-6">
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
