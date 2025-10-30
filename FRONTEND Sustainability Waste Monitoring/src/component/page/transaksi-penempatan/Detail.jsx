import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../util/Constants";
import { date, object, string } from "yup";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Input from "../../part/Input";
import SweetAlert from "../../util/SweetAlert";

export default function TransaksiPenempatanDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isPerbaikanAktif, setIsPerbaikanAktif] = useState(false); // tombol perbaikan aktif
  const [isDisableTanggal, setIsDisableTanggal] = useState(true); // tanggal disable default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [komponenStatus, setKomponenStatus] = useState(null); // simpan status dari SP

  const formDataRef = useRef({
    komponen: "",
    keykpn: "",
    tglpengecekan: "",
    pic: "",
    user: "",
    lokasi: "",
    judul: "",
    tanggalmulai: "",
    tanggalselesai: "",
    deskripsi: "",
    status: "",
  });

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
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data penempatan."
          );
        } else {
          console.log("Data penempatan diterima:", data);
          formDataRef.current = {
            komponen: data[0]["Nomor Komponen"] || "",
            tglpengecekan: data[0]["Tanggal Pengecekan"]
              ? data[0]["Tanggal Pengecekan"].slice(0, 10)
              : "",
            pic: data[0]["PIC"] || "",
            lokasi: data[0]["Lokasi"] || "",
            user: data[0]["Key kpn"] || "",
            judul: data[0]["Judul"] || "",
            tanggalmulai: data[0]["Tanggal Rencana Mulai"]
              ? data[0]["Tanggal Rencana Mulai"].slice(0, 10)
              : "",
            tanggalselesai: data[0]["Tanggal Rencana Selesai"]
              ? data[0]["Tanggal Rencana Selesai"].slice(0, 10)
              : "",
            deskripsi: data[0]["Deskripsi Kerusakan"] || "",
            status: data[0]["Status Perbaikan"] || "",
            keykpn: data[0]["Key kpn"] || "",
          };

          console.log("Status Perbaikan:", formDataRef.current);
          setStatus(data[0]["Status Perbaikan"] || "");
        }

        if (
          formDataRef.current.keykpn !== null ||
          formDataRef.current.keykpn !== ""
        ) {
          console.log("jaalaann");
          console.log(formDataRef.current.komponen);
          const data1 = await UseFetch(
            API_LINK + "TransaksiKontrolKomponenAir/GetStatusKomponenAir",
            { id: formDataRef.current.keykpn }
          );
          console.log("jaalaannnnnnnnnnnn", data1);

          if (data1 === "ERROR" || data1.length === 0) {
            throw new Error(
              "Terjadi kesalahan: Gagal mengambil status komponen."
            );
          } else {
            console.log("Data status komponen diterima:", data1);
            const status = data1[0].Status || data1[0].Kondisi || "";
            const statusLower = status.toLowerCase();
            setKomponenStatus(statusLower);
          }
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  const userSchema = object({
    deskripsi: string().required("Deskripsi harus diisi"),
    tanggalmulai: date().required("Tanggal Mulai harus diisi"),
    tanggalselesai: date().required("Tanggal Selesai harus diisi"),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prev) => ({
      ...prev,
      [validationError.name]: validationError.error,
    }));
  };

  const handleUpdatePerbaikan = async () => {
    const payload = {
      deskripsi: formDataRef.current.deskripsi,
      tanggalmulai: formDataRef.current.tanggalmulai,
      tanggalselesai: formDataRef.current.tanggalselesai,
    };

    // Validasi sebelum submit
    const validationErrors = await validateAllInputs(
      payload,
      userSchema,
      setErrors
    );
    if (!Object.values(validationErrors).every((err) => !err)) return;

    console.log("Data sebelum update perbaikan:", formDataRef.current);
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
      };

      console.log("Payload update perbaikan:", payload);
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
    console.log("Dari sini jalan ga");
    if (!formDataRef.current.user) {
      SweetAlert("Gagal", "Data user belum tersedia", "error");
      return;
    }

    const selesaiPayload = {
      id: withID,
      deskripsi: formDataRef.current.deskripsi,
    };

    setIsSubmitting(true);
    try {
      console.log("🚀 Payload yang dikirim:", selesaiPayload);

      const data = await UseFetch(
        API_LINK +
          "TransaksiKontrolKomponenAir/UpdateStatusSelesaiDeskripsiKontrolKomponenAir",
        selesaiPayload
      );

      console.log("Brjalan jalan");
      console.log(data);
      if (data === "ERROR") {
        throw new Error("Gagal menyimpan data.");
      } else {
        await UseFetch(
          API_LINK +
            "TransaksiKontrolKomponenAir/UpdateStatusTrsKontrolKomponenAir",
          {}
        );

        SweetAlert("Sukses", "Ajukan Penyelesaian Disimpan", "success");
        onChangePage("index");
      }
    } catch (error) {
      console.error("❌ Error saat simpan selesai:", error);
      setIsError({ error: true, message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                data={formDataRef.current.komponen}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="lokasi"
                title="Lokasi"
                data={formDataRef.current.lokasi}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="judul"
                title="Judul"
                data={formDataRef.current.judul}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="pic"
                title="PIC"
                data={formDataRef.current.pic}
              />
            </div>
            <div className="col-lg-4">
              <Label
                forLabel="tanggaltext"
                title="Tanggal Pengecekan"
                data={formDataRef.current.tglpengecekan}
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
              />
            </div>
            <div className="col-lg-12 mt-3">
              <Input
                type="date"
                forInput="tanggalmulai"
                label="Tanggal Mulai"
                value={formDataRef.current.tanggalmulai}
                onChange={handleInputChange}
                errorMessage={errors.tanggalmulai}
                disabled={isDisableTanggal} // Disable by default
              />
              <Input
                type="date"
                forInput="tanggalselesai"
                label="Tanggal Selesai"
                value={formDataRef.current.tanggalselesai}
                onChange={handleInputChange}
                errorMessage={errors.tanggalselesai}
                disabled={isDisableTanggal} // Disable by default
              />
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="d-flex justify-content-end my-4">
        <Button
          classType="secondary px-4 py-2 mx-1"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />

        {status === "Pengecekan" && (
          <>
            {!isPerbaikanAktif ? (
              <Button
                classType="primary px-4 py-2 mx-1"
                label="PERBAIKI"
                onClick={() => {
                  setIsDisableTanggal(false); // Enable input tanggal
                  setIsPerbaikanAktif(true); // Tombol berubah menjadi Set Perbaikan
                }}
              />
            ) : (
              <Button
                classType="primary px-4 py-2 mx-1"
                label={isSubmitting ? "Saving..." : "Set Perbaikan"}
                disabled={isSubmitting}
                onClick={async () => {
                  const result = await SweetAlert(
                    "Konfirmasi Perubahan",
                    `Apakah Anda yakin ingin menyimpan perbaikan?\nJudul: ${formDataRef.current.judul}`,
                    "warning",
                    true
                  );

                  if (result.isConfirmed) {
                    handleUpdatePerbaikan();
                  }
                }}
              />
            )}
            <Button
              classType="primary px-4 py-2 mx-1"
              label="SELESAI"
              onClick={() => {
                handleSelesai();
              }}
            />
          </>
        )}
        {status !== "Selesai" && status !== "Pengecekan" && (
          <Button
            classType="secondary px-4 py-2 mx-1"
            disabled={isSubmitting || komponenStatus !== "normal"}
            label="SELESAI"
            onClick={handleSelesai}
          />
        )}
      </div>
    </>
  );
}
