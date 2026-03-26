import pool from "@/lib/db";
import DeleteDetectionButton from "@/app/admin/_components/DeleteDetectionButton";
import { ScanSearch, ChevronLeft, ChevronRight } from "lucide-react";

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

  const CONF_BADGE = (conf: number) => {
    if (conf >= 0.85) return "bg-green-100 text-green-800";
    if (conf >= 0.6) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-green-900">Detections</h1>
          <p className="text-xs text-muted mt-0.5">{total.toLocaleString()} records</p>
        </div>

        {/* Filter bar */}
        <form className="flex items-end gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">
              Source
            </label>
            <select
              name="source"
              defaultValue={source}
              className="rounded-lg border border-card-border px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All sources</option>
              <option value="drone">Drone</option>
              <option value="ungeoreferenced">Ungeoreferenced</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">
              Min Confidence
            </label>
            <input
              name="minConf"
              type="number"
              min="0"
              max="1"
              step="0.05"
              defaultValue={minConf || ""}
              placeholder="0.00"
              className="rounded-lg border border-card-border px-2.5 py-1.5 text-xs w-24 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-green-700 text-white px-3 py-1.5 text-xs font-semibold hover:bg-green-800 transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-card-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-green-50 border-b border-card-border">
            <tr>
              {[
                "Image",
                "Location",
                "Confidence",
                "Elephants",
                "Source",
                "Confirms",
                "Date",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left font-semibold text-green-900 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted">
                    <ScanSearch className="h-8 w-8 text-gray-300" />
                    <span className="text-sm">No detections found</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 text-muted max-w-[120px] truncate">
                    {d.image_name ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-muted">
                    {Number(d.lat).toFixed(4)}, {Number(d.lng).toFixed(4)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${CONF_BADGE(
                        d.confidence
                      )}`}
                    >
                      {(d.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-green-900">
                    {d.elephant_count}
                  </td>
                  <td className="px-3 py-2.5 text-muted capitalize">{d.source_type}</td>
                  <td className="px-3 py-2.5 text-center text-muted">
                    {d.confirmation_count ?? 0}
                  </td>
                  <td className="px-3 py-2.5 text-muted whitespace-nowrap">
                    {new Date(d.detected_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5">
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            {page > 1 && (
              <a
                href={`?page=${page - 1}&source=${source}&minConf=${minConf}`}
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-card-border bg-white text-xs hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?page=${page + 1}&source=${source}&minConf=${minConf}`}
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-card-border bg-white text-xs hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
