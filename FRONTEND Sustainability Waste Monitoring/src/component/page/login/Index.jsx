import { useRef, useState } from "react";
import { object, string } from "yup";
import Cookies from "js-cookie";
import {
  API_LINK,
  APPLICATION_ID,
  APPLICATION_NAME,
  ROOT_LINK,
} from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { encryptId } from "../../util/Encryptor";
import logo from "../../../assets/IMG_Logo.png";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Modal from "../../part/Modal";

const TeamMemberCard = ({ nama, nim, peran, index }) => (
  <div
    className="member-card bg-white rounded-lg p-4 mb-3 shadow-lg transform transition-all duration-300 hover:scale-105"
    style={{
      animation: `fadeIn 0.5s ease-out ${index * 0.2}s forwards`,
      opacity: 0,
      transform: "translateY(20px)",
    }}
  >
    <div className="flex items-center">
      <div className="flower-icon mr-4">
        <svg
          viewBox="0 0 24 24"
          width="40"
          height="40"
          className="text-pink-500"
        >
          <path
            fill="currentColor"
            d="M12,1C8.13,1,5,4.13,5,8A7,7,0,0,0,12,15,7,7,0,0,0,19,8C19,4.13,15.87,1,12,1Zm0,2c2.76,0,5,2.24,5,5s-2.24,5-5,5-5-2.24-5-5S9.24,3,12,3Z"
          />
          <path
            fill="currentColor"
            d="M12,1C8.13,1,5,4.13,5,8A7,7,0,0,0,12,15,7,7,0,0,0,19,8C19,4.13,15.87,1,12,1Zm0,2c2.76,0,5,2.24,5,5s-2.24,5-5,5-5-2.24-5-5S9.24,3,12,3Z"
            style={{ transform: "rotate(45deg)" }}
          />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{nama}</h3>
        <p className="text-sm text-gray-600">{nim}</p>
        <p className="text-xs text-pink-500 mt-1">{peran}</p>
      </div>
    </div>
  </div>
);

