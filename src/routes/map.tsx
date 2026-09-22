import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle2,
  Crosshair,
  Droplets,
  Gauge,
  MapPin,
  Radio,
  Send,
  ShieldAlert,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { Button } from "@/components/ui/button";
import { useWcu } from "@/lib/wcu/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Infrastructure Field Map — World Crime Unicorn" },
      {
        name: "description",
        content:
          "Pin water infrastructure faults and dispatch municipal field teams from one live map.",
      },
      { property: "og:title", content: "Infrastructure Field Map — World Crime Unicorn" },
      {
        property: "og:description",
        content: "Report stolen meters, missing boxes and bursts to municipal field teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapScreen,
});

type ViewMode = "field" | "dashboard";
type IssueKind = "Stolen Meter" | "Unmetered/No Box" | "Leak/Burst";
type AssetStatus = "stolen" | "missing" | "active";

type AssetPin = {
  id: string;
  status: AssetStatus;
  x: number;
  y: number;
  title: string;
  ward: string;
  updated: string;
};

const ASSET_PINS: AssetPin[] = [
  { id: "m1", status: "stolen", x: 24, y: 23, title: "Meter removed", ward: "Ward 87", updated: "12 min ago" },
  { id: "m2", status: "missing", x: 68, y: 18, title: "No meter box", ward: "Ward 117", updated: "31 min ago" },
  { id: "m3", status: "active", x: 49, y: 36, title: "Meter active", ward: "Ward 74", updated: "Checked today" },
  { id: "m4", status: "stolen", x: 77, y: 51, title: "Meter removed", ward: "Ward 88", updated: "1 hr ago" },
  { id: "m5", status: "active", x: 31, y: 58, title: "Meter active", ward: "Ward 90", updated: "Checked today" },
  { id: "m6", status: "missing", x: 57, y: 68, title: "Box damaged / missing", ward: "Ward 74", updated: "2 hrs ago" },
];

const pinTone: Record<AssetStatus, string> = {
  stolen: "bg-alert text-alert-foreground ring-alert/30",
  missing: "bg-warn text-neon-foreground ring-warn/30",
  active: "bg-safe text-neon-foreground ring-safe/30",
};

const ISSUE_ACTIONS: { label: IssueKind; icon: typeof Gauge; tone: string }[] = [
  { label: "Stolen Meter", icon: ShieldAlert, tone: "border-alert/60 bg-alert/15 text-alert" },
  { label: "Unmetered/No Box", icon: Gauge, tone: "border-warn/60 bg-warn/15 text-warn" },
  { label: "Leak/Burst", icon: Droplets, tone: "border-electric/60 bg-electric/15 text-neon" },
];

const STATS = [
  { label: "Total Unmetered Loss Estimate", value: "R 2.48M", note: "This quarter", icon: Zap, tone: "text-warn" },
  { label: "Stolen Meters Reported", value: "184", note: "+23 this week", icon: ShieldAlert, tone: "text-alert" },
  { label: "Dispatched Repairs", value: "139", note: "76% response rate", icon: Wrench, tone: "text-safe" },
] as const;

