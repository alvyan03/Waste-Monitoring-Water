import { lazy } from "react";

const Notifikasi = lazy(() => import("../page/notifikasi/Root"));
const JenisSampah = lazy(() => import("../page/master-jenis-sampah/Root"));
const TempatPenyimpanan = lazy(() =>
  import("../page/master-tempat-penyimpanan/Root")
);
const Sampah = lazy(() => import("../page/master-sampah/Root"));
const Produk = lazy(() => import("../page/master-produk/Root"));
const Vendor = lazy(() => import("../page/master-vendor/Root"));
const PembuanganSampah = lazy(() =>
  import("../page/transaksi-pembuangan-sampah/Root")
);
const PenjualanSampah = lazy(() =>
  import("../page/transaksi-penjualan-sampah/Root")
);
const Produksi = lazy(() => import("../page/transaksi-produksi/Root"));
const TransaksiPenjualanProduksi = lazy(() =>
  import("../page/transaksi-penjualan-produksi/Root")
);
const Dashboard = lazy(() => import("../page/Dashboard/Root"));
const DashboardAir = lazy(() => import("../page/Dashboard-Air/Root"));
const EvaluasiTarget = lazy(() => import("../page/master-evaluasi-target/Root"));
const Lokasi = lazy(() => import("../page/master-lokasi/Root"));
const MasterKomponen = lazy(() => import("../page/master-komponen-air/Root"));
const TransaksiPenempatan = lazy(() => import("../page/transaksi-penempatan/Root"));
const TransaksiPenggunaanAir = lazy(() =>import("../page/transaksi-penggunaan/Root"));


const routeList = [
  {
    path: "/notifikasi",
    element: <Notifikasi />,
  },
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/jenis_sampah",
    element: <JenisSampah />,
  },
  {
    path: "/tempat_penyimpanan",
    element: <TempatPenyimpanan />,
  },
  {
    path: "/sampah",
    element: <Sampah />,
  },
  {
    path: "/produk",
    element: <Produk />,
  },
  {
    path: "/vendor",
    element: <Vendor />,
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
  {
    path: "/penjualan_produksi",
    element: <TransaksiPenjualanProduksi />,
  },
  {
    path: "/dashboard_air",
    element: <DashboardAir />,
  },
  {
    path: "/evaluasi",
    element: <EvaluasiTarget />,
  },
  {
    path: "/lokasi",
    element: <Lokasi />,
  },
  {
    path: "/penggunaan_air",
    element: <TransaksiPenempatan />,
  },
  {
    path: "/pemeliharaan_prefektif_air",
    element: <TransaksiPenggunaanAir />,
  },
  {
    path: "/komponen_air",
    element: <MasterKomponen />,
  },
];

export default routeList;