export default function Login() {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listRole, setListRole] = useState([]);
  const [showTeamMembers, setShowTeamMembers] = useState(false);

  const formDataRef = useRef({
    username: "",
    password: "",
  });

  const modalRef = useRef();
  const teamModalRef = useRef();

  const anggotaKelompok = [
    {
      nama: "ABU GAFFAR BAITURROCHMAN ALFARIZI",
      nim: "0320230001",
    },
    {
      nama: "DWI IRENA DAMAYANTI",
      nim: "0320230010",
    },
    {
      nama: "IRAWANSYAH",
      nim: "0320230124",
    },
    {
      nama: "MOCHAMAD DIO SAPUTRA",
      nim: "0320230018",
    },
  ];

  const userSchema = object({
    username: string().max(50, "maksimum 50 karakter").required("harus diisi"),
    password: string().required("harus diisi"),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
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
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "Utilities/Login",
          formDataRef.current
        );

        if (data === "ERROR")
          throw new Error("Terjadi kesalahan: Gagal melakukan autentikasi.");
        else if (data.Status && data.Status === "LOGIN FAILED")
          throw new Error("Nama akun atau kata sandi salah.");
        else {
          setListRole(data);
          modalRef.current.open();
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    } else window.scrollTo(0, 0);
  };

  async function handleLoginWithRole(role, nama, peran) {
    try {
      const ipAddress = await UseFetch(
        "https://api.ipify.org/?format=json",
        {},
        "GET"
      );

      if (ipAddress === "ERROR")
        throw new Error("Terjadi kesalahan: Gagal mendapatkan alamat IP.");
      else {
        const token = await UseFetch(API_LINK + "Utilities/CreateJWTToken", {
          username: formDataRef.current.username,
          role: role,
          nama: nama,
        });

        if (token === "ERROR")
          throw new Error(
            "Terjadi kesalahan: Gagal mendapatkan token autentikasi."
          );
        else {
          localStorage.setItem("jwtToken", token.Token);

          const data = await UseFetch(API_LINK + "Utilities/CreateLogLogin", {
            username: formDataRef.current.username,
            role: role,
            ipAddress: ipAddress.ip,
            agent: navigator.userAgent,
            application: APPLICATION_ID,
          });

          if (data === "ERROR")
            throw new Error("Terjadi kesalahan: Gagal memilih peran pengguna.");
          else {
            const userInfo = {
              username: formDataRef.current.username,
              role: role,
              nama: nama,
              peran: peran,
              lastLogin: data[1]
                ? data[1].lastLogin
                : new Date().toISOString().split("T")[0] +
                  " " +
                  new Date().toISOString().split("T")[1],
            };

            let user = encryptId(JSON.stringify(userInfo));
            Cookies.set("activeUser", user, { expires: 1 });
            window.location.href = ROOT_LINK;
          }
        }
      }
    } catch (error) {
      window.scrollTo(0, 0);
      modalRef.current.close();
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  }

  const tampilkanAnggotaKelompok = () => {
    teamModalRef.current.open();
  };

  const modalStyles = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes floatingFlower {
      0% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-10px) rotate(10deg);
      }
      100% {
        transform: translateY(0px) rotate(0deg);
      }
    }

    .member-card {
      position: relative;
      overflow: hidden;
    }

    .member-card:before {
      content: '';
      position: absolute;
      top: -20px;
      right: -20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #ff6b6b, #ffd93d);
      border-radius: 50%;
      opacity: 0.1;
    }

    .flower-icon {
      animation: floatingFlower 3s ease-in-out infinite;
    }
  `;

  if (Cookies.get("activeUser")) window.location.href = "/";
  else {
    return (
      <>
        <style>{modalStyles}</style>
        {isLoading && <Loading />}
        {isError.error && (
          <div className="flex-fill m-3">
            <Alert type="danger" message={isError.message} />
          </div>
        )}
        <Modal title="Pilih Peran" ref={modalRef} size="small">
          <div className="list-group">
            {listRole.map((value, index) => {
              return (
                <button
                  key={index}
                  type="button"
                  className="list-group-item list-group-item-action"
                  aria-current="true"
                  onClick={() =>
                    handleLoginWithRole(value.RoleID, value.Nama, value.Role)
                  }
                >
                  Login sebagai {value.Role}
                </button>
              );
            })}
          </div>
        </Modal>

        <Modal
          title=" Tim Pengembang Kelompok 5"
          ref={teamModalRef}
          size="small"
        >
          <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                AstraTech Developer Team
              </h2>
              <p className="text-gray-600">
                Mahasiswa D3 Manajemen Informatika
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="space-y-4">
              {anggotaKelompok.map((anggota, index) => (
                <TeamMemberCard
                  key={index}
                  nama={anggota.nama}
                  nim={anggota.nim}
                  peran={anggota.peran}
                  index={index}
                />
              ))}
            </div>
          </div>
        </Modal>

        <form onSubmit={handleAdd}>
          <div
            className="container-fluid d-flex justify-content-center align-items-center"
            style={{ height: "70vh" }}
          >
            <div
              className="card w-100"
              style={{ minWidth: "360px", maxWidth: "550px" }}
            >
              <div className="card-body p-4 text-center">
                <img
                  src={logo}
                  alt="Logo AstraTech"
                  className="w-100 px-5 py-4"
                />
                <p className="lead fw-medium fs-5 text-nowrap">
                  {APPLICATION_NAME.toUpperCase()}
                </p>
                <div style={{ textAlign: "left" }}>
                  <div className="py-2 px-1">
                    <Input
                      type="text"
                      forInput="username"
                      placeholder="Nama Akun"
                      isRequired
                      value={formDataRef.current.username}
                      onChange={handleInputChange}
                      errorMessage={errors.username}
                    />
                  </div>
                  <div className="py-2 px-1">
                    <Input
                      type="password"
                      forInput="password"
                      placeholder="Kata Sandi"
                      isRequired
                      value={formDataRef.current.password}
                      onChange={handleInputChange}
                      errorMessage={errors.password}
                    />
                  </div>
                  <Button
                    classType="primary my-3 w-100"
                    type="submit"
                    label="MASUK"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="fixed-bottom p-3 text-center bg-white cursor-pointer transition-all duration-300 hover:bg-gray-50"
            onClick={tampilkanAnggotaKelompok}
          >
            Copyright &copy; 2024 Kelompok 5 - ASTRAtech
          </div>
        </form>
      </>
    );
  }
}
