import moment from "moment";
import "moment/dist/locale/id";

export const separator = (input) => {
  let parsedInput = parseFloat(input.toString().replace(/\./g, ""));

  if (isNaN(parsedInput)) return "";

  const options = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
    decimal: ",",
    thousands: ".",
  };

  return parsedInput.toLocaleString("id-ID", options);
};

export const clearSeparator = (input) => {
  if (input) {
    let parsedInput = parseFloat(input.toString().replace(/\./g, ""));
    return parsedInput;
  }
  return 0;
};
export const formatDate = (input, dateOnly = false) => {
  return dateOnly
    ? moment(input).format("DD MMMM yyyy")
    : moment(input).format("DD MMMM yyyy, HH:mm");
};
export const formatCustomDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    return "";
  }
};

// ✅ Tambahkan fungsi ini di bawah
export const formatDateOnly = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
