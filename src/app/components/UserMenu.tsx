import { useState } from 'react';
import { Link } from 'react-router';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const cinzel = { fontFamily: 'Cinzel, Georgia, serif' };

export function UserMenu() {
  const { user, activeCycle, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 border border-[rgb(var(--border))] px-3 py-2 text-xs uppercase tracking-[0.15em] text-[rgb(var(--foreground))]"
        style={cinzel}
      >
        <User className="h-3.5 w-3.5" />
        账号
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 border border-[rgb(var(--border))] bg-black p-3 shadow-xl">
          <p className="mb-2 truncate text-xs text-[rgb(var(--muted-foreground))]">{user.email}</p>
          {activeCycle && (
            <p className="mb-3 border border-[rgb(var(--border))] p-2 text-xs text-[rgb(var(--foreground))]">
              {activeCycle.hasPlan ? '训练计划 ' : ''}
              {activeCycle.hasAICoach ? 'AI教练 ' : ''}
              已激活
            </p>
          )}
          <Link
            to="/my-plan"
            onClick={() => setOpen(false)}
            className="block border border-[rgb(var(--border))] px-3 py-2 text-center text-xs uppercase tracking-[0.15em] text-[rgb(var(--foreground))] hover:border-[rgb(var(--power-red))]"
            style={cinzel}
          >
            我的计划
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-2 flex w-full items-center justify-center gap-2 border border-[rgb(var(--border))] px-3 py-2 text-xs uppercase tracking-[0.15em] text-[rgb(var(--muted-foreground))] hover:text-white"
            style={cinzel}
          >
            <LogOut className="h-3.5 w-3.5" />
            退出
          </button>
        </div>
      )}
    </div>
  );
}
