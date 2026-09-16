import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Users } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/wcu/AppShell";
import { COMMUNITY_POSTS } from "@/lib/wcu/data";
import { useWcu } from "@/lib/wcu/store";

export const Route = createFileRoute("/tools/community")({
  head: () => ({
    meta: [
      { title: "Community — World Crime Unicorn" },
      {
        name: "description",
        content: "Connect with neighbours, report local issues and build a safer community together.",
      },
      { property: "og:title", content: "Community — World Crime Unicorn" },
      {
        property: "og:description",
        content: "Neighbourhood watch updates, local issues and community safety chatter.",
      },
    ],
  }),
  component: CommunityScreen,
});

type Post = { id: string; author: string; role: string; ago: string; body: string; replies: number };

function CommunityScreen() {
  const { city, role } = useWcu();
  const [posts, setPosts] = React.useState<Post[]>([...COMMUNITY_POSTS]);
  const [draft, setDraft] = React.useState("");

  const post = () => {
    const body = draft.trim();
    if (!body) return;
    setPosts((p) => [
      {
        id: crypto.randomUUID(),
        author: "You",
        role: role ? role[0]!.toUpperCase() + role.slice(1) : "Citizen",
        ago: "Just now",
        body,
        replies: 0,
      },
      ...p,
    ]);
    setDraft("");
  };

  return (
    <AppShell>
      <ScreenHeader title="Community" subtitle={city} back="/home" />

      <div className="glass mb-4 flex items-center gap-3 rounded-2xl p-3">
        <Users className="h-5 w-5 shrink-0 text-neon" />
        <p className="min-w-0 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">2,148 neighbours</span> active in your area
          this week.
        </p>
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <article key={p.id} className="glass rounded-2xl p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.author}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {p.role} · {p.ago}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3.5 w-3.5" /> {p.replies}
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground/85">{p.body}</p>
          </article>
        ))}
      </div>

      <label htmlFor="post" className="mt-6 mb-2 block text-sm text-muted-foreground">
        Report a local issue
      </label>
      <textarea
        id="post"
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Street lights, suspicious activity, community meet-ups…"
        className="w-full rounded-2xl border border-border bg-surface/70 p-3 text-sm outline-none focus:border-neon"
      />
      <button
        onClick={post}
        disabled={!draft.trim()}
        className="glow-electric mt-3 w-full rounded-2xl bg-gradient-to-r from-electric to-violet py-3 text-sm font-bold text-electric-foreground disabled:opacity-40"
      >
        Post an update
      </button>
    </AppShell>
  );
}
