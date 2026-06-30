import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Home, ClipboardList, Calendar, MessageCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';

export function Layout() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-[rgb(var(--foreground))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--border))] bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="group hover:opacity-80 transition-opacity duration-300 flex-shrink-0">
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold tracking-[0.3em] uppercase"
                  style={{ fontFamily: 'Cinzel, Georgia, serif', color: 'rgb(var(--foreground))' }}>
                  AQUARION
                </span>
                <span className="text-[10px] tracking-[0.4em] uppercase"
                  style={{ fontFamily: 'Cinzel, Georgia, serif', color: 'rgb(var(--power-red))' }}>
                  AI Training System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation + Auth */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" icon={<Home className="w-3.5 h-3.5" />} label="首页" active={location.pathname === '/'} />
              <NavLink to="/assessment" icon={<ClipboardList className="w-3.5 h-3.5" />} label="能力评估" active={location.pathname === '/assessment'} />
              <NavLink to="/training-plan" icon={<Calendar className="w-3.5 h-3.5" />} label="训练计划" active={location.pathname === '/training-plan'} />
              <NavLink to="/ai-coach" icon={<MessageCircle className="w-3.5 h-3.5" />} label="AI教练" active={location.pathname === '/ai-coach'} />

              <div className="ml-3 pl-3 border-l border-[rgb(var(--border))]">
                {!loading && (
                  user ? (
                    <UserMenu />
                  ) : (
                    <button
                      onClick={() => setAuthOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-300"
                      style={{
                        fontFamily: 'Cinzel, Georgia, serif',
                        border: '1px solid rgba(160,8,12,0.4)',
                        borderRadius: 2,
                        color: 'rgb(var(--foreground))',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgb(160,8,12)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(160,8,12,0.4)'; }}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      登录 / 注册
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Mobile right side */}
            <div className="md:hidden flex items-center gap-2">
              {!loading && (
                user ? (
                  <UserMenu />
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    style={{
                      background: 'none', border: '1px solid rgba(160,8,12,0.4)', borderRadius: 2,
                      padding: '6px 12px', cursor: 'pointer', color: 'rgb(var(--foreground))',
                      fontSize: '0.65rem', letterSpacing: '0.15em', fontFamily: 'Cinzel, Georgia, serif',
                    }}
                  >
                    登录
                  </button>
                )
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar pb-1">
            <NavLink to="/" icon={<Home className="w-3.5 h-3.5" />} label="首页" active={location.pathname === '/'} compact />
            <NavLink to="/assessment" icon={<ClipboardList className="w-3.5 h-3.5" />} label="评估" active={location.pathname === '/assessment'} compact />
            <NavLink to="/training-plan" icon={<Calendar className="w-3.5 h-3.5" />} label="计划" active={location.pathname === '/training-plan'} compact />
            <NavLink to="/ai-coach" icon={<MessageCircle className="w-3.5 h-3.5" />} label="AI教练" active={location.pathname === '/ai-coach'} compact />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--border))] py-10 mt-16">
        <div className="container mx-auto px-6 text-center space-y-3">
          <div className="ornament-line justify-center text-[rgb(var(--power-red))] text-xs tracking-[0.4em] uppercase"
            style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
            AQUARION
          </div>
          <p className="text-xs tracking-[0.2em] text-[rgb(var(--muted-foreground))] uppercase"
            style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
            AI 手臂摔跤训练系统 · 科学训练，精准进步
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

function NavLink({ to, icon, label, active, compact = false }: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-2 px-4 py-2 transition-all duration-300 whitespace-nowrap
        ${compact ? 'text-xs' : 'text-xs'}
        tracking-[0.15em] uppercase
        ${active
          ? 'text-[rgb(var(--foreground))] border-b border-[rgb(var(--power-red))]'
          : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
        }
      `}
      style={{ fontFamily: 'Cinzel, Georgia, serif' }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
