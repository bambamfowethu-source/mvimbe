import * as React from "react";
import { CITIES, type CrimeCategory, type Role } from "./data";

export type Report = {
  id: string;
  ref: string;
  category: CrimeCategory;
  description: string;
  attachments: string[];
  location: string;
  createdAt: number;
  x: number;
  y: number;
};

type State = {
  role: Role | null;
  city: string;
  reports: Report[];
};

type Ctx = State & {
  ready: boolean;
  setRole: (role: Role) => void;
  setCity: (city: string) => void;
  addReport: (r: Omit<Report, "id" | "ref" | "createdAt" | "x" | "y">) => Report;
};

const STORAGE_KEY = "wcu-state-v1";
const defaultState: State = { role: null, city: CITIES[0], reports: [] };

const StoreContext = React.createContext<Ctx | null>(null);

export function WcuProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(defaultState);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, ready]);

  const value = React.useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      setRole: (role) => setState((s) => ({ ...s, role })),
      setCity: (city) => setState((s) => ({ ...s, city })),
      addReport: (input) => {
        const report: Report = {
          ...input,
          id: crypto.randomUUID(),
          ref: `WCU-${Math.floor(100000 + Math.random() * 899999)}`,
          createdAt: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 55,
        };
        setState((s) => ({ ...s, reports: [report, ...s.reports] }));
        return report;
      },
    }),
    [state, ready],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useWcu() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useWcu must be used inside WcuProvider");
  return ctx;
}
