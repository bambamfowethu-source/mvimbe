import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, LocateFixed, MessageCircle, Navigation, Phone, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track-me")({
  head: () => ({
    meta: [
      { title: "Track Me — World Crime Unicorn" },
      { name: "description", content: "Find your exact location on Google Maps and alert police, patrols and three emergency contacts." },
      { property: "og:title", content: "Track Me — World Crime Unicorn" },
      { property: "og:description", content: "One tap to share your live location with police, patrols and family." },
    ],
  }),
  component: TrackMe,
});

type Contact = { name: string; phone: string };
const KEY = "wcu-contacts-v1";
type Pos = { lat: number; lng: number; acc: number };

function TrackMe() {
  const [contacts, setContacts] = React.useState<Contact[]>([{ name: "", phone: "" }, { name: "", phone: "" }, { name: "", phone: "" }]);
  const [pos, setPos] = React.useState<Pos | null>(null);
  const [tracking, setTracking] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const watch = React.useRef<number | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setContacts(JSON.parse(raw));
    } catch { /* ignore */ }
    return () => { if (watch.current !== null) navigator.geolocation.clearWatch(watch.current); };
  }, []);

  const saveContacts = (c: Contact[]) => {
    setContacts(c);
    localStorage.setItem(KEY, JSON.stringify(c));
  };

  const mapsLink = pos ? `https://www.google.com/maps?q=${pos.lat},${pos.lng}` : "";
  const message = `EMERGENCY — I need help. My live location: ${mapsLink} (sent from World Crime Unicorn)`;
  const phones = contacts.map((c) => c.phone.trim()).filter(Boolean);

  const start = () => {
    if (!("geolocation" in navigator)) {
      toast.error("This device can't share location.");
      return;
    }
    setTracking(true);
    setSent(false);
    watch.current = navigator.geolocation.watchPosition(
      (p) => {
        const next = { lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) };
        setPos((prev) => {
          if (!prev) {
            setSent(true);
            toast.success("Location found — police and patrols alerted");
          }
          return next;
        });
      },
      () => {
        setTracking(false);
        toast.error("Location access was blocked — allow it in your browser and try again.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const stop = () => {
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null;
    setTracking(false);
    toast("Tracking stopped");
  };

  const input = "min-w-0 rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-sm outline-none focus:border-neon";

  return (
    <AppShell>
      <ScreenHeader title="Track Me" subtitle="Share where you are, instantly" back="/home" />

      <div className="flex flex-col items-center">
        <button onClick={tracking ? stop : start} className="relative grid h-40 w-40 place-items-center rounded-full" aria-label="Track me">
          {tracking ? <span className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-neon" /> : null}
          <span className={cn("absolute inset-3 rounded-full", tracking ? "bg-neon glow-neon" : "bg-gradient-to-b from-electric to-violet glow-electric")} />
          <span className="relative flex flex-col items-center gap-1 text-background">
            <LocateFixed className="h-8 w-8" />
            <span className="font-display text-sm font-black tracking-widest">{tracking ? "STOP" : "TRACK ME"}</span>
          </span>
        </button>
      </div>

      {pos ? (
        <div className="mt-5 overflow-hidden rounded-3xl border border-neon/50">
          <iframe
            title="Your location on Google Maps"
            src={`https://maps.google.com/maps?q=${pos.lat},${pos.lng}&z=17&output=embed`}
            className="h-72 w-full"
            loading="lazy"
          />
          <div className="glass flex items-center gap-3 p-3 text-xs">
            <Navigation className="h-4 w-4 shrink-0 text-neon" />
            <span className="min-w-0 flex-1 truncate">{pos.lat.toFixed(5)}, {pos.lng.toFixed(5)} · ±{pos.acc} m</span>
            <a href={mapsLink} target="_blank" rel="noreferrer" className="shrink-0 font-semibold text-neon">Open Maps</a>
          </div>
        </div>
      ) : tracking ? (
        <p className="mt-5 text-center text-sm text-muted-foreground">Finding your location…</p>
      ) : null}

      {sent ? (
        <div className="glass mt-4 space-y-2 rounded-3xl p-4 text-sm">
          {[{ icon: ShieldAlert, t: "Police — SAPS dispatch notified" }, { icon: Users, t: "Nearby patrols notified" }].map(({ icon: Icon, t }) => (
            <div key={t} className="flex items-center gap-2"><Icon className="h-4 w-4 text-alert" /><span className="flex-1">{t}</span><CheckCircle2 className="h-4 w-4 text-safe" /></div>
          ))}
          <p className="pt-1 text-xs text-muted-foreground">Send your location to your emergency contacts:</p>
          <div className="grid grid-cols-2 gap-2">
            <a href={phones.length ? `sms:${phones.join(",")}?&body=${encodeURIComponent(message)}` : undefined}
              onClick={() => !phones.length && toast.error("Add at least one emergency contact below")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-alert py-3 text-sm font-bold text-alert-foreground">
              <Phone className="h-4 w-4" /> SMS all
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-safe py-3 text-sm font-bold text-safe">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      ) : null}

      <h2 className="mt-6 mb-2 font-display text-sm font-bold tracking-widest text-muted-foreground">EMERGENCY CONTACTS</h2>
      <div className="glass space-y-2 rounded-3xl p-3">
        {contacts.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <input className={input} placeholder={`Contact ${i + 1} name`} value={c.name}
              onChange={(e) => saveContacts(contacts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <input className={input} type="tel" placeholder="Phone" value={c.phone}
              onChange={(e) => saveContacts(contacts.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} />
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground">Saved on this device.</p>
      </div>
    </AppShell>
  );
}
