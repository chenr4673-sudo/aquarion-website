import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';

export { supabase };

// Inline types — no import from @supabase/supabase-js needed at module level
interface User { id: string; email?: string; created_at?: string; [k: string]: any; }
interface Session { access_token: string; user: User; [k: string]: any; }

interface Cycle {
  id: string;
  userId: string;
  email: string;
  inviteCode: string;
  type: 'plan' | 'ai' | 'bundle';
  hasPlan: boolean;
  hasAICoach: boolean;
  status: string;
  startedAt: string;
  endsAt: string;
  createdAt: string;
  orderId: string;
  weeks: number;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  cycles: Cycle[];
  activeCycle: Cycle | null;
  remainingDays: number;
  refreshCycles: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  cycles: [],
  activeCycle: null,
  remainingDays: 0,
  refreshCycles: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  const [remainingDays, setRemainingDays] = useState(0);

  const fetchUserData = async (sess: Session) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/user/profile`,
        { headers: { Authorization: `Bearer ${sess.access_token}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const allCycles: Cycle[] = data.cycles || [];
      setCycles(allCycles);

      const now = Date.now();
      const active = allCycles.find(
        (c) => c.status === 'active' && new Date(c.endsAt).getTime() > now
      ) || null;
      setActiveCycle(active);
      if (active) {
        setRemainingDays(Math.ceil((new Date(active.endsAt).getTime() - now) / 86400000));
      } else {
        setRemainingDays(0);
      }

      // Sync active cycle to localStorage so existing pages work
      if (active) {
        localStorage.setItem('currentCycleId', active.id);
        const existing = JSON.parse(localStorage.getItem('paidCycles') || '[]');
        const already = existing.find((c: any) => c.id === active.id);
        if (!already) {
          existing.push(active);
          localStorage.setItem('paidCycles', JSON.stringify(existing));
        }
      }
    } catch (e) {
      console.error('fetchUserData error:', e);
    }
  };

  const syncLocalCycles = async (sess: Session) => {
    try {
      const localCycles = JSON.parse(localStorage.getItem('paidCycles') || '[]');
      for (const cy of localCycles) {
        if (!cy.inviteCode) continue;
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/user/sync-local-cycle`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${sess.access_token}`,
            },
            body: JSON.stringify({ cycleData: cy }),
          }
        );
      }
    } catch (e) {
      console.error('syncLocalCycles error:', e);
    }
  };

  const refreshCycles = async () => {
    if (session) await fetchUserData(session);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCycles([]);
    setActiveCycle(null);
    setRemainingDays(0);
  };

  useEffect(() => {
    let subscription: any = null;

    supabase.auth.getSession().then((result: any) => {
      const sess = result?.data?.session ?? null;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess) {
        syncLocalCycles(sess).then(() => fetchUserData(sess));
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const authListener = supabase.auth.onAuthStateChange((_event: any, sess: any) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess) {
        syncLocalCycles(sess).then(() => fetchUserData(sess));
      } else {
        setCycles([]);
        setActiveCycle(null);
        setRemainingDays(0);
      }
    });

    subscription = authListener?.data?.subscription;

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, cycles, activeCycle, remainingDays, refreshCycles, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
