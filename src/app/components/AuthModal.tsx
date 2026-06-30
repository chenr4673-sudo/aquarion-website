import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Lock, Mail, X } from 'lucide-react';
import { supabase } from '../context/AuthContext';
import { projectId } from '../../utils/supabase/info';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

const cinzel = { fontFamily: 'Cinzel, Georgia, serif' };
const garamond = { fontFamily: 'EB Garamond, Georgia, serif' };

export function AuthModal({ open, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setError('');
    }
  }, [defaultTab, open]);

  if (!open) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 'register') {
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '注册失败');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md border border-[rgb(var(--border))] bg-black p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[rgb(var(--power-red))]" style={cinzel}>
              AQUARION
            </p>
            <h2 className="mt-2 text-lg uppercase tracking-[0.2em]" style={cinzel}>
              {tab === 'login' ? '登录账号' : '创建账号'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[rgb(var(--border))] p-2 text-[rgb(var(--muted-foreground))] hover:text-white"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 border border-[rgb(var(--border))]">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`py-3 text-xs uppercase tracking-[0.2em] ${tab === 'login' ? 'bg-[rgb(var(--power-red))] text-white' : 'text-[rgb(var(--muted-foreground))]'}`}
            style={cinzel}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`py-3 text-xs uppercase tracking-[0.2em] ${tab === 'register' ? 'bg-[rgb(var(--power-red))] text-white' : 'text-[rgb(var(--muted-foreground))]'}`}
            style={cinzel}
          >
            注册
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[rgb(var(--muted-foreground))]" style={cinzel}>
              <Mail className="h-3.5 w-3.5" />
              邮箱
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-[rgb(var(--border))] bg-black px-4 py-3 text-white outline-none focus:border-[rgb(var(--power-red))]"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[rgb(var(--muted-foreground))]" style={cinzel}>
              <Lock className="h-3.5 w-3.5" />
              密码
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-[rgb(var(--border))] bg-black px-4 py-3 text-white outline-none focus:border-[rgb(var(--power-red))]"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && (
            <p className="border border-red-700/40 bg-red-950/20 p-3 text-sm text-red-300" style={garamond}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 border border-[rgb(var(--power-red))] px-4 py-3 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-[rgb(var(--power-red))] disabled:opacity-60"
            style={cinzel}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {tab === 'login' ? '登录' : '注册并登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
