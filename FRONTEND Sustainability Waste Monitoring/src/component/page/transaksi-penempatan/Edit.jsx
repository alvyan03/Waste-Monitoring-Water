import { useEffect, useState, useRef } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function TransaksiPenempatanEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKomponen, setListKomponen] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  const formDataRef = useRef({
    komponen: "",
    tglpengecekan: "",
    pic: "",
    user: "",
    judul: "",
    tanggalmulai: "",
    tanggalselesai: "",
    deskripsi: "",
  });

  const [status, setStatus] = useState(""); // status dari backend
  const [isDisableTanggal, setIsDisableTanggal] = useState(true);
  const [isPerbaikanAktif, setIsPerbaikanAktif] = useState(false);
  const [komponenStatus, setKomponenStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const penempatanSchema = object({
    komponen: string().required("Komponen harus dipilih"),
    pic: string().required("Harus diisi"),
    tglpengecekan: string().required("Tanggal harus diisi"),
    user: string().required("User belum tersedia"),
    judul: string().required("Judul harus diisi"),
    tanggalmulai: string().required("Tanggal mulai harus diisi"),
    tanggalselesai: string().required("Tanggal selesai harus diisi"),
    deskripsi: string().required("Deskripsi harus diisi"),
  });

  // FETCH DATA BY ID
  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      try {
        const data = await UseFetch(
          API_LINK +
            "TransaksiKontrolKomponenAir/GetDataTrsKontrolKomponenAirById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data penempatan.");
        } else {
          const dt = data[0];
          formDataRef.current = {
            komponen: dt["Key kpn"]?.toString() || "",
            tglpengecekan: dt["Tanggal Pengecekan"]?.split("T")[0] || "",
            pic: dt["PIC"] || "",
            user: dt["User"] || "",
            judul: dt["Judul"] || "",
            tanggalmulai: dt["Tanggal Rencana Mulai"]?.split("T")[0] || "",
            tanggalselesai: dt["Tanggal Rencana Selesai"]?.split("T")[0] || "",
            deskripsi: dt["Deskripsi Kerusakan"] || "",
          };
          setStatus(dt["Status"] || "Pengecekan");

          // Fetch status komponen
          const statusRes = await UseFetch(
            API_LINK + "TransaksiKontrolKomponenAir/GetStatusKomponenAir",
            { selectedKomponenId: dt["Key kpn"] }
          );
          setKomponenStatus(statusRes[0]?.Status?.toLowerCase() || null);
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;

    const validationError = await validateInput(name, value, penempatanSchema);
    setErrors((prev) => ({ ...prev, [name]: validationError.error }));
  };

  const handleUpdatePerbaikan = async () => {
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      penempatanSchema,
      setErrors
    );
    if (!Object.values(validationErrors).every((err) => !err)) return;

    if (
      !window.confirm(
        `Konfirmasi Perbaikan\nTanggal Mulai: ${formDataRef.current.tanggalmulai}\nTanggal Selesai: ${formDataRef.current.tanggalselesai}`
      )
    )
      return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: withID,
        deskripsi: formDataRef.current.deskripsi,
        tglmulai: formDataRef.current.tanggalmulai,
        tglselesai: formDataRef.current.tanggalselesai,
        user: formDataRef.current.user,
      };

      const data = await UseFetch(
        API_LINK + "TransaksiKontrolKomponenAir/UpdateTrsKontrolKomponenAir",
        payload
      );
      if (data === "ERROR") throw new Error("Gagal menyimpan data perbaikan");

      await UseFetch(
        API_LINK +
          "TransaksiKontrolKomponenAir/UpdateStatusTrsKontrolKomponenAir",
        {}
      );
      SweetAlert("Sukses", "Perbaikan disimpan", "success");
      onChangePage("index");
    } catch (error) {
      setIsError({ error: true, message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelesai = async () => {
    const selesaiPayload = {
      id: withID,
      deskripsi: formDataRef.current.deskripsi,
      user: formDataRef.current.user,
    };

    const validationError = await validateInput(
      "deskripsi",
      formDataRef.current.deskripsi,
      penempatanSchema
    );
    setErrors((prev) => ({ ...prev, deskripsi: validationError.error }));
    if (validationError.error) return;

    setIsSubmitting(true);
    try {
      const data = await UseFetch(
        API_LINK +
          "TransaksiKontrolKomponenAir/UpdateStatusKontrolKomponenAir",
        selesaiPayload
      );
      if (data === "ERROR") throw new Error("Gagal menyimpan data selesai");

      await UseFetch(
        API_LINK +
          "TransaksiKontrolKomponenAir/UpdateStatusTrsKontrolKomponenAir",
        {}
      );
      SweetAlert("Sukses", "Penyelesaian disimpan", "success");
      onChangePage("index");
    } catch (error) {
      setIsError({ error: true, message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="card">
          <div className="card-header bg-primary text-white">
            Ubah Data Penempatan
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <DropDown
                  forInput="komponen"
                  label="Komponen"
                  arrData={listKomponen}
                  isRequired
                  value={formDataRef.current.komponen}
                  onChange={handleInputChange}
                  errorMessage={errors.komponen}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="tglpengecekan"
                  label="Tanggal Penempatan"
                  isRequired
                  value={formDataRef.current.tglpengecekan}
                  max={today}
                  onChange={handleInputChange}
                  errorMessage={errors.tglpengecekan}
                  disabled={true}
                />
              </div>
              <div className="col-lg-4">
                <DropDown
                  forInput="jenisPenempatan"
                  label="Jenis Penempatan"
                  arrData={[
                    { Value: "PLTS", Text: "PLTS" },
                    { Value: "Penggunaan", Text: "Penggunaan" },
                  ]}
                  isRequired
                  value={formDataRef.current.jenisPenempatan}
                  onChange={handleInputChange}
                  errorMessage={errors.jenisPenempatan}
                  disabled={true}
                />
              </div>
              <div className="col-lg-12 mt-3">
                <Input
                  forInput="deskripsi"
                  label="Deskripsi"
                  value={formDataRef.current.deskripsi}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsi}
                  disabled={status === "Selesai"}
                  multiline
                />
              </div>
              {status === "Pengecekan" && (
                <div className="col-lg-12 mt-3">
                  <Button
                    label="Kerusakan"
                    onClick={() => setIsPerbaikanAktif(true)}
                    disabled={isPerbaikanAktif}
                  />
                  {isPerbaikanAktif && (
                    <div className="mt-2">
                      <Input
                        type="date"
                        forInput="tanggalmulai"
                        label="Tanggal Mulai"
                        value={formDataRef.current.tanggalmulai}
                        onChange={handleInputChange}
                        errorMessage={errors.tanggalmulai}
                      />
                      <Input
                        type="date"
                        forInput="tanggalselesai"
                        label="Tanggal Selesai"
                        value={formDataRef.current.tanggalselesai}
                        onChange={handleInputChange}
                        errorMessage={errors.tanggalselesai}
                      />
                      <Button
                        label="Set Perbaikan"
                        onClick={handleUpdatePerbaikan}
                      />
                    </div>
                  )}
                  <Button
                    label="Selesai"
                    onClick={handleSelesai}
                    disabled={komponenStatus !== "normal"}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
