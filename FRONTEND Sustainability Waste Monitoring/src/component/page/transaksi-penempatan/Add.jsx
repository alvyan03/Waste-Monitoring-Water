import { useRef, useState, useEffect } from "react";
import { object, string, date } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import DropDown from "../../part/Dropdown";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function TransaksiPenempatanAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [komponenBocorOptions, setKomponenBocorOptions] = useState([]);
  const [sensorOptions, setSensorOptions] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const formDataRef = useRef({
    sensor: "",
    komponen: "",
    ruangan: "",
    tanggal: today,
    status: "Aktif",
  });

  const userSchema = object({
    sensor: string().required("Sensor harus dipilih"),
    komponen: string().required("Harus diisi"),
    ruangan: string().required("Harus diisi"),
    tanggal: date().required("Harus diisi"),
    status: string().required("Harus diisi"),
  });

  useEffect(() => {
    const fetchKomponenBocor = async () => {
      try {
        setIsPageLoading(true);

        // Filter yang dikirim ke API
        const filter = {
          page: "1",
          lokasi: "",
          sortBy: "[Nomor Komponen]",
        };
        console.log("Filter dikirim ke API:", filter);

        // Panggil API
        const response = await fetch(
          API_LINK + "TransaksiKontrolKomponenAir/GetDataKomponenAirByBocor",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("jwtToken"),
            },
            body: JSON.stringify(filter),
          }
        );

        console.log("HTTP Status:", response.status, response.statusText);

        // Cek apakah server merespon JSON
        const text = await response.text();
        console.log("Raw response text:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("Gagal parse JSON:", err);
          data = null;
        }

        console.log("Parsed JSON data:", data);

        if (Array.isArray(data) && data.length > 0) {
          // Mapping untuk dropdown komponen bocor
          const komponenOptions = data.map((item) => ({
            Text: `${item.kpn_no_komponen || item["Nomor Komponen"]} (${
              item.Lokasi || item["Lokasi"]
            })`,
            Value: item.kpn_id || item["Key"], // sesuai DropDown component
          }));
          setKomponenBocorOptions(komponenOptions);

          // Mapping untuk dropdown sensor
          const sensorList = data.map((item) => ({
            Text: item.sensor_name || item.Sensor || "Sensor tidak tersedia",
            Value:
              item.sensor_id || item.SensorKey || item.kpn_id || item["Key"],
          }));
          setSensorOptions(sensorList);
        } else {
          setKomponenBocorOptions([]);
          setSensorOptions([]);
        }
      } catch (err) {
        console.error("Error fetch komponen bocor:", err);
        window.alert("Gagal memuat data komponen bocor");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchKomponenBocor();
  }, []);

  console.log(komponenBocorOptions);
  console.log("sensorOpt:" + sensorOptions);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prev) => ({
      ...prev,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Validasi semua input
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((err) => !err)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        // 🔹 Kirim ke backend dengan fetch langsung
        const response = await fetch(
          API_LINK + "TransaksiKontrolKomponenAir/CreateTrsKontrolKomponenAir",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("jwtToken"),
            },
            body: JSON.stringify(formDataRef.current),
          }
        );

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response API:", text);
        console.log("Data dikirim:", formDataRef.current);

        if (!response.ok || text === "ERROR") {
          throw new Error("Gagal menyimpan data penempatan");
        }

        SweetAlert("Sukses", "Data penempatan berhasil disimpan", "success");
        onChangePage("index");
      } catch (err) {
        console.error("Error saat menyimpan:", err);
        setIsError({ error: true, message: err.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading || isPageLoading) return <Loading />;
  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && <Alert type="danger" message={isError.message} />}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Data Penempatan Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <DropDown
                  forInput="sensor"
                  label="Sensor"
                  isRequired
                  type="pilih" // ini otomatis bikin placeholder -- Pilih Sensor --
                  arrData={komponenBocorOptions} // <-- pakai arrData sesuai komponen
                  value={formDataRef.current.sensor}
                  onChange={async (e) => {
                    // jangan langsung value, ambil dari event
                    const value = e.target.value;
                    formDataRef.current.sensor = value;

                    const validationError = await validateInput(
                      "sensor",
                      value,
                      userSchema
                    );
                    setErrors((prev) => ({
                      ...prev,
                      sensor: validationError.error,
                    }));
                  }}
                  errorMessage={errors.sensor}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  forInput="komponen"
                  label="Judul"
                  isRequired
                  placeholder="Masukkan judul"
                  value={formDataRef.current.komponen}
                  onChange={handleInputChange}
                  errorMessage={errors.komponen}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  forInput="ruangan"
                  label="Penanggung Jawab"
                  isRequired
                  placeholder="Masukkan penanggung jawab / PIC"
                  value={formDataRef.current.ruangan}
                  onChange={handleInputChange}
                  errorMessage={errors.ruangan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="tanggal"
                  label="Tanggal Pengecekan"
                  isRequired
                  value={formDataRef.current.tanggal}
                  max={today}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggal}
                />
              </div>

              <Input type="hidden" forInput="status" value="Aktif" />
            </div>
          </div>
        </div>

        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
          />
        </div>
      </form>
    </>
  );
}
