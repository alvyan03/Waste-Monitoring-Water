import { lazy } from "react";

const Dashboard = lazy(() => import("../page/dashboard/Root"));
const Notifikasi = lazy(() => import("../page/notifikasi/Root"));
const JenisSampah = lazy(() => import("../page/master-jenis-sampah/Root"));
const Gudang = lazy(() => import("../page/master-gudang/Root"));
const Sampah = lazy(() => import("../page/master-sampah/Root"));
const PembuanganSampah = lazy(() =>
  import("../page/transaksi-pembuangan-sampah/Root")
);
const PenjualanSampah = lazy(() =>
  import("../page/transaksi-penjualan-sampah/Root")
);
const Produksi = lazy(() => import("../page/transaksi-produksi/Root"));

const routeList = [
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/notifikasi",
    element: <Notifikasi />,
  },
  {
    path: "/jenis_sampah",
    element: <JenisSampah />,
  },
  {
    path: "/gudang",
    element: <Gudang />,
  },
  {
    path: "/sampah",
    element: <Sampah />,
  },
  {
    path: "/pembuangan_sampah",
    element: <PembuanganSampah />,
  },
  {
    path: "/penjualan_sampah",
    element: <PenjualanSampah />,
  },
  {
    path: "/produk_daur_ulang",
    element: <Produksi />,
  },
];

export default routeList;
