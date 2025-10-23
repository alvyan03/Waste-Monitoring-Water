import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Label from "../../part/Label";

export default function MasterEvaluasiTargetAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const months = [
    { Value: '01', Text: 'Januari' },
    { Value: '02', Text: 'Februari' },
    { Value: '03', Text: 'Maret' },
    { Value: '04', Text: 'April' },
    { Value: '05', Text: 'Mei' },
    { Value: '06', Text: 'Juni' },
    { Value: '07', Text: 'Juli' },
    { Value: '08', Text: 'Agustus' },
    { Value: '09', Text: 'September' },
    { Value: '10', Text: 'Oktober' },
    { Value: '11', Text: 'November' },
    { Value: '12', Text: 'Desember' },
  ];

  const [years] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, index) => currentYear + index).map(year => ({
      Value: year.toString(),
      Text: year.toString(),
    }));
  });

  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");

  const formDataRef = useRef({
    jumlahIndividu: "",
    targetBulananIndividu: "",
    persentaseTargetPenghematan: "",
    tanggalMulaiBerlaku: "",
  });

  const userSchema = object({
    jumlahIndividu: string()
      .required("Harus diisi")
      .matches(/^\d+$/, "Harus berupa angka")  // Pastikan hanya angka
      .test("maxValue", "Jumlah individu tidak boleh lebih dari 100.000", (value) => {
        return value <= 100000;
      }),

    targetBulananIndividu: string()
      .required("Harus diisi")
      .matches(/^\d+$/, "Harus berupa angka")  // Pastikan hanya angka
      .test("maxValue", "Target bulanan individu tidak boleh lebih dari 100", (value) => {
        return value <= 100;
      }),

    persentaseTargetPenghematan: string()
      .required("Harus diisi")
      .matches(/^\d+$/, "Harus berupa angka")  // Pastikan hanya angka
      .test("maxValue", "Persentase target penghematan tidak boleh lebih dari 100", (value) => {
        return value <= 100;
      }),

    bulan: string().required("Harus dipilih"),
    tahun: string().required("Harus dipilih"),
    tanggalMulaiBerlaku: string().required("Tanggal mulai berlaku harus diisi"),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    // Batasi jumlah individu untuk tidak lebih dari 6 digit
    if (name === "jumlahIndividu" && value.length > 6) {
      return;
    }

    // Batasi target bulanan individu dan persentase target penghematan untuk tidak lebih dari 3 digit
    if (["targetBulananIndividu", "persentaseTargetPenghematan"].includes(name) && value.length > 3) {
      return;
    }

    if (["jumlahIndividu", "targetBulananIndividu", "persentaseTargetPenghematan"].includes(name)) {
      const numericValue = value.replace(/\D/g, ""); // Menghapus karakter selain angka
      formDataRef.current[name] = numericValue;
      e.target.value = numericValue;
    } else {
      formDataRef.current[name] = value;
    }

    // Validasi dengan schema jika diperlukan
    const validationError = await validateInput(name, value, userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleBulanChange = async (value) => {
    setBulan(value);
    formDataRef.current.bulan = value;

    const validationError = await validateInput("bulan", value, userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      bulan: validationError ? validationError.message : "",
    }));
  };

  const handleTahunChange = async (value) => {
    setTahun(value);
    formDataRef.current.tahun = value;

    const validationError = await validateInput("tahun", value, userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      tahun: validationError ? validationError.message : "",
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    formDataRef.current.bulan = bulan;
    formDataRef.current.tahun = tahun;
    formDataRef.current.tanggalMulaiBerlaku = `${tahun}-${bulan}-01`;

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {

        // Hapus bulan dan tahun dari formDataRef sebelum mengirim ke server
        delete formDataRef.current.bulan;
        delete formDataRef.current.tahun;
        
        const data = await UseFetch(
          API_LINK + "MasterEvaluasiTarget/CreateEvaluasiTarget",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data target.");
        } else {
          SweetAlert("Sukses", "Data target berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
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
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Tambah Data Target Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="jumlahIndividu"
                  label="Jumlah Individu"
                  isRequired
                  value={formDataRef.current.jumlahIndividu}
                  onChange={handleInputChange}
                  errorMessage={errors.jumlahIndividu}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="targetBulananIndividu"
                  label="Target Bulanan Individu (m³)"
                  isRequired
                  value={formDataRef.current.targetBulananIndividu}
                  onChange={handleInputChange}
                  errorMessage={errors.targetBulananIndividu}
                />
              </div>  
              <div className="mb-1">
                <Label
                   title="Tanggal Mulai Berlaku"
                   data=""
                   forLabel="tanggalMulaiBerlaku"
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="bulan"
                  label="Bulan"
                  value={bulan}
                  arrData={months}
                  isRequired
                  onChange={(e) => handleBulanChange(e.target.value)}
                  errorMessage={errors.bulan}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="tahun"
                  label="Tahun"
                  value={tahun}
                  arrData={years}
                  isRequired
                  onChange={(e) => handleTahunChange(e.target.value)}
                  errorMessage={errors.tahun}
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="text"
                  forInput="persentaseTargetPenghematan"
                  label="Persentase Target Penghematan"
                  isRequired
                  value={formDataRef.current.persentaseTargetPenghematan}
                  onChange={handleInputChange}
                  errorMessage={errors.persentaseTargetPenghematan}
                />
              </div>
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
