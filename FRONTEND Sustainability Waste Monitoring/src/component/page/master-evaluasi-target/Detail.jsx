import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import { formatDateOnly } from "../../util/Formatting";

export default function MasterEvaluasiTargetDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    jumlahIndividu:"",
    targetBulananIndividu:"",
    persentaseTargetPenghematan:"",
    tanggalMulaiBerlaku:"",
  });


  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterEvaluasiTarget/DetailEvaluasiTarget",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data target.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
        }
      } catch (error) {
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
          Detail Data Evaluasi Target
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-6">
              <Label
                forLabel="jumlahIndividu"
                title="Jumlah Individu"
                data={`${formDataRef.current.jumlahIndividu} orang`}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="targetBulananIndividu"
                title="Target Bulanan Individu"
                data={`${formDataRef.current.targetBulananIndividu} m³`}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="persentaseTargetPenghematan"
                title="Persentase Target Penghematan"
                data={`${formDataRef.current.persentaseTargetPenghematan} %`}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="tanggalMulaiBerlaku"
                title="Tanggal Mulai Berlaku"
                data={formatDateOnly(formDataRef.current.tanggalMulaiBerlaku)}
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
