import { createFileRoute } from "@tanstack/react-router";
import { FileText, Image as ImageIcon, Lock, Mic, Video } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { EVIDENCE_ITEMS } from "@/lib/wcu/data";
import { useWcu } from "@/lib/wcu/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence Vault — World Crime Unicorn" },
      {
        name: "description",
        content: "Securely stored photos, video, audio statements and case notes linked to incidents.",
      },
      { property: "og:title", content: "Evidence Vault — World Crime Unicorn" },
      {
        property: "og:description",
        content: "Encrypted storage for incident photos, video, audio and case documents.",
      },
    ],
  }),
  component: EvidenceVault,
});

const ICONS = { Photo: ImageIcon, Video, Audio: Mic, Document: FileText } as const;
const TONES: Record<string, string> = {
  electric: "bg-electric/20 text-electric",
  violet: "bg-violet/20 text-violet",
  neon: "bg-neon/20 text-neon",
  warn: "bg-warn/20 text-warn",
};

function EvidenceVault() {
  const { reports } = useWcu();
  const mine = reports.flatMap((r) =>
    (r.attachments.length ? r.attachments : ["Document"]).map((a, i) => ({
      id: `${r.id}-${i}`,
      type: a === "Voice" ? "Audio" : a === "Photo" || a === "Video" ? a : "Document",
      label: `${r.category} — ${r.ref}`,
      time: new Date(r.createdAt).toLocaleString(),
      tone: "electric",
    })),
  );

  return (
    <AppShell>
      <ScreenHeader title="Evidence Vault" subtitle="End-to-end encrypted" back="/home" />

      <div className="glass mb-4 flex items-center gap-3 rounded-2xl p-3 text-xs text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0 text-safe" />
        <span className="min-w-0">
          Items are sealed with a chain-of-custody log. Only you and assigned officers can open them.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[...mine, ...EVIDENCE_ITEMS].map((e) => {
          const Icon = ICONS[e.type as keyof typeof ICONS] ?? FileText;
          return (
            <article key={e.id} className="glass overflow-hidden rounded-2xl">
              <div className={cn("grid h-24 place-items-center", TONES[e.tone])}>
                <Icon className="h-8 w-8" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold">{e.label}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {e.type} · {e.time}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
