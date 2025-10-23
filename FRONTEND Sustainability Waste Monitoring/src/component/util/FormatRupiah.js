export const formatToRupiah = (value) => {
  const number = parseInt(value.toString().replace(/[^0-9]/g, ""));
  if (isNaN(number)) return "";
  return number.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
};
