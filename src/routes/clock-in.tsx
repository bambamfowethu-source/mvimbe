import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Camera, CheckCircle2, Eye, History, Loader2, MapPin, MoveVertical, ScanFace } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { cn } from "@/lib/utils";
import {
  type ClockInEvent,
  getDeviceId,
  getIpAddress,
  gpsAcceptable,
  livenessScore,
  MAX_GPS_ACCURACY_M,
  MIN_LIVENESS,
  saveClockIn,
} from "@/lib/clockin/events";

export const Route = createFileRoute("/clock-in")({
  head: () => ({
    meta: [
      { title: "Biometric Clock-In — World Crime Unicorn" },
      { name: "description", content: "Face and liveness verified shift clock-in with GPS for patrollers and security." },
      { property: "og:title", content: "Biometric Clock-In — World Crime Unicorn" },
      { property: "og:description", content: "Clock in to a patrol shift with face, blink/nod liveness and GPS proof." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClockIn,
});

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const ear = (p: Pt[]) => (dist(p[1], p[5]) + dist(p[2], p[4])) / (2 * dist(p[0], p[3]));

function ClockIn() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = React.useState<string | null>(null);
  const [face, setFace] = React.useState(false);
  const [blinked, setBlinked] = React.useState(false);
  const [nodded, setNodded] = React.useState(false);
  const [confidence, setConfidence] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [gpsError, setGpsError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ClockInEvent | null>(null);
  const live = React.useRef({ eyesClosed: false, noseMin: 1, noseMax: 0, blinked: false, nodded: false, conf: [] as number[] });

  const score = livenessScore(blinked, nodded, confidence);
  const canClock = face && score >= MIN_LIVENESS && !busy;

  React.useEffect(() => {
    if (result) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    (async () => {
      if (!window.isSecureContext) {
        setError("Clock-in needs a secure (HTTPS) connection for camera and GPS.");
        setStatus("error");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        const faceapi = await import("@vladmandic/face-api");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        if (cancelled) return;
        setStatus("ready");
        const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
        const loop = async () => {
          if (cancelled) return;
          const canvas = canvasRef.current;
          if (video.readyState >= 2 && canvas) {
            const det = await faceapi.detectSingleFace(video, opts).withFaceLandmarks(true);
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setFace(!!det);
            if (det) {
              const b = det.detection.box;
              const s = live.current;
              ctx.strokeStyle = s.blinked && s.nodded ? "#3ddc84" : "#22d3ee";
              ctx.lineWidth = 3;
              ctx.strokeRect(b.x, b.y, b.width, b.height);
              const pts = det.landmarks.positions;
              const e = (ear(pts.slice(36, 42)) + ear(pts.slice(42, 48))) / 2;
              if (e < 0.21) s.eyesClosed = true;
              else if (s.eyesClosed && e > 0.25) {
                s.eyesClosed = false;
                if (!s.blinked) { s.blinked = true; setBlinked(true); }
              }
              if (s.blinked) {
                const ny = (pts[30].y - b.y) / b.height;
                s.noseMin = Math.min(s.noseMin, ny);
                s.noseMax = Math.max(s.noseMax, ny);
                if (!s.nodded && s.noseMax - s.noseMin > 0.08) { s.nodded = true; setNodded(true); }
              }
              s.conf = [...s.conf.slice(-29), det.detection.score];
              setConfidence(s.conf.reduce((a, c) => a + c, 0) / s.conf.length);
            }
          }
          raf = requestAnimationFrame(() => void loop());
        };
        void loop();
      } catch (err) {
        setError(err instanceof Error && err.name === "NotAllowedError" ? "Camera permission was denied." : "Camera or face models could not start.");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [result]);

  const clockIn = () => {
    setBusy(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (!gpsAcceptable(accuracy)) {
          setGpsError(`GPS accuracy is ±${Math.round(accuracy)} m. It must be ${MAX_GPS_ACCURACY_M} m or better — move outside and try again.`);
          setBusy(false);
          return;
        }
        const deviceId = getDeviceId();
        const event: ClockInEvent = {
          userId: `patrol-${deviceId.slice(0, 8)}`,
          timestamp: new Date().toISOString(),
          faceVerified: true,
          livenessScore: score,
          location: { latitude, longitude, accuracy, timestamp: new Date(pos.timestamp).toISOString() },
          deviceId,
          ipAddress: await getIpAddress(),
        };
        saveClockIn(event);
        setResult(event);
        setBusy(false);
        toast.success("Clocked in — shift started");
      },
      (err) => {
        setGpsError(err.code === 1 ? "Location permission was denied." : "Could not get your location. Try again.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  const historyLink = (
    <Link to="/clock-history" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface" aria-label="View history">
      <History className="h-4 w-4" />
    </Link>
  );

  if (result) {
    const rows: [string, string][] = [
      ["User ID", result.userId],
      ["Time", new Date(result.timestamp).toLocaleString()],
      ["Face verified", result.faceVerified ? "Yes" : "No"],
      ["Liveness score", result.livenessScore.toFixed(2)],
      ["Latitude", result.location.latitude.toFixed(6)],
      ["Longitude", result.location.longitude.toFixed(6)],
      ["Accuracy", `±${Math.round(result.location.accuracy)} m`],
      ["Device ID", result.deviceId],
      ["IP address", result.ipAddress],
    ];
    return (
      <AppShell>
        <ScreenHeader title="Clocked In" subtitle="Shift started" back="/home" right={historyLink} />
        <div className="glass glow-neon rounded-3xl p-5 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-safe" />
          <p className="mt-2 font-display text-lg font-bold">Verified clock-in</p>
        </div>
        <dl className="glass mt-4 divide-y divide-border/70 overflow-hidden rounded-2xl text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2 px-4 py-2.5">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="break-all font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/clock-history" className="rounded-2xl border border-border py-3 text-center text-sm font-bold">View History</Link>
          <button onClick={() => { live.current = { eyesClosed: false, noseMin: 1, noseMax: 0, blinked: false, nodded: false, conf: [] }; setBlinked(false); setNodded(false); setFace(false); setResult(null); setStatus("loading"); }} className="rounded-2xl bg-electric py-3 text-sm font-bold text-electric-foreground">Done</button>
        </div>
      </AppShell>
    );
  }

  const prompt = !face ? "Look at the camera" : !blinked ? "Blink now" : !nodded ? "Nod your head" : "Liveness confirmed";

  return (
    <AppShell>
      <ScreenHeader title="Biometric Clock-In" subtitle="Face + liveness + GPS" back="/home" right={historyLink} />
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-border bg-surface">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
        {status !== "ready" && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 p-6 text-center text-sm">
            {status === "loading" ? (
              <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Starting camera and face models…</span>
            ) : (
              <span className="flex flex-col items-center gap-2 text-alert"><Camera className="h-8 w-8" />{error}</span>
            )}
          </div>
        )}
        {status === "ready" && (
          <div className={cn("glass absolute inset-x-4 bottom-4 rounded-2xl px-4 py-3 text-center font-display text-base font-bold", nodded ? "text-safe" : "text-neon animate-pulse")}>
            {prompt}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {[
          { ok: face, label: "Face", icon: ScanFace },
          { ok: blinked, label: "Blink", icon: Eye },
          { ok: nodded, label: "Nod", icon: MoveVertical },
        ].map(({ ok, label, icon: Icon }) => (
          <div key={label} className={cn("glass flex items-center justify-center gap-1.5 rounded-2xl py-2.5", ok ? "text-safe" : "text-muted-foreground")}>
            <Icon className="h-4 w-4" /> {label}
          </div>
        ))}
      </div>

      <div className="glass mt-3 rounded-2xl p-3">
        <div className="flex justify-between text-xs"><span>Liveness score</span><span className="font-bold tabular-nums">{score.toFixed(2)} / {MIN_LIVENESS}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className={cn("h-full rounded-full transition-all", score >= MIN_LIVENESS ? "bg-safe" : "bg-neon")} style={{ width: `${score * 100}%` }} />
        </div>
      </div>

      {gpsError && <p className="mt-3 rounded-2xl border border-alert/60 bg-alert/10 p-3 text-sm text-alert">{gpsError}</p>}

      <button
        disabled={!canClock}
        onClick={clockIn}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-neon to-electric py-5 font-display text-xl font-black tracking-widest text-neon-foreground transition disabled:opacity-30"
      >
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <MapPin className="h-6 w-6" />}
        {busy ? "GETTING GPS…" : "CLOCK IN"}
      </button>
    </AppShell>
  );
}
