import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Crosshair, Layers, Navigation, ShieldCheck, X } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { MAP_PINS, type MapPin as Pin, type PinKind } from "@/lib/wcu/data";
import { useWcu } from "@/lib/wcu/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Crime Map — World Crime Unicorn" },
      {
        name: "description",
        content:
          "See crime hotspots, active patrols and safe zones near you in real time on the live map.",
      },
      { property: "og:title", content: "Live Crime Map — World Crime Unicorn" },
      {
        property: "og:description",
        content: "Real-time crime hotspots, patrol locations and safe zones around you.",
      },
    ],
  }),
  component: MapScreen,
});

const FILTERS: { id: PinKind; label: string; tone: string }[] = [
  { id: "hotspot", label: "Crime Hotspots", tone: "alert" },
  { id: "patrol", label: "Patrols", tone: "electric" },
  { id: "safe", label: "Safe Zones", tone: "safe" },
];

const pinTone: Record<PinKind, string> = {
  hotspot: "bg-alert text-alert-foreground",
  patrol: "bg-electric text-electric-foreground",
  safe: "bg-safe text-neon-foreground",
};

const pinIcon: Record<PinKind, typeof AlertTriangle> = {
  hotspot: AlertTriangle,
  patrol: Navigation,
  safe: ShieldCheck,
};

function MapScreen() {
  const { city, reports } = useWcu();
  const [active, setActive] = React.useState<PinKind[]>(["hotspot", "patrol", "safe"]);
  const [selected, setSelected] = React.useState<Pin | null>(MAP_PINS[0] ?? null);

  const reportPins: Pin[] = reports.map((r) => ({
    id: r.id,
    kind: "hotspot",
    x: r.x,
    y: r.y,
    title: `${r.category} — your report`,
    detail: r.description || "Submitted from this device.",
    distanceKm: 0.3,
    ago: "Just now",
    severity: "high",
  }));

  const pins = [...MAP_PINS, ...reportPins].filter((p) => active.includes(p.kind));

  const toggle = (id: PinKind) =>
    setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <AppShell className="px-0">
      <div className="px-4">
        <ScreenHeader title="Live Map" subtitle={city} back="/home" />
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => toggle(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              active.includes(f.id)
                ? f.tone === "alert"
                  ? "border-alert bg-alert/20 text-alert"
                  : f.tone === "electric"
                    ? "border-electric bg-electric/20 text-electric"
                    : "border-safe bg-safe/20 text-safe"
                : "border-border bg-surface text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative mx-4 h-[26rem] overflow-hidden rounded-3xl border border-border bg-[oklch(0.19_0.04_255)]">
        <div className="grid-map absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 45%, color-mix(in oklab, var(--electric) 16%, transparent), transparent 70%)",
          }}
        />
        {/* stylised roads */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 60 L38 44 L62 52 L100 30" stroke="var(--border)" strokeWidth="1.2" fill="none" />
          <path d="M20 0 L34 44 L28 100" stroke="var(--border)" strokeWidth="1.2" fill="none" />
          <path d="M78 0 L64 50 L82 100" stroke="var(--border)" strokeWidth="1.2" fill="none" />
          <path d="M0 22 L44 30 L100 16" stroke="var(--border)" strokeWidth="0.8" fill="none" />
        </svg>

        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-xs tracking-[0.3em] text-foreground/40">
          {city.split(",")[0]?.toUpperCase()}
        </span>

        {pins.map((p) => {
          const Icon = pinIcon[p.kind];
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              aria-label={p.title}
            >
              {p.kind === "hotspot" && p.severity === "high" ? (
                <span className="animate-ping-slow absolute inset-0 rounded-full bg-alert/40" />
              ) : null}
              <span
                className={cn(
                  "relative grid h-8 w-8 place-items-center rounded-full ring-2 ring-background transition-transform",
                  pinTone[p.kind],
                  selected?.id === p.id && "scale-125",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
            </button>
          );
        })}

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button className="glass grid h-9 w-9 place-items-center rounded-xl text-neon" aria-label="Centre on me">
            <Crosshair className="h-4 w-4" />
          </button>
          <button className="glass grid h-9 w-9 place-items-center rounded-xl text-neon" aria-label="Map layers">
            <Layers className="h-4 w-4" />
          </button>
        </div>

        {selected ? (
          <div className="glass absolute inset-x-3 bottom-3 animate-fade-in rounded-2xl p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                    selected.kind === "hotspot"
                      ? "bg-alert/20 text-alert"
                      : selected.kind === "patrol"
                        ? "bg-electric/20 text-electric"
                        : "bg-safe/20 text-safe",
                  )}
                >
                  {React.createElement(pinIcon[selected.kind], { className: "h-4 w-4" })}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {selected.kind === "hotspot" ? "High Alert Area" : selected.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{selected.detail}</p>
                  <p className="mt-1 text-[11px] text-neon">
                    {selected.distanceKm.toFixed(1)} km away · {selected.ago}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 text-muted-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button className="mt-3 w-full rounded-xl bg-electric/25 py-2 text-xs font-semibold text-neon">
              View Details
            </button>
          </div>
        ) : null}
      </div>

      <p className="px-4 pt-3 text-xs text-muted-foreground">
        Tap any pin for incident details. Filters control what is shown on the map.
      </p>
    </AppShell>
  );
}
