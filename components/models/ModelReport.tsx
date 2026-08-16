import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChartNoAxesCombined,
  CheckCircle2,
  ScanSearch,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";

export interface ReportMetric {
  value: string;
  label: string;
  note: string;
}

export interface ReportFact {
  label: string;
  value: string;
  detail: string;
}

export interface ReportGraph {
  src: string;
  width: number;
  height: number;
  title: string;
  body: string;
  wide?: boolean;
}

export interface ComparisonRow {
  label: string;
  yolo11: number;
  yolo26: number;
  digits?: number;
}

interface ModelReportProps {
  version: string;
  status: string;
  title: string;
  summary: string;
  metrics: ReportMetric[];
  metricQualifier: string;
  facts: ReportFact[];
  settings: Array<[string, string]>;
  graphs: ReportGraph[];
  interpretation: string[];
  comparisonIntro: string;
  comparisonRows: ComparisonRow[];
  comparisonImage?: ReportGraph;
  limitations: string[];
  otherModel: { href: string; label: string };
}

function ComparisonBars({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="space-y-6">
      {rows.map(({ label, yolo11, yolo26, digits = 4 }) => (
        <div key={label}>
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-[13px] font-semibold text-ink">{label}</span>
            <span className="mono text-[10px] uppercase tracking-[0.08em] text-muted">
              same held-out evaluation
            </span>
          </div>
          <div className="space-y-2">
            {[
              ["YOLO11s baseline", yolo11, "bg-sage-500"],
              ["YOLO26s", yolo26, "bg-accent"],
            ].map(([name, value, colour]) => (
              <div key={String(name)} className="grid grid-cols-[116px_1fr_58px] items-center gap-3">
                <span className="text-[11.5px] text-muted">{name}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-divider/60">
                  <div
                    className={`h-full rounded-full ${colour}`}
                    style={{ width: `${Number(value) * 100}%` }}
                  />
                </div>
                <span className="mono text-right text-[11px] text-ink">
                  {Number(value).toFixed(digits)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ModelReport({
  version,
  status,
  title,
  summary,
  metrics,
  metricQualifier,
  facts,
  settings,
  graphs,
  interpretation,
  comparisonIntro,
  comparisonRows,
  comparisonImage,
  limitations,
  otherModel,
}: ModelReportProps) {
  return (
    <div className="animate-fade-in bg-sand">
      <section className="relative overflow-hidden bg-night-panel px-4 py-14 text-night-text sm:px-8 sm:py-18">
        <div className="absolute inset-0 bg-[radial-gradient(70%_100%_at_80%_20%,rgba(122,138,94,0.2),transparent_68%)]" />
        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-night-muted transition-colors hover:text-sand"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to EleFind
          </Link>
          <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-sage-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {status}
              </div>
              <p className="mono m-0 text-[11px] uppercase tracking-[0.12em] text-accent-400">
                Model report · {version}
              </p>
              <h1 className="mt-3 max-w-[14ch] font-heading text-[clamp(42px,7vw,68px)] leading-[0.98] tracking-[-0.03em] text-sand">
                {title}
              </h1>
              <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.7] text-[rgba(240,233,217,0.72)]">
                {summary}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(({ value, label, note }) => (
                <div key={label} className="rounded-[22px] bg-white/[0.07] p-5">
                  <div className="mono text-[clamp(24px,4vw,34px)] leading-none text-sand">{value}</div>
                  <div className="mt-2 text-[12px] font-semibold text-night-text">{label}</div>
                  <div className="mt-1 text-[10.5px] leading-[1.4] text-night-muted">{note}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-7 max-w-[88ch] border-t border-white/10 pt-5 text-[11px] leading-[1.55] text-night-muted">
            {metricQualifier}
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h6 className="eyebrow m-0 mb-3.5 text-accent">Evaluation context</h6>
              <h2 className="m-0 text-[clamp(27px,4vw,38px)] leading-[1.08]">How this model was measured</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {facts.map(({ label, value, detail }) => (
                  <div key={label} className="rounded-[22px] bg-sand-surface p-5">
                    <div className="mono text-[21px] text-ink">{value}</div>
                    <div className="mt-1.5 text-[12.5px] font-semibold">{label}</div>
                    <p className="m-0 mt-1.5 text-[11.5px] leading-[1.5] text-muted">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[26px] bg-sage-100 p-6 sm:p-7">
              <div className="flex items-center gap-2 text-sage-900">
                <SlidersHorizontal className="h-5 w-5" />
                <h3 className="m-0 text-xl">Operating configuration</h3>
              </div>
              <dl className="mt-5 divide-y divide-sage-300/55">
                {settings.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[1fr_auto] gap-5 py-3 text-[12.5px]">
                    <dt className="text-sage-900/65">{label}</dt>
                    <dd className="mono m-0 text-right text-sage-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-surface px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h6 className="eyebrow m-0 mb-3.5 text-accent">Evaluation figures</h6>
              <h2 className="m-0 text-[clamp(27px,4vw,38px)] leading-[1.08]">What the model learned</h2>
            </div>
            <ChartNoAxesCombined className="hidden h-8 w-8 text-accent-700 sm:block" />
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {graphs.map(({ src, width, height, title: graphTitle, body, wide }) => (
              <figure
                key={src}
                className={`m-0 overflow-hidden rounded-[24px] border border-divider bg-sand p-3 ${wide ? "md:col-span-2" : ""}`}
              >
                <Image
                  src={src}
                  alt={graphTitle}
                  width={width}
                  height={height}
                  sizes={wide ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                  className="h-auto w-full rounded-[16px] bg-white"
                />
                <figcaption className="px-2 pb-1 pt-3">
                  <div className="text-[13.5px] font-semibold">{graphTitle}</div>
                  <div className="mt-1 text-[11.5px] leading-[1.5] text-muted">{body}</div>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {interpretation.map((item) => (
              <div
                key={item}
                className="rounded-[20px] bg-night-panel p-5 text-[12px] leading-[1.55] text-[rgba(240,233,217,0.82)]"
              >
                <ScanSearch className="mb-3 h-4 w-4 text-accent-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h6 className="eyebrow m-0 mb-3.5 text-accent">Model comparison</h6>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="m-0 max-w-[18ch] text-[clamp(27px,4vw,38px)] leading-[1.08]">YOLO11s baseline vs YOLO26s</h2>
              <p className="mt-4 max-w-[58ch] text-[14px] leading-[1.65] text-muted">{comparisonIntro}</p>
              <div className="mt-7 rounded-[24px] bg-sand-surface p-5 sm:p-6">
                <ComparisonBars rows={comparisonRows} />
              </div>
            </div>
            {comparisonImage && (
              <figure className="m-0 self-start overflow-hidden rounded-[24px] border border-divider bg-sand-surface p-3">
                <Image
                  src={comparisonImage.src}
                  alt={comparisonImage.title}
                  width={comparisonImage.width}
                  height={comparisonImage.height}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="h-auto w-full rounded-[16px] bg-white"
                />
                <figcaption className="px-2 pb-1 pt-3">
                  <div className="text-[13.5px] font-semibold">{comparisonImage.title}</div>
                  <div className="mt-1 text-[11.5px] leading-[1.5] text-muted">{comparisonImage.body}</div>
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      </section>

      <section className="bg-accent-100 px-4 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-accent-800">
              <TriangleAlert className="h-5 w-5" />
              <h2 className="m-0 text-2xl">Known limits</h2>
            </div>
            <ul className="mt-4 grid gap-2.5 text-[13px] leading-[1.55] text-accent-900 sm:grid-cols-2">
              {limitations.map((item) => (
                <li key={item} className="rounded-[18px] bg-sand/70 px-4 py-3">{item}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col">
            <Link
              href="/detect"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-sand transition-colors hover:bg-accent-600"
            >
              Try detection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={otherModel.href}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-300 px-6 py-3 text-sm font-semibold text-accent-900 transition-colors hover:bg-sand/50"
            >
              {otherModel.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
