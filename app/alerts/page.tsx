"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Lock, MessageSquare, Bell, Mail } from "lucide-react";
import AreaMapMock from "@/components/alerts/AreaMapMock";
import AlertPreviewPanel from "@/components/alerts/AlertPreviewPanel";
import AuthField from "@/components/auth/AuthField";

/**
 * Community alerts — register the area you live in and choose how EleFind
 * reaches you when a sighting is verified nearby.
 *
 * UI only for now. Every control below is real and stateful, but nothing
 * is persisted: there is no alert-subscription table and no SMS provider
 * yet, so "Save alert settings" reports what *would* be stored rather than
 * claiming it saved. See the banner at the top of the page.
 */

const RADIUS_OPTIONS = [3, 5, 10, 20] as const;
type RadiusKm = (typeof RADIUS_OPTIONS)[number];

/** Registered households per radius — placeholder until the API exists. */
const HOUSEHOLDS_BY_RADIUS: Record<RadiusKm, number> = {
  3: 41,
  5: 96,
  10: 212,
  20: 587,
};

type ChannelId = "sms" | "push" | "email";

interface Channel {
  id: ChannelId;
  label: string;
  detail: string;
  icon: typeof MessageSquare;
  iconClass: string;
}

const CHANNELS: readonly Channel[] = [
  {
    id: "sms",
    label: "SMS",
    detail: "+94 71 ••• 4482 · verified",
    icon: MessageSquare,
    iconClass: "bg-accent-200 text-accent-800",
  },
  {
    id: "push",
    label: "Push notification",
    detail: "this browser · 1 device",
    icon: Bell,
    iconClass: "bg-sage-200 text-sage-800",
  },
  {
    id: "email",
    label: "Email digest",
    detail: "weekly summary only",
    icon: Mail,
    iconClass: "bg-neutral-200 text-neutral-700",
  },
];

type TriggerId = "verified" | "zoneRaised" | "repeat" | "unverified";

interface Trigger {
  id: TriggerId;
  label: string;
  /** Appended in mono after the label, e.g. a "(noisy)" warning. */
  note?: string;
}

const TRIGGERS: readonly Trigger[] = [
  { id: "verified", label: "An officer verifies a sighting inside my radius" },
  { id: "zoneRaised", label: "A nearby crossing zone is raised to HIGH or CRITICAL" },
  { id: "repeat", label: "Repeat sightings in the same place for 3 nights" },
  { id: "unverified", label: "Any unverified candidate detection", note: "(noisy)" },
];

const LANGUAGES = [
  { code: "si", label: "සිංහල" },
  { code: "ta", label: "தமிழ்" },
  { code: "en", label: "EN" },
] as const;

