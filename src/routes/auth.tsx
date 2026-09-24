import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { UnicornShield } from "@/components/wcu/UnicornShield";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — World Crime Unicorn" },
      { name: "description", content: "Create an account or sign in to use live safety sharing." },
      { property: "og:title", content: "Sign in — World Crime Unicorn" },
      { property: "og:description", content: "Secure accounts for community safety tools." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"in" | "up">("in");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/account" });
    });
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/account" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth", data: { full_name: name } },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Google sign-in failed");
  };

  const input = "w-full rounded-2xl border border-border bg-surface-2/60 px-3 py-3 text-sm outline-none focus:border-neon";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <UnicornShield className="mx-auto h-20 w-18" />
      <h1 className="mt-4 text-center font-display text-xl font-bold tracking-wide">
        {mode === "in" ? "Welcome back" : "Create your account"}
      </h1>
      {sent ? (
        <div className="glass mt-6 rounded-3xl p-5 text-center text-sm">
          Check <b>{email}</b> and tap the link to verify your account, then sign in.
        </div>
      ) : (
        <form onSubmit={submit} className="glass mt-6 space-y-3 rounded-3xl p-5">
          {mode === "up" && (
            <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input className={input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" minLength={8} placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={busy} className="glow-electric w-full rounded-2xl bg-gradient-to-r from-electric to-violet py-3 font-display text-sm font-bold tracking-widest text-electric-foreground disabled:opacity-60">
            {busy ? "PLEASE WAIT…" : mode === "in" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
          <button type="button" onClick={google} className="w-full rounded-2xl border border-border py-3 text-sm font-semibold">
            Continue with Google
          </button>
          <p className="text-center text-[11px] text-muted-foreground">Mobile number sign-in is coming soon.</p>
        </form>
      )}
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setSent(false); }} className="mt-4 text-center text-xs text-neon">
        {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
