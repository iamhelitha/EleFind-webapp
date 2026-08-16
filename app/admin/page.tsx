import pool from "@/lib/db";
import { ScanSearch, MapPinned, ThumbsUp, TrendingUp, Clock } from "lucide-react";

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
         LIMIT 8`
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

const RISK_BADGE: Record<string, string> = {
  low: "bg-sand-surface text-ink",
  medium: "bg-accent-100 text-accent-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-clay-surface text-clay-deep",
};

const STAT_CARDS = (stats: { detections: number; zones: number; confirmations: number }) => [
  {
    label: "Total Detections",
    value: stats.detections,
    icon: ScanSearch,
    color: "bg-sage-100 text-sage-700",
  },
  {
    label: "Crossing Zones",
    value: stats.zones,
    icon: MapPinned,
    color: "bg-accent-100 text-accent-700",
  },
  {
    label: "Community Confirms",
    value: stats.confirmations,
    icon: ThumbsUp,
    color: "bg-sand text-sage-700",
  },
];

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-xl font-bold text-ink">Dashboard</h1>
        <p className="text-xs text-muted mt-0.5">System overview and recent activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {STAT_CARDS(stats).map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-divider bg-sand p-4 shadow-sm flex items-center gap-3"
          >
            <div className={`rounded-lg p-2.5 ${color} shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted leading-none">{label}</p>
              <p className="font-heading text-2xl font-bold text-ink mt-1 leading-none">
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top confirmed zones */}
        <div className="rounded-xl border border-divider bg-sand shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-divider flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-accent-700" />
            <h2 className="text-sm font-bold text-ink">Most Confirmed Zones</h2>
          </div>
          {stats.topZones.length === 0 ? (
            <p className="text-sm text-muted px-4 py-5 text-center">No zones yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.topZones.map((z) => (
                <li key={z.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-ink truncate">
                      {z.name}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        RISK_BADGE[z.risk_level] ?? "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {z.risk_level}
                    </span>
                  </div>
                  <span className="text-xs text-muted shrink-0 ml-3">
                    {z.confirmation_count} confirm{z.confirmation_count !== 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent detections */}
        <div className="rounded-xl border border-divider bg-sand shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-divider flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-accent-700" />
            <h2 className="text-sm font-bold text-ink">Recent Detections</h2>
          </div>
          {stats.recentDetections.length === 0 ? (
            <p className="text-sm text-muted px-4 py-5 text-center">No detections yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.recentDetections.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-sand-surface text-ink text-[10px] font-bold">
                      {d.elephant_count}
                    </span>
                    <span className="text-xs text-muted truncate">
                      {d.image_name ?? `${Number(d.lat).toFixed(3)}, ${Number(d.lng).toFixed(3)}`}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted shrink-0 ml-3">
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
