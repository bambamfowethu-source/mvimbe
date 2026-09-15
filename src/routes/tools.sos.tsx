import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall, Siren, Users } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools/sos")({
  head: () => ({
    meta: [
      { title: "Emergency SOS — World Crime Unicorn" },
      {
        name: "description",
        content: "Hold to trigger an emergency SOS that alerts police, your contacts and nearby patrollers.",
      },
      { property: "og:title", content: "Emergency SOS — World Crime Unicorn" },
      {
        property: "og:description",
        content: "One-tap emergency help for police, contacts and nearby patrollers.",
      },
    ],
  }),
  component: SosScreen,
});

function SosScreen() {
  const [holding, setHolding] = React.useState(false);
  const [count, setCount] = React.useState(3);
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (!holding) {
      setCount(3);
      return;
    }
    if (count === 0) {
      setSent(true);
      setHolding(false);
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(id);
  }, [holding, count]);

  return (
    <AppShell>
      <ScreenHeader title="Emergency SOS" subtitle="Use only in a real emergency" back="/home" />

      <div className="mt-6 flex flex-col items-center">
        <button
          onPointerDown={() => !sent && setHolding(true)}
          onPointerUp={() => setHolding(false)}
          onPointerLeave={() => setHolding(false)}
          className="relative grid h-52 w-52 place-items-center rounded-full select-none"
          aria-label="Hold to send SOS"
        >
          <span className={cn("absolute inset-0 rounded-full border-2 border-alert", holding && "animate-pulse-ring")} />
          <span className="glow-alert absolute inset-4 rounded-full bg-gradient-to-b from-alert to-[oklch(0.4_0.2_18)]" />
          <span className="relative flex flex-col items-center text-alert-foreground">
            <Siren className="h-9 w-9" />
            <span className="mt-1 font-display text-2xl font-black tracking-widest">SOS</span>
            <span className="text-[11px] opacity-90">
              {sent ? "Help is on the way" : holding ? `Sending in ${count}…` : "Press and hold"}
            </span>
          </span>
        </button>

        {sent ? (
          <div className="glass mt-6 w-full animate-fade-in rounded-2xl p-4 text-sm">
            <p className="font-semibold text-safe">SOS broadcast sent</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Police dispatch, your emergency contacts and 4 patrollers within 3 km were notified with
              your live location.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-3 w-full rounded-xl border border-border py-2 text-xs font-semibold"
            >
              Cancel alert
            </button>
          </div>
        ) : null}
      </div>

      <h2 className="mt-8 mb-3 font-display text-sm font-bold tracking-widest text-muted-foreground">
        WHO GETS ALERTED
      </h2>
      <ul className="glass divide-y divide-border/70 overflow-hidden rounded-2xl text-sm">
        <li className="flex items-center gap-3 px-4 py-3">
          <PhoneCall className="h-4.5 w-4.5 shrink-0 text-alert" />
          <span className="min-w-0 flex-1 truncate">Local police dispatch</span>
        </li>
        <li className="flex items-center gap-3 px-4 py-3">
          <Users className="h-4.5 w-4.5 shrink-0 text-electric" />
          <span className="min-w-0 flex-1 truncate">3 emergency contacts</span>
        </li>
        <li className="flex items-center gap-3 px-4 py-3">
          <Siren className="h-4.5 w-4.5 shrink-0 text-neon" />
          <span className="min-w-0 flex-1 truncate">Patrollers within 3 km</span>
        </li>
      </ul>
    </AppShell>
  );
}
