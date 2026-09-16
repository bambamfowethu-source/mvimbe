import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Clock, Navigation, Route as RouteIcon } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { PATROL_CHECKINS, ROLES } from "@/lib/wcu/data";
import { useWcu } from "@/lib/wcu/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools/patrol")({
  head: () => ({
    meta: [
      { title: "Patrol Tools — World Crime Unicorn" },
      {
        name: "description",
        content: "Patrol routes, timed check-ins and shift progress for patrollers and security teams.",
      },
      { property: "og:title", content: "Patrol Tools — World Crime Unicorn" },
      {
        property: "og:description",
        content: "Navigation, check-ins and mission updates for active patrol shifts.",
      },
    ],
  }),
  component: PatrolTools,
});

const ROUTE_BY_ROLE: Record<string, string> = {
  citizen: "Neighbourhood walk · self check-ins",
  patroller: "Shift JHB-07 · Day route",
  police: "Sector 4 response route",
  security: "Client sites · contract route",
};

function PatrolTools() {
  const { role } = useWcu();
  const [done, setDone] = React.useState<string[]>(
    PATROL_CHECKINS.filter((c) => c.status === "Complete").map((c) => c.id),
  );
  const [onShift, setOnShift] = React.useState(true);
  const progress = Math.round((done.length / PATROL_CHECKINS.length) * 100);
  const roleLabel = ROLES.find((r) => r.id === role)?.label ?? "Citizen";

  return (
    <AppShell>
      <ScreenHeader
        title="Patrol Tools"
        subtitle={`${roleLabel} · ${ROUTE_BY_ROLE[role ?? "citizen"]}`}
        back="/home"
      />

      <button
        onClick={() => setOnShift((v) => !v)}
        className={cn(
          "mb-4 w-full rounded-2xl border py-3 text-sm font-bold",
          onShift ? "border-safe/60 bg-safe/10 text-safe" : "border-border text-muted-foreground",
        )}
      >
        {onShift ? "On duty — tap to end shift" : "Off duty — tap to start shift"}
      </button>

      <div className="glass rounded-3xl p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Route progress</p>
            <p className="text-xs text-muted-foreground">
              {done.length} of {PATROL_CHECKINS.length} check-ins complete
            </p>
          </div>
          <span className="shrink-0 font-display text-xl font-bold text-neon">{progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gradient-to-r from-neon to-electric" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="glass flex items-center gap-2 rounded-2xl p-3 text-sm">
          <RouteIcon className="h-4.5 w-4.5 shrink-0 text-electric" />
          <span className="min-w-0 truncate">14.2 km covered</span>
        </div>
        <div className="glass flex items-center gap-2 rounded-2xl p-3 text-sm">
          <Clock className="h-4.5 w-4.5 shrink-0 text-electric" />
          <span className="min-w-0 truncate">4h 20m on shift</span>
        </div>
      </div>

      <h2 className="mt-6 mb-3 font-display text-sm font-bold tracking-widest text-muted-foreground">
        CHECK-IN POINTS
      </h2>
      <ul className="glass divide-y divide-border/70 overflow-hidden rounded-2xl">
        {PATROL_CHECKINS.map((c) => {
          const complete = done.includes(c.id);
          return (
            <li key={c.id}>
              <button
                onClick={() =>
                  setDone((d) => (complete ? d.filter((x) => x !== c.id) : [...d, c.id]))
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                {complete ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-safe" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm", complete && "text-muted-foreground line-through")}>
                    {c.point}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{c.time}</span>
                </span>
                <Navigation className="h-4 w-4 shrink-0 text-neon" />
              </button>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
