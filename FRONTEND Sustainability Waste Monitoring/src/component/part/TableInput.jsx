import { Fragment } from "react";

export default function TableInput({
  data = [],
  columns = [],
  renderCell,
  titleHeader,
}) {
  if (!Array.isArray(data)) return null;

  const keys =
    data.length > 0
      ? Object.keys(data[0]).filter(
          (key) =>
            key !== "Key" &&
            key !== "Count" &&
            key !== "Alignment" &&
            key !== "Key2" &&
            key !== "rowStyle"
        )
      : columns;

  return (
    <div className="overflow-x-auto">
      <table className="table table-hover table-striped table table-light m-0">
        <thead>
          {titleHeader && (
            <tr>
              <th
                colSpan={keys.length}
                className="text-start bg-light fw-semibold"
              >
                {titleHeader}
              </th>
            </tr>
          )}
          <tr>
            {keys.map((key, colIndex) => (
              <th key={colIndex} className="text-center">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={keys.length} className="text-center text-muted"></td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {keys.map((key, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      textAlign: row.Alignment
                        ? row.Alignment[colIndex]
                        : "center",
                    }}
                  >
                    {renderCell
                      ? renderCell(rowIndex, key, row[key])
                      : row[key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
