import { Outlet, Link, useLocation } from 'react-router';
import { Dumbbell, Home, ClipboardList, Brain, Calendar, MessageCircle } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Dumbbell className="w-8 h-8 text-[rgb(var(--power-red))]" strokeWidth={2.5} />
              <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider">
                  <span className="text-[rgb(var(--power-red))]">AQUARION</span>
                </h1>
                <p className="text-xs text-[rgb(var(--muted-foreground))] uppercase tracking-wide">AI Training System</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/" icon={<Home className="w-4 h-4" />} label="首页" active={location.pathname === '/'} />
              <NavLink to="/assessment" icon={<ClipboardList className="w-4 h-4" />} label="能力评估" active={location.pathname === '/assessment'} />
              <NavLink to="/training-plan" icon={<Calendar className="w-4 h-4" />} label="训练计划" active={location.pathname === '/training-plan'} />
              <NavLink to="/ai-coach" icon={<MessageCircle className="w-4 h-4" />} label="AI教练" active={location.pathname === '/ai-coach'} />
            </nav>

            {/* Mobile Menu Button (placeholder) */}
            <div className="md:hidden">
              <Dumbbell className="w-6 h-6 text-[rgb(var(--power-red))]" />
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar">
            <NavLink to="/" icon={<Home className="w-4 h-4" />} label="首页" active={location.pathname === '/'} compact />
            <NavLink to="/assessment" icon={<ClipboardList className="w-4 h-4" />} label="评估" active={location.pathname === '/assessment'} compact />
            <NavLink to="/training-plan" icon={<Calendar className="w-4 h-4" />} label="计划" active={location.pathname === '/training-plan'} compact />
            <NavLink to="/ai-coach" icon={<MessageCircle className="w-4 h-4" />} label="AI教练" active={location.pathname === '/ai-coach'} compact />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--border))] py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            AQUARION · AI 手臂摔跤训练系统 · 科学训练，精准进步
          </p>
        </div>
      </footer>
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
        flex items-center gap-2 px-4 py-2 transition-all
        ${compact ? 'text-sm' : 'text-base'}
        ${active 
          ? 'bg-[rgb(var(--power-red))] text-white font-semibold' 
          : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
