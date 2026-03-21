import pool from "@/lib/db";
import DeleteDetectionButton from "@/app/admin/_components/DeleteDetectionButton";

interface PageProps {
  searchParams: Promise<{ page?: string; source?: string; minConf?: string }>;
}

const PAGE_SIZE = 50;

export default async function AdminDetectionsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;
  const source = sp.source ?? "";
  const minConf = parseFloat(sp.minConf ?? "0") || 0;

  const { rows } = await pool.query(
    `SELECT id, image_name, lat, lng, confidence, elephant_count,
            source_type, confirmation_count, detected_at
     FROM detections
     WHERE ($1 = '' OR source_type = $1)
       AND confidence >= $2
     ORDER BY detected_at DESC
     LIMIT $3 OFFSET $4`,
    [source, minConf, PAGE_SIZE, offset]
  );

  const countRes = await pool.query(
    `SELECT COUNT(*) FROM detections
     WHERE ($1 = '' OR source_type = $1) AND confidence >= $2`,
    [source, minConf]
  );
  const total = parseInt(countRes.rows[0].count);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-green-900 mb-4">
        Detections
      </h1>

      {/* Filter bar */}
      <form className="flex flex-wrap gap-3 mb-4 bg-white rounded-xl border border-card-border p-4">
        <div>
          <label className="block text-xs text-muted mb-1">Source type</label>
          <select
            name="source"
            defaultValue={source}
            className="rounded border border-card-border px-2 py-1 text-sm"
          >
            <option value="">All</option>
            <option value="drone">Drone</option>
            <option value="ungeoreferenced">Ungeoreferenced</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Min confidence</label>
          <input
            name="minConf"
            type="number"
            min="0"
            max="1"
            step="0.05"
            defaultValue={minConf || ""}
            placeholder="0.0"
            className="rounded border border-card-border px-2 py-1 text-sm w-24"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded bg-green-700 text-white px-3 py-1 text-sm hover:bg-green-800"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-card-border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-green-50 border-b border-card-border">
            <tr>
              {["Image", "Location", "Confidence", "Elephants", "Source", "Confirms", "Date", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted">
                  No detections found.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-xs text-muted max-w-[140px] truncate">
                    {d.image_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {Number(d.lat).toFixed(4)}, {Number(d.lng).toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    {(d.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">{d.elephant_count}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {d.source_type}
                  </td>
                  <td className="px-4 py-3">{d.confirmation_count ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(d.detected_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteDetectionButton id={d.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4 text-sm">
          <span className="text-muted">
            Page {page} of {totalPages} ({total} total)
          </span>
          {page > 1 && (
            <a
              href={`?page=${page - 1}&source=${source}&minConf=${minConf}`}
              className="rounded border border-card-border px-3 py-1 hover:border-green-300"
            >
              ←
            </a>
          )}
          {page < totalPages && (
            <a
              href={`?page=${page + 1}&source=${source}&minConf=${minConf}`}
              className="rounded border border-card-border px-3 py-1 hover:border-green-300"
            >
              →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
