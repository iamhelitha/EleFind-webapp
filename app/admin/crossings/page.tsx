import pool from "@/lib/db";
import EditZoneRow from "@/app/admin/_components/EditZoneRow";
import { MapPinned } from "lucide-react";

export default async function AdminCrossingsPage() {
  const { rows } = await pool.query(
    `SELECT id, name, description, risk_level, confirmation_count, created_at
     FROM crossing_zones
     ORDER BY created_at DESC`
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-bold text-green-900">Crossing Zones</h1>
        <p className="text-xs text-muted mt-0.5">{rows.length} zone{rows.length !== 1 ? "s" : ""} total</p>
      </div>

      <div className="rounded-xl border border-card-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-green-50 border-b border-card-border">
            <tr>
              {["Name", "Risk Level", "Confirms", "Credibility", "Created", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left font-semibold text-green-900 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted">
                    <MapPinned className="h-8 w-8 text-gray-300" />
                    <span className="text-sm">No crossing zones yet</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((zone) => <EditZoneRow key={zone.id} zone={zone} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
