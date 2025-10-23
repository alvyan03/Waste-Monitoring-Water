import React from "react";
import "../../index.css";

export default function ImageInTable({ src, alt = "foto sampah" }) {
  if (!src) return <span>Tidak ada gambar</span>;

  return (
    <img
      src={src}
      alt={alt}
      className="image-thumbnail"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "/default.jpg";
      }}
    />
  );
}
