import { useEffect, useState } from "react";
import { object, string,date } from "yup";
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
  const [formData, setFormData] = useState({
    idPenempatan: "",
    ruangan: "",
    tanggal: "",
    jenisPenempatan: "",
  });
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKomponen, setListKomponen] = useState({});
  const [listRuangan, setListRuangan] = useState({});
  const today = new Date().toISOString().split("T")[0];

  const penempatanSchema = object({
    idPenempatan: string().required("ID Penempatan harus ada."), // Validasi ID wajib ada
    ruangan: string().required("Penempatan harus dipilih"),
    tanggal: date().required("Tanggal harus diisi"),
    jenisPenempatan: string().required("Jenis penempatan harus dipilih"),
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

      try {
        const data = await UseFetch(API_LINK + "TrsPenempatan/GetDataPenempatanById", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data penempatan.");
        } else {
          setFormData({
            idPenempatan: data[0].idPenempatan || '',
            ruangan: data[0].ruangan || '',
            tanggal: data[0].tanggal || '',
            jenisPenempatan: data[0].jenisPenempatan || '',
          });
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

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validasi input
    const validationError = await validateInput(name, value, ruanganSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
      penempatanSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {
        const data = await UseFetch(API_LINK + "TrsPenempatan/EditPenempatan", formData);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data ruangan.");
        } else {
          SweetAlert("Sukses", "Data ruangan berhasil disimpan", "success");
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
      {isError.error && <Alert type="danger" message={isError.message} />}
      <form onSubmit={handleSave}>
        <div className="card">
          <div className="card-header bg-primary text-white">
            Ubah Data Penempatan
          </div>
          <div className="card-body p-4">
            <div className="row">
            <div className="col-lg-4">
                <DropDown
                  forInput="ruangan"
                  label="Ruangan"
                  arrData={listRuangan}
                  isRequired
                  value={formData.ruangan}
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
                  value={formData.tanggal}
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
                  value={formData.jenisPenempatan}
                  onChange={handleInputChange}
                  errorMessage={errors.jenisPenempatan}
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
