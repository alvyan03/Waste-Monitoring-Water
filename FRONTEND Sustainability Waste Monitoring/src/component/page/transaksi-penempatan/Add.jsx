import { useRef, useState, useEffect } from "react";
import { object, string, date } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function TransaksiPenempatanAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKomponen, setListKomponen] = useState({});
  const [listRuangan, setListRuangan] = useState({});
  const today = new Date().toISOString().split("T")[0];

  const formDataRef = useRef({
    komponen: "",
    ruangan: "",
    tanggal: today,
    jenisPenempatan: "",
    status: "Aktif",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const komponenData = await UseFetch(API_LINK + "MasterKomponen/GetListKomponen", {});
        const ruanganData = await UseFetch(API_LINK + "MasterRuangan/GetListRuangan", {});

        if (komponenData === "ERROR" || ruanganData === "ERROR") {
          throw new Error("Gagal mengambil data komponen atau ruangan.");
        } else {
          setListKomponen(komponenData);
          setListRuangan(ruanganData);
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
        setListKomponen({});
        setListRuangan({});
      }
    };

    fetchData();
  }, []);

  const userSchema = object({
    komponen: string().required("harus dipilih"),
    ruangan: string().required("harus dipilih"),
    tanggal: date().required("harus diisi"),
    status: string().required("harus dipilih"),
    jenisPenempatan: string().required("harus dipilih"),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

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
        const data = await UseFetch(
          API_LINK + "TrsPenempatan/CreatePenempatan",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data penempatan.");
        } else {
          SweetAlert("Sukses", "Data penempatan berhasil disimpan", "success");
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
            Tambah Data Penempatan Baru
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
                <DropDown
                  forInput="ruangan"
                  label="Ruangan"
                  arrData={listRuangan}
                  isRequired
                  value={formDataRef.current.ruangan}
                  onChange={handleInputChange}
                  errorMessage={errors.ruangan}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="date"
                  forInput="tanggal"
                  label="Tanggal Penempatan"
                  isRequired
                  value={formDataRef.current.tanggal}
                  max={today}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggal}
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
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="hidden"
                  forInput="status"
                  label=""
                  isReadOnly
                  value="Aktif"
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
