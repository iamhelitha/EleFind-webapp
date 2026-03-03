"use client";

/**
 * Scrollable table showing raw bounding-box data for each detection.
 * Columns are inferred from the keys of the first row.
 */

interface DetectionTableProps {
  rows: Array<Record<string, unknown>>;
}

export default function DetectionTable({ rows }: DetectionTableProps) {
  if (rows.length === 0) return null;

  const headers = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-card-border bg-green-100/30">
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-2 font-medium text-green-900"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-card-border last:border-0 hover:bg-green-100/10 transition-colors"
            >
              {headers.map((h) => {
                const val = row[h];
                const display =
                  typeof val === "number"
                    ? val % 1 !== 0
                      ? val.toFixed(4)
                      : val.toString()
                    : String(val ?? "—");
                return (
                  <td key={h} className="whitespace-nowrap px-4 py-2 text-muted">
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
