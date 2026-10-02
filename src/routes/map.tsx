import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Navigation, ShieldCheck, Siren, X } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { MAP_PINS, type MapPin, type PinKind } from "@/lib/wcu/data";
import { useWcu } from "@/lib/wcu/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Crime Map — World Crime Unicorn" },
      { name: "description", content: "Live crime hotspots, patrols and safe zones near you." },
      { property: "og:title", content: "Live Crime Map — World Crime Unicorn" },
      { property: "og:description", content: "See hotspots, patrols and safe zones on a live map." },
    ],
  }),
  component: MapScreen,
});

const FILTERS: { id: PinKind; label: string; dot: string }[] = [
  { id: "hotspot", label: "Crime Hotspots", dot: "bg-alert" },
  { id: "patrol", label: "Patrols", dot: "bg-electric" },
  { id: "safe", label: "Safe Zones", dot: "bg-safe" },
];

function MapScreen() {
  const { reports } = useWcu();
  const [on, setOn] = React.useState<PinKind[]>(["hotspot", "patrol", "safe"]);
  const [sel, setSel] = React.useState<MapPin | null>(null);
  const pins: MapPin[] = [
    ...MAP_PINS,
    ...reports.map((r) => ({
      id: r.id, kind: "hotspot" as const, x: r.x, y: r.y, title: `Your report: ${r.category}`,
      detail: r.description || r.location, distanceKm: 0, ago: new Date(r.createdAt).toLocaleTimeString(), severity: "medium" as const,
    })),
  ].filter((p) => on.includes(p.kind));

  return (
    <AppShell>
      <ScreenHeader title="Live Map" subtitle="Tap a pin for details" back="/home" />
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setOn((o) => (o.includes(f.id) ? o.filter((x) => x !== f.id) : [...o, f.id]))}
            className={cn("flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold", on.includes(f.id) ? "border-neon text-foreground" : "border-border text-muted-foreground")}
          >
            <span className={cn("h-2 w-2 rounded-full", f.dot)} /> {f.label}
          </button>
        ))}
      </div>
      <div className="glass relative h-[460px] overflow-hidden rounded-3xl bg-surface">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {pins.map((p) => {
          const Icon = p.kind === "safe" ? ShieldCheck : p.kind === "patrol" ? Navigation : Siren;
          return (
            <button key={p.id} onClick={() => setSel(p)} style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={cn("absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-background shadow-lg",
                p.kind === "safe" ? "bg-safe text-background" : p.kind === "patrol" ? "bg-electric text-electric-foreground" : "bg-alert text-alert-foreground glow-alert")}
              aria-label={p.title}>
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        <Link to="/track-me" className="absolute top-3 right-3 rounded-full bg-neon px-3 py-1.5 text-xs font-bold text-background">Track Me</Link>
      </div>
      {sel ? (
        <div className="glass mt-3 animate-fade-in rounded-3xl p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="min-w-0">
              <p className="font-display text-sm font-bold">{sel.title}</p>
              <p className="text-xs text-muted-foreground">{sel.distanceKm ? `${sel.distanceKm} km away · ` : ""}{sel.ago}</p>
            </div>
            <button onClick={() => setSel(null)} aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <p className="mt-2 text-sm">{sel.detail}</p>
        </div>
      ) : null}
    </AppShell>
  );
}
