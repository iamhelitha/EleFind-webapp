import pool from "@/lib/db";
import EditZoneRow from "@/app/admin/_components/EditZoneRow";

export default async function AdminCrossingsPage() {
  const { rows } = await pool.query(
    `SELECT id, name, description, risk_level, confirmation_count, created_at
     FROM crossing_zones
     ORDER BY created_at DESC`
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-green-900 mb-4">
        Crossing Zones
      </h1>

      <div className="bg-white rounded-xl border border-card-border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-green-50 border-b border-card-border">
            <tr>
              {["Name", "Risk Level", "Confirms", "Credibility", "Created", "Actions"].map(
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
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No crossing zones yet.
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
