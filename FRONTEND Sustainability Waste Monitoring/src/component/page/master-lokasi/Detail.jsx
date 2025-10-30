// import { useEffect, useRef, useState } from "react";
// import { API_LINK, FILE_LINK } from "../../util/Constants";
// import UseFetch from "../../util/UseFetch";
// import Button from "../../part/Button";
// import Label from "../../part/Label";
// import Loading from "../../part/Loading";
// import Alert from "../../part/Alert";

// export default function MasterLokasiDetail({ onChangePage, withID }) {
//   const [isError, setIsError] = useState({ error: false, message: "" });
//   const [isLoading, setIsLoading] = useState(true);

//   const formDataRef = useRef({
//     namaGedung: "",
//     lantai: "",
//     jumlahHulu: "",
//     jumlahHilir: "",
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsError((prevError) => ({ ...prevError, error: false }));

//       try {
//         const data = await UseFetch(
//           API_LINK + "MasterLokasi/DetailLokasi",
//           { id: withID }
//         );

//         if (data === "ERROR" || data.length === 0) {
//           throw new Error(
//             "Terjadi kesalahan: Gagal mengambil data alat/mesin."
//           );
//         } else {
//           formDataRef.current = { ...formDataRef.current, ...data[0] };
//         }
//       } catch (error) {
//         setIsError((prevError) => ({
//           ...prevError,
//           error: true,
//           message: error.message,
//         }));
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (isLoading) return <Loading />;

//   return (
//     <>
//       {isError.error && (
//         <div className="flex-fill">
//           <Alert type="danger" message={isError.message} />
//         </div>
//       )}
//       <div className="card">
//         <div className="card-header bg-primary fw-medium text-white">
//           Detail Data Lokasi
//         </div>
//         <div className="card-body p-4">
//           <div className="row">
//             <div className="col-lg-6">
//               <Label
//                 forLabel="namaGedung"
//                 title="Nama Gedung"
//                 data={formDataRef.current.namaGedung}
//               />
//             </div>
//             <div className="col-lg-6">
//               <Label
//                 forLabel="lantai"
//                 title="Lantai"
//                 data={`Lantai ${formDataRef.current.lantai}`}
//               />
//             </div>
//             <div className="col-lg-6">
//               <Label
//                 forLabel="Jumlah Hulu"
//                 title="Jumlah Hulu"
//                 data={`${formDataRef.current.jumlahHulu} komponen`}
//               />
//             </div>
//             <div className="col-lg-6">
//               <Label
//                 forLabel="Jumlah Hilir"
//                 title="Jumlah Hilir"
//                 data={`${formDataRef.current.jumlahHilir} komponen`}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="float-end my-4 mx-1">
//         <Button
//           classType="secondary px-4 py-2"
//           label="KEMBALI"
//           onClick={() => onChangePage("index")}
//         />
//       </div>
//     </>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function MasterLokasiDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    namaGedung: "",
    lantai: "",
    jumlahHilir: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(API_LINK + "MasterLokasi/DetailLokasi", {
          id: withID,
        });

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data alat/mesin."
          );
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
          Detail Data Lokasi
        </div>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-lg-6">
              <Label
                forLabel="namaGedung"
                title="Nama Gedung"
                data={formDataRef.current.namaGedung}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="lantai"
                title="Lantai"
                data={`Lantai ${formDataRef.current.lantai}`}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="Jumlah Hilir"
                title="Jumlah Hilir"
                data={`${formDataRef.current.jumlahHilir} komponen`}
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
