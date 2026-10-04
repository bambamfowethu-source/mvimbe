import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  Bus,
  CheckCircle2,
  ChevronRight,
  Fan,
  Fence,
  MapPinned,
  RadioTower,
  ShieldAlert,
  TriangleAlert,
  Waves,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mine")({
  head: () => ({
    meta: [
      { title: "MINE Safety — World Crime Unicorn" },
      {
        name: "description",
        content: "Eight test-ready mine safety, security, emergency and compliance solutions.",
      },
      { property: "og:title", content: "MINE Safety — World Crime Unicorn" },
      {
        property: "og:description",
        content: "Monitor mine risks, test alerts and capture GPS-ready safety records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MineScreen,
});

type Tone = "safe" | "neon" | "electric" | "warn" | "alert";
type Solution = {
  id: string;
  title: string;
  short: string;
  detail: string;
  action: string;
  confirmation: string;
  status: string;
  tone: Tone;
  icon: React.ComponentType<{ className?: string }>;
};

const SOLUTIONS: Solution[] = [
  {
    id: "fence",
    title: "Fence & Cable Theft Protection",
    short: "24/7 perimeter monitoring and tamper alerts",
    detail: "Tests a perimeter breach alert with the affected fence zone and a patrol-ready incident record.",
    action: "Test tamper alert",
    confirmation: "Fence Zone 4 alert logged and patrol notified",
    status: "All zones secure",
    tone: "neon",
    icon: Fence,
  },
  {
    id: "fans",
    title: "Ventilation Fans Security",
    short: "Monitor fan operation and restricted access",
    detail: "Checks fan availability and demonstrates a warning when a secured ventilation point is accessed.",
    action: "Run fan check",
    confirmation: "Ventilation check complete — all monitored fans online",
    status: "12 fans online",
    tone: "electric",
    icon: Fan,
  },
  {
    id: "tailings",
    title: "Tailings Dam Early Warning",
    short: "Water-level and structural-risk monitoring",
    detail: "Runs a simulated sensor health check for level movement, wall stability and escalation readiness.",
    action: "Test early warning",
    confirmation: "Tailings sensors tested — control room check logged",
    status: "Risk level normal",
    tone: "safe",
    icon: Waves,
  },
  {
    id: "illegal-mining",
    title: "Illegal Mining Alert",
    short: "Live reports with patrol dispatch support",
    detail: "Captures a test Zama Zama report and prepares its location for mine security and patrol response.",
    action: "Log test report",
    confirmation: "Illegal mining report logged for patrol review",
    status: "Patrol ready",
    tone: "alert",
    icon: TriangleAlert,
  },
  {
    id: "panic",
    title: "Women Mine Workers Panic Support",
    short: "Discreet panic support with rapid response",
    detail: "Demonstrates a discreet duress alert routed to the mine response desk without a public alarm.",
    action: "Test discreet alert",
    confirmation: "Discreet support alert received by the response desk",
    status: "Response team ready",
    tone: "alert",
    icon: ShieldAlert,
  },
  {
    id: "evacuation",
    title: "Emergency Evacuation Mass Alert",
    short: "Instant alerts for guided evacuation",
    detail: "Sends a safe test notice to demonstrate workforce-wide evacuation messaging and acknowledgement.",
    action: "Send test alert",
    confirmation: "Evacuation test sent — acknowledgements now tracking",
    status: "486 recipients ready",
    tone: "warn",
    icon: BellRing,
  },
  {
    id: "truck",
    title: "Contractor Truck Anti-Hijack",
    short: "GPS tracking and hijack-alert coordination",
    detail: "Tests a contractor vehicle check-in, route position and control-room escalation workflow.",
    action: "Test vehicle check-in",
    confirmation: "Truck CT-24 GPS check-in verified",
    status: "18 vehicles tracked",
    tone: "electric",
    icon: Bus,
  },
  {
    id: "slp",
    title: "SLP Proof with GPS Reports",
    short: "Geo-verified Social Labour Plan evidence",
    detail: "Creates a demo GPS-stamped field record suitable for review and audit preparation.",
    action: "Create GPS proof",
    confirmation: "GPS proof saved to the SLP audit record",
    status: "Audit-ready",
    tone: "safe",
    icon: MapPinned,
  },
];

const toneClass: Record<Tone, string> = {
  safe: "border-safe/50 bg-safe/10 text-safe",
  neon: "border-neon/50 bg-neon/10 text-neon",
  electric: "border-electric/50 bg-electric/10 text-electric",
  warn: "border-warn/50 bg-warn/10 text-warn",
  alert: "border-alert/50 bg-alert/10 text-alert",
};

function MineScreen() {
  const [selected, setSelected] = React.useState<Solution | null>(null);
  const [tested, setTested] = React.useState<string[]>([]);

  const runTest = (solution: Solution) => {
    setTested((items) => (items.includes(solution.id) ? items : [...items, solution.id]));
    toast.success(solution.confirmation, {
      description: "Demo event only — no external control-room service was contacted.",
    });
    setSelected(null);
  };

  return (
    <AppShell>
      <ScreenHeader title="MINE" subtitle="Safety operations test centre" back="/home" />

      <section className="glass relative overflow-hidden rounded-2xl p-4">
        <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-warn/15 to-transparent" aria-hidden />
        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-warn/50 bg-warn/10 text-warn">
            <RadioTower className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold">Mine safety network</p>
            <p className="mt-1 text-xs text-muted-foreground">Eight connected safety and compliance workflows</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-safe">
            <span className="h-2 w-2 rounded-full bg-safe" /> LIVE
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-xl bg-surface-2/70 p-2"><b className="block text-base text-foreground">8/8</b><span className="text-muted-foreground">Systems ready</span></div>
          <div className="rounded-xl bg-surface-2/70 p-2"><b className="block text-base text-foreground">{tested.length}/8</b><span className="text-muted-foreground">Tests complete</span></div>
        </div>
      </section>

      <h2 className="mt-6 mb-3 font-display text-sm font-bold text-muted-foreground">SAFETY SOLUTIONS</h2>
      <div className="grid grid-cols-2 gap-3">
        {SOLUTIONS.map((solution, index) => {
          const Icon = solution.icon;
          const complete = tested.includes(solution.id);
          return (
            <Button
              key={solution.id}
              variant="outline"
              onClick={() => setSelected(solution)}
              className="glass h-auto min-h-44 whitespace-normal rounded-2xl p-3 text-left hover:bg-surface-2"
            >
              <span className="flex h-full w-full flex-col items-start">
                <span className="flex w-full items-start justify-between gap-2">
                  <span className={cn("grid h-10 w-10 place-items-center rounded-xl border", toneClass[solution.tone])}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {complete ? <CheckCircle2 className="h-4 w-4 text-safe" /> : <span className="text-[11px] text-muted-foreground">0{index + 1}</span>}
                </span>
                <span className="mt-3 block text-sm font-bold leading-snug text-foreground">{solution.title}</span>
                <span className="mt-1 block text-[11px] font-normal leading-relaxed text-muted-foreground">{solution.short}</span>
                <span className="mt-auto flex w-full items-center justify-between pt-3 text-[11px] font-semibold text-neon">
                  {complete ? "Tested" : "Open"}<ChevronRight className="h-3.5 w-3.5" />
                </span>
              </span>
            </Button>
          );
        })}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="glass w-[calc(100%-2rem)] rounded-2xl border-border p-5">
          {selected ? (
            <>
              <DialogHeader className="text-left">
                <span className={cn("mb-2 grid h-11 w-11 place-items-center rounded-xl border", toneClass[selected.tone])}>
                  <selected.icon className="h-5 w-5" />
                </span>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>{selected.detail}</DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-border bg-surface-2/60 p-3 text-xs">
                <span className="text-muted-foreground">Current status</span>
                <p className="mt-1 flex items-center gap-2 font-semibold text-safe"><span className="h-2 w-2 rounded-full bg-safe" />{selected.status}</p>
              </div>
              <DialogFooter>
                <Button onClick={() => runTest(selected)} className="min-h-12 w-full rounded-xl bg-electric font-bold text-electric-foreground">
                  {selected.action}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}