export default function AlertsPage() {
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(10);
  const [district, setDistrict] = useState("Polonnaruwa");
  const [village, setVillage] = useState("Hingurakgoda");
  const [channels, setChannels] = useState<Record<ChannelId, boolean>>({
    sms: true,
    push: true,
    email: false,
  });
  const [triggers, setTriggers] = useState<Record<TriggerId, boolean>>({
    verified: true,
    zoneRaised: true,
    repeat: true,
    unverified: false,
  });
  const [language, setLanguage] = useState<string>("si");
  const [quietFrom, setQuietFrom] = useState("22:00");
  const [quietTo, setQuietTo] = useState("05:30");

  const households = HOUSEHOLDS_BY_RADIUS[radiusKm];

  function toggleChannel(id: ChannelId) {
    setChannels((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleTrigger(id: TriggerId) {
    setTriggers((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSave() {
    const active = CHANNELS.filter((c) => channels[c.id]).map((c) => c.label);

    if (active.length === 0) {
      toast.error("Pick at least one channel, or you won't be reached.");
      return;
    }

    toast.success(
      `Not saved yet — alert delivery isn't built. These settings would register ${village}, ${district} at ${radiusKm} km via ${active.join(" + ")}.`,
      { duration: 6000 }
    );
  }

  return (
    <div className="animate-fade-in bg-sand">
      {/* ── Not-yet-wired banner ─────────────────────────────────── */}
      <div className="border-b border-accent-300 bg-accent-100 px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="mx-auto m-0 flex max-w-7xl items-start gap-2 text-[12.5px] leading-[1.5] text-accent-900">
          <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-accent" />
          <span>
            <strong>Preview.</strong> This screen is the alerts interface only —
            subscriptions aren&rsquo;t stored and no SMS is sent yet. Controls
            work so the flow can be reviewed.
          </span>
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl items-start gap-5 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[1fr_1fr_380px]">
        {/* ── Step 1 · Where you live ───────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div>
            <h6 className="eyebrow m-0 mb-2 text-accent">
              Step 1 · Where you live
            </h6>
            <h1 className="m-0 text-[29px] leading-[1.08]">
              Pin your area, pick a radius
            </h1>
            <p className="m-0 mt-2.5 text-[13.5px] leading-[1.6] text-[rgba(32,30,29,0.7)]">
              Drop the pin near your home or village centre. We store it snapped
              to a 5 km grid — enough to warn you, not enough to identify your
              house.
            </p>
          </div>

          <AreaMapMock
            placeLabel={`home · ${village} GN`}
            radiusKm={radiusKm}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <AuthField
              id="district"
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
            <AuthField
              id="village"
              label="GN division / village"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-xs text-[rgba(32,30,29,0.7)]">
                Alert radius
              </span>
              <span className="mono text-[11.5px] text-accent-700">
                {radiusKm} km · {households} households here
              </span>
            </div>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-label="Alert radius"
            >
              {RADIUS_OPTIONS.map((option) => {
                const selected = option === radiusKm;
                return (
                  <button
                    key={option}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setRadiusKm(option)}
                    className={`mono flex-1 cursor-pointer rounded-full py-2.5 text-center text-[12.5px] transition-colors ${
                      selected
                        ? "bg-accent text-sand"
                        : "bg-sand-surface text-ink hover:bg-neutral-300"
                    }`}
                  >
                    {option} km
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-[24px] bg-sage-100 px-4 py-3.5">
            <Lock className="mt-0.5 h-[15px] w-[15px] flex-none text-sage-700" />
            <p className="m-0 text-xs leading-[1.55] text-sage-900">
              Your pin is never shown on the public map and is not shared with
              other members. Officers see only the count of registered
              households in an area.
            </p>
          </div>
        </section>

        {/* ── Step 2 · How to reach you ─────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div>
            <h6 className="eyebrow m-0 mb-2 text-accent">
              Step 2 · How to reach you
            </h6>
            <h2 className="m-0 text-[29px] leading-[1.08]">
              Channel, language, quiet hours
            </h2>
          </div>

          {/* Channels */}
          <div className="flex flex-col gap-3.5 rounded-[30px] bg-sand-surface p-5">
            <h6 className="eyebrow m-0 text-[rgba(32,30,29,0.55)]">Channels</h6>
            <div className="flex flex-col gap-2.5">
              {CHANNELS.map(({ id, label, detail, icon: Icon, iconClass }) => {
                const on = channels[id];
                return (
                  <div
                    key={id}
                    className={`flex items-center gap-3 rounded-[22px] bg-sand px-3.5 py-3 transition-opacity ${
                      on ? "" : "opacity-70"
                    }`}
                  >
                    <span
                      className={`grid h-[34px] w-[34px] flex-none place-items-center rounded-full ${iconClass}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-semibold">{label}</div>
                      <div className="mono truncate text-[11px] text-[rgba(32,30,29,0.55)]">
                        {detail}
                      </div>
                    </div>
                    <button
                      role="switch"
                      aria-checked={on}
                      aria-label={`${label} alerts`}
                      onClick={() => toggleChannel(id)}
                      className={`relative h-[22px] w-10 flex-none cursor-pointer rounded-full transition-colors ${
                        on ? "bg-accent" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`absolute top-[3px] h-4 w-4 rounded-full bg-white transition-[left] ${
                          on ? "left-[21px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Triggers + quiet hours + language */}
          <div className="flex flex-col gap-3.5 rounded-[30px] bg-sand-surface p-5">
            <h6 className="eyebrow m-0 text-[rgba(32,30,29,0.55)]">
              Warn me when…
            </h6>

            <div className="flex flex-col gap-2.5 text-[13.5px]">
              {TRIGGERS.map(({ id, label, note }) => {
                const on = triggers[id];
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-2.5 ${
                      on ? "" : "text-[rgba(32,30,29,0.55)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleTrigger(id)}
                      className="sr-only"
                    />
                    <span
                      className={`grid h-[17px] w-[17px] flex-none place-items-center rounded-md text-[10px] text-white ${
                        on
                          ? "bg-accent"
                          : "border-[1.5px] border-neutral-400"
                      }`}
                    >
                      {on ? "✓" : ""}
                    </span>
                    <span>
                      {label}
                      {note && (
                        <span className="mono ml-1.5 text-[10.5px]">{note}</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="h-px bg-divider" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold">Quiet hours</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="time"
                    value={quietFrom}
                    onChange={(e) => setQuietFrom(e.target.value)}
                    aria-label="Quiet hours start"
                    className="mono rounded-full border border-divider bg-sand px-3 py-1 text-[11.5px]"
                  />
                  <span className="mono text-[11.5px] text-[rgba(32,30,29,0.55)]">
                    –
                  </span>
                  <input
                    type="time"
                    value={quietTo}
                    onChange={(e) => setQuietTo(e.target.value)}
                    aria-label="Quiet hours end"
                    className="mono rounded-full border border-divider bg-sand px-3 py-1 text-[11.5px]"
                  />
                </div>
              </div>
              <span className="mono rounded-full bg-accent-100 px-3 py-1.5 text-[11px] text-accent-800">
                CRITICAL always breaks through
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 text-[13.5px] font-semibold">Language</div>
              <div
                className="mono inline-flex overflow-hidden rounded-full border border-divider text-xs"
                role="radiogroup"
                aria-label="Alert language"
              >
                {LANGUAGES.map(({ code, label }, i) => {
                  const selected = language === code;
                  return (
                    <button
                      key={code}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setLanguage(code)}
                      className={`cursor-pointer px-3 py-1.5 transition-colors ${
                        i > 0 ? "border-l border-divider" : ""
                      } ${
                        selected
                          ? "bg-accent text-sand"
                          : "hover:bg-[rgba(32,30,29,0.07)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="mt-1 w-full cursor-pointer rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-accent-600"
            >
              Save alert settings
            </button>
          </div>
        </section>

        {/* ── Step 3 · What arrives ─────────────────────────────── */}
        <AlertPreviewPanel />
      </div>
    </div>
  );
}
