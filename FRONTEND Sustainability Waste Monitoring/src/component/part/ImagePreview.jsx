import "../../index.css";

export default function ImagePreview({ src }) {
  if (!src) return null;

  return (
    <div className="image-preview-container">
      <img src={src} alt="Preview" className="image-preview" />
    </div>
  );
}
