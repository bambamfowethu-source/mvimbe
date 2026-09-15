import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Ban,
  Camera,
  CheckCircle2,
  CreditCard,
  Eye,
  Hand,
  MapPin,
  Mic,
  MoreHorizontal,
  SprayCan,
  Target,
  UserMinus,
  Video,
  Wallet,
} from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { CRIME_CATEGORIES, type CrimeCategory } from "@/lib/wcu/data";
import { useWcu } from "@/lib/wcu/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Crime — World Crime Unicorn" },
      {
        name: "description",
        content:
          "Report theft, assault, robbery and more in seconds with photo, video or voice evidence and GPS location tagging.",
      },
      { property: "og:title", content: "Report a Crime — World Crime Unicorn" },
      {
        property: "og:description",
        content: "Fast, guided crime reporting with evidence attachments and location tagging.",
      },
    ],
  }),
  component: ReportScreen,
});

const CATEGORY_ICONS: Record<CrimeCategory, typeof Wallet> = {
  Theft: Wallet,
  Assault: Hand,
  Robbery: Target,
  Kidnapping: UserMinus,
  Fraud: CreditCard,
  Vandalism: SprayCan,
  "Suspicious Activity": Eye,
  Other: MoreHorizontal,
};

function ReportScreen() {
  const { city, addReport } = useWcu();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [category, setCategory] = React.useState<CrimeCategory | null>(null);
  const [description, setDescription] = React.useState("");
  const [attachments, setAttachments] = React.useState<string[]>([]);
  const [location, setLocation] = React.useState(city);
  const [locating, setLocating] = React.useState(false);
  const [ref, setRef] = React.useState<string | null>(null);

  const toggleAttachment = (kind: string) =>
    setAttachments((a) => (a.includes(kind) ? a.filter((x) => x !== kind) : [...a, kind]));

  const useGps = () => {
    setLocating(true);
    if (!("geolocation" in navigator)) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  const submit = () => {
    if (!category) return;
    const report = addReport({ category, description, attachments, location });
    setRef(report.ref);
  };

  if (ref) {
    return (
      <AppShell>
        <ScreenHeader title="Report submitted" back="/home" />
        <div className="glass mt-8 flex flex-col items-center rounded-3xl p-6 text-center">
          <CheckCircle2 className="h-14 w-14 text-safe" />
          <h2 className="mt-4 font-display text-lg font-bold">Alert sent</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nearby patrols and responders have been notified. Keep this reference for follow-up.
          </p>
          <p className="mt-4 rounded-xl bg-surface-2 px-4 py-2 font-display text-base tracking-widest text-neon">
            {ref}
          </p>
          <Link
            to="/map"
            className="mt-6 w-full rounded-2xl bg-electric py-3 text-sm font-semibold text-electric-foreground"
          >
            See it on the live map
          </Link>
          <Link to="/home" className="mt-3 text-xs text-muted-foreground">
            Back to dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScreenHeader
        title="Report Crime"
        subtitle={`Step ${step} of 3`}
        back="/home"
      />

      <div className="mb-5 flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={cn("h-1 flex-1 rounded-full", s <= step ? "bg-neon" : "bg-surface-2")}
          />
        ))}
      </div>

      {step === 1 ? (
        <>
          <p className="mb-3 text-sm text-muted-foreground">What are you reporting?</p>
          <div className="grid grid-cols-2 gap-3">
            {CRIME_CATEGORIES.map(({ id }) => {
              const Icon = CATEGORY_ICONS[id];
              const on = category === id;
              return (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={cn(
                    "flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-surface/70 px-2 text-center",
                    on ? "border-neon glow-neon" : "border-border",
                  )}
                >
                  <Icon className={cn("h-6 w-6", on ? "text-neon" : "text-foreground/80")} />
                  <span className="text-xs font-semibold">{id}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <label htmlFor="desc" className="mb-2 block text-sm text-muted-foreground">
            What happened?
          </label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe the incident, suspects and direction of travel…"
            className="w-full rounded-2xl border border-border bg-surface/70 p-3 text-sm outline-none focus:border-neon"
          />
          <p className="mt-5 mb-2 text-sm text-muted-foreground">Add evidence</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "Photo", icon: Camera },
              { id: "Video", icon: Video },
              { id: "Voice", icon: Mic },
            ].map(({ id, icon: Icon }) => {
              const on = attachments.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleAttachment(id)}
                  className={cn(
                    "flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-surface/70",
                    on ? "border-neon text-neon" : "border-border text-foreground/80",
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-semibold">{on ? `${id} added` : id}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Evidence capture is simulated in this preview — nothing is uploaded.
          </p>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <p className="mb-2 text-sm text-muted-foreground">Location tag</p>
          <div className="glass flex items-center gap-3 rounded-2xl p-3">
            <MapPin className="h-5 w-5 shrink-0 text-neon" />
            <span className="min-w-0 flex-1 truncate text-sm">{location}</span>
          </div>
          <button
            onClick={useGps}
            className="mt-3 w-full rounded-2xl border border-electric/60 py-3 text-sm font-semibold text-electric"
          >
            {locating ? "Getting your location…" : "Use my current GPS location"}
          </button>

          <div className="glass mt-6 space-y-2 rounded-2xl p-4 text-sm">
            <p className="font-display text-sm font-bold tracking-wide">Summary</p>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Category</span>
              <span className="truncate font-semibold">{category}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Evidence</span>
              <span className="truncate font-semibold">
                {attachments.length ? attachments.join(", ") : "None"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Description</span>
              <span className="truncate font-semibold">{description ? "Added" : "None"}</span>
            </div>
          </div>
        </>
      ) : null}

      <div className="mt-8 flex gap-3">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold"
          >
            Back
          </button>
        ) : null}
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !category}
            className="glow-electric flex-[2] rounded-2xl bg-gradient-to-r from-electric to-violet py-3 text-sm font-bold tracking-wide text-electric-foreground disabled:opacity-40"
          >
            Next
          </button>
        ) : (
          <button
            onClick={submit}
            className="glow-alert flex-[2] rounded-2xl bg-alert py-3 text-sm font-bold tracking-wide text-alert-foreground"
          >
            Submit report
          </button>
        )}
      </div>

      {step === 1 && !category ? (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Ban className="h-3.5 w-3.5" /> Choose a category to continue
        </p>
      ) : null}
    </AppShell>
  );
}