function MapScreen() {
  const { city } = useWcu();
  const [view, setView] = React.useState<ViewMode>("field");
  const [selected, setSelected] = React.useState<AssetPin | null>(null);
  const [issue, setIssue] = React.useState<IssueKind | null>(null);
  const [photoAdded, setPhotoAdded] = React.useState(false);
  const [located, setLocated] = React.useState(false);

  const openIssue = (nextIssue: IssueKind) => {
    setIssue(nextIssue);
    setPhotoAdded(false);
  };

  const locate = () => {
    setLocated(true);
    toast.success("Location pinned", { description: "GPS position captured for Ward 74." });
  };

  const dispatch = () => {
    toast.success("Location Pinned & Report Logged to Ward Dashboard", {
      description: "Municipal technician dispatch simulated successfully.",
    });
    setIssue(null);
  };

  return (
    <AppShell className="px-0">
      <div className="px-4">
        <ScreenHeader title="Infrastructure Monitor" subtitle={city} back="/home" />
        <div className="mb-3 grid grid-cols-2 rounded-lg border border-border bg-surface p-1" aria-label="View selection">
          <Button
            variant="ghost"
            onClick={() => setView("field")}
            className={cn("h-9 rounded-md text-xs", view === "field" && "bg-electric text-electric-foreground hover:bg-electric/90")}
          >
            <MapPin /> Field Worker View
          </Button>
          <Button
            variant="ghost"
            onClick={() => setView("dashboard")}
            className={cn("h-9 rounded-md text-xs", view === "dashboard" && "bg-electric text-electric-foreground hover:bg-electric/90")}
          >
            <Gauge /> Revenue Dashboard
          </Button>
        </div>
      </div>

      {view === "field" ? (
        <div className="animate-fade-in">
          <div className="relative min-h-[37rem] w-full overflow-hidden border-y border-border bg-surface">
            <div className="grid-map absolute inset-0 opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,color-mix(in_oklab,var(--alert)_18%,transparent),transparent_22%),radial-gradient(circle_at_70%_25%,color-mix(in_oklab,var(--warn)_18%,transparent),transparent_24%),radial-gradient(circle_at_48%_62%,color-mix(in_oklab,var(--safe)_14%,transparent),transparent_28%)]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path d="M0 18 L29 27 L56 20 L100 34" stroke="var(--border)" strokeWidth="1.2" fill="none" />
              <path d="M0 55 L35 43 L64 50 L100 42" stroke="var(--border)" strokeWidth="1.6" fill="none" />
              <path d="M17 0 L29 30 L22 100" stroke="var(--border)" strokeWidth="1.3" fill="none" />
              <path d="M78 0 L66 48 L84 100" stroke="var(--border)" strokeWidth="1.3" fill="none" />
            </svg>

            <div className="glass absolute top-3 left-3 z-10 flex flex-col gap-1.5 rounded-md px-3 py-2 text-[10px] font-semibold">
              <span className="mb-0.5 text-muted-foreground">ASSET STATUS</span>
              <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-alert" /> Stolen meters</span>
              <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-warn" /> Missing boxes</span>
              <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-safe" /> Active</span>
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={locate}
              className={cn("glass absolute top-3 right-3 z-10 h-11 w-11 rounded-md text-neon", located && "border-safe text-safe")}
              aria-label="Auto-Locate Me"
              title="Auto-Locate Me"
            >
              <Crosshair />
            </Button>

            <span className="absolute top-[38%] left-1/2 -translate-x-1/2 font-display text-[10px] text-foreground/40">
              {city.split(",")[0]?.toUpperCase()} WATER GRID
            </span>

            {ASSET_PINS.map((pin) => (
              <Button
                key={pin.id}
                size="icon"
                onClick={() => setSelected(pin)}
                className={cn(
                  "absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full p-0 ring-8 transition-transform hover:scale-110",
                  pinTone[pin.status],
                  selected?.id === pin.id && "scale-125",
                )}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                aria-label={`${pin.title}, ${pin.ward}`}
              >
                <MapPin />
              </Button>
            ))}

            {located ? (
              <div className="absolute top-[44%] left-[45%] z-20 -translate-x-1/2 -translate-y-1/2" aria-label="Your pinned location">
                <span className="animate-ping-slow absolute inset-0 rounded-full bg-neon/40" />
                <span className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-background bg-neon text-neon-foreground"><Crosshair className="h-4 w-4" /></span>
              </div>
            ) : null}

            {selected ? (
              <div className="glass absolute top-28 right-3 left-3 z-20 animate-fade-in rounded-md p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{selected.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{selected.ward} · {selected.updated}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setSelected(null)} className="h-7 w-7" aria-label="Close asset details"><X /></Button>
                </div>
              </div>
            ) : null}

            <div className="glass absolute inset-x-3 bottom-3 z-20 rounded-lg p-3 shadow-2xl">
              <div className="mb-3 flex items-center gap-2">
                <Radio className="h-4 w-4 text-neon" />
                <h2 className="font-display text-sm font-bold">Report Infrastructure Issue</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ISSUE_ACTIONS.map(({ label, icon: Icon, tone }) => (
                  <Button key={label} variant="outline" onClick={() => openIssue(label)} className={cn("h-20 min-w-0 flex-col gap-2 whitespace-normal rounded-md px-1 text-center text-[10px] leading-tight", tone)}>
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section className="animate-fade-in px-4 pt-1">
          <div className="mb-5 flex items-end justify-between border-b border-border pb-4">
            <div>
              <p className="text-xs font-semibold text-neon">LIVE MUNICIPAL OVERVIEW</p>
              <h2 className="mt-1 font-display text-xl font-bold">Revenue Protection</h2>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] text-safe"><i className="h-2 w-2 rounded-full bg-safe" /> Live</span>
          </div>
          <div className="space-y-3">
            {STATS.map(({ label, value, note, icon: Icon, tone }) => (
              <article key={label} className="glass grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-md p-4">
                <span className={cn("grid h-11 w-11 place-items-center rounded-md bg-surface-2", tone)}><Icon className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <div className="mt-1 flex items-end justify-between gap-2"><strong className="text-2xl">{value}</strong><span className="text-[11px] text-muted-foreground">{note}</span></div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between text-xs"><span className="font-semibold">Repair completion</span><span className="text-safe">76%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full w-3/4 rounded-full bg-safe" /></div>
          </div>
        </section>
      )}

      {issue ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={`${issue} verification`}>
          <div className="glass w-full max-w-sm animate-fade-in rounded-lg p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-neon">1-STEP VERIFICATION</p>
                <h2 className="mt-1 font-display text-lg font-bold">{issue}</h2>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setIssue(null)} aria-label="Close verification"><X /></Button>
            </div>

            <div className="mt-4 rounded-md border border-border bg-surface/70 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold"><Crosshair className="h-4 w-4 text-safe" /> GPS auto-captured</p>
              <p className="mt-1 font-mono text-sm text-foreground">-26.1457, 28.0419</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Ward 74 · accuracy ±8 m</p>
            </div>

            <Button variant="outline" onClick={() => { setPhotoAdded(true); toast.success("Photo attached", { description: "Demo evidence is ready for dispatch." }); }} className={cn("mt-3 h-24 w-full flex-col rounded-md border-dashed", photoAdded && "border-safe bg-safe/10 text-safe")}>
              {photoAdded ? <CheckCircle2 className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
              {photoAdded ? "Photo Ready" : "Upload Photo"}
              <span className="text-[10px] font-normal text-muted-foreground">{photoAdded ? "meter-evidence.jpg" : "Tap to add site evidence"}</span>
            </Button>

            <Button onClick={dispatch} className="mt-4 h-12 w-full rounded-md bg-electric font-bold text-electric-foreground hover:bg-electric/90">
              <Send /> Dispatch Municipal Tech
            </Button>
            <p className="mt-3 text-center text-[10px] text-muted-foreground">Demo mode · no external request will be sent</p>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
