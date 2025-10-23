import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function TransaksiPenempatanDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  
  const formDataRef = useRef({
    noKomponen: "",
    idRuangan: "",
    tanggalPenempatan: "",
    jenisPenempatan: "",
    namaRuangan: "",
    lantai: "",
    namaGedung: "",
    dibuatOleh: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          API_LINK + "TrsPenempatan/DetailPenempatan",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data penempatan.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

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
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Data Penempatan
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-4">
              <Label
                forLabel="noKomponen"
                title="No Komponen"
                data={formDataRef.current.idKomponen}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="namaRuangan"
                title="Nama Ruangan"
                data={formDataRef.current.namaRuangan}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="lantai"
                title="Lantai"
                data={formDataRef.current.lantai}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="tanggalPenempatan"
                title="Tanggal Penempatan"
                data={formDataRef.current.tanggalPenempatan}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="jenisPenempatan"
                title="Jenis Penempatan"
                data={formDataRef.current.jenisPenempatan}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="dibuatOleh"
                title="Dibuat Oleh"
                data={formDataRef.current.dibuatOleh}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
