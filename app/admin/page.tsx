import pool from "@/lib/db";

async function getStats() {
  const [detCount, zoneCount, zoneConf, detConf, topZones, recentDets] =
    await Promise.all([
      pool.query(`SELECT COUNT(*) FROM detections`),
      pool.query(`SELECT COUNT(*) FROM crossing_zones`),
      pool.query(`SELECT COUNT(*) FROM zone_confirmations`),
      pool.query(`SELECT COUNT(*) FROM detection_confirmations`),
      pool.query(
        `SELECT id, name, risk_level, confirmation_count
         FROM crossing_zones
         ORDER BY confirmation_count DESC
         LIMIT 5`
      ),
      pool.query(
        `SELECT id, image_name, lat, lng, confidence, elephant_count, detected_at
         FROM detections
         ORDER BY detected_at DESC
         LIMIT 10`
      ),
    ]);

  return {
    detections: parseInt(detCount.rows[0].count),
    zones: parseInt(zoneCount.rows[0].count),
    confirmations:
      parseInt(zoneConf.rows[0].count) + parseInt(detConf.rows[0].count),
    topZones: topZones.rows,
    recentDetections: recentDets.rows,
  };
}

const RISK_COLORS: Record<string, string> = {
  low: "text-green-700",
  medium: "text-amber-600",
  high: "text-orange-600",
  critical: "text-red-700",
};

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-green-900 mb-6">
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Detections", value: stats.detections },
          { label: "Crossing Zones", value: stats.zones },
          { label: "Community Confirmations", value: stats.confirmations },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-card-border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-muted">{label}</p>
            <p className="font-heading text-3xl font-bold text-green-900 mt-1">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top confirmed zones */}
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <h2 className="font-heading font-bold text-green-900 mb-3">
            Most Confirmed Zones
          </h2>
          {stats.topZones.length === 0 ? (
            <p className="text-sm text-muted">No zones yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topZones.map((z) => (
                <li key={z.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-green-900">
                      {z.name}
                    </span>
                    <span
                      className={`ml-2 text-xs font-semibold uppercase ${
                        RISK_COLORS[z.risk_level] ?? ""
                      }`}
                    >
                      {z.risk_level}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {z.confirmation_count} confirm{z.confirmation_count !== 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent detections */}
        <div className="rounded-xl border border-card-border bg-white p-5 shadow-sm">
          <h2 className="font-heading font-bold text-green-900 mb-3">
            Recent Detections
          </h2>
          {stats.recentDetections.length === 0 ? (
            <p className="text-sm text-muted">No detections yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentDetections.map((d) => (
                <li key={d.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-green-900">
                      {d.elephant_count}🐘
                    </span>
                    <span className="ml-2 text-xs text-muted truncate max-w-[120px] inline-block align-middle">
                      {d.image_name ?? "—"}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(d.detected_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
