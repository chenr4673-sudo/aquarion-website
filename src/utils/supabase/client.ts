import { projectId, publicAnonKey } from './info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const SESSION_KEY = 'aquarion:supabase-session';

type Listener = (event: string, session: any | null) => void;
const listeners = new Set<Listener>();

function notify(event: string, session: any | null) {
  listeners.forEach((listener) => listener(event, session));
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: any | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

async function requestAuth(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: publicAnonKey,
      Authorization: `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { data: null, error: new Error(data.error_description || data.msg || data.error || 'Authentication failed') };
  }
  return { data: { session: data, user: data.user }, error: null };
}

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const result = await requestAuth('token?grant_type=password', { email, password });
      if (result.data?.session) {
        saveSession(result.data.session);
        notify('SIGNED_IN', result.data.session);
      }
      return result;
    },
    async getSession() {
      return { data: { session: readSession() }, error: null };
    },
    onAuthStateChange(callback: Listener) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback),
          },
        },
      };
    },
    async signOut() {
      saveSession(null);
      notify('SIGNED_OUT', null);
      return { error: null };
    },
  },
};

export const supabaseReady: Promise<boolean> = Promise.resolve(true);
