import { useNavigate } from 'react-router';
import { Brain, Calendar, CheckCircle, Clock, CreditCard, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const cinzel = { fontFamily: 'Cinzel, Georgia, serif' };
const garamond = { fontFamily: 'EB Garamond, Georgia, serif' };

export default function MyPlan() {
  const navigate = useNavigate();
  const { user, loading, activeCycle, cycles, remainingDays, refreshCycles } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--power-red))]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black px-6 py-24 text-center text-white">
        <h1 className="mb-4 text-2xl uppercase tracking-[0.25em]" style={cinzel}>请先登录</h1>
        <button
          onClick={() => navigate('/')}
          className="border border-[rgb(var(--power-red))] px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[rgb(var(--power-red))]"
          style={cinzel}
        >
          返回首页登录
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-[rgb(var(--foreground))]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-[rgb(var(--power-red))]" style={cinzel}>AQUARION</p>
          <h1 className="text-3xl uppercase tracking-[0.2em]" style={cinzel}>我的训练计划</h1>
        </div>

        {activeCycle ? (
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <section className="border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted-foreground))]" style={cinzel}>当前周期</p>
                  <h2 className="mt-2 text-xl uppercase tracking-[0.15em]" style={cinzel}>{typeLabel(activeCycle)}</h2>
                </div>
                <div className="flex items-center gap-2 text-[rgb(var(--power-red))]">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm" style={garamond}>剩余 {remainingDays} 天</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <EntitlementCard
                  icon={<Calendar className="h-5 w-5" />}
                  title="个人训练计划"
                  active={activeCycle.hasPlan}
                  action={activeCycle.hasPlan ? () => navigate('/training-plan') : () => navigate('/')}
                />
                <EntitlementCard
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="AI 教练"
                  active={activeCycle.hasAICoach}
                  action={activeCycle.hasAICoach ? () => navigate('/ai-coach') : () => navigate('/ai-coach')}
                  inactiveActionLabel="购买 AI 教练"
                />
              </div>
            </section>

            <aside className="border border-[rgb(var(--border))] bg-black p-6">
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted-foreground))]" style={cinzel}>账号</p>
              <p className="mb-6 truncate text-sm" style={garamond}>{user.email}</p>
              <div className="space-y-3">
                <ActionButton onClick={() => navigate('/assessment')} icon={<Brain className="h-4 w-4" />}>
                  能力评估
                </ActionButton>
                <ActionButton onClick={() => navigate('/')} icon={<CreditCard className="h-4 w-4" />}>
                  查看付费方案
                </ActionButton>
                <ActionButton onClick={refreshCycles} icon={<Loader2 className="h-4 w-4" />}>
                  刷新状态
                </ActionButton>
              </div>
            </aside>
          </div>
        ) : (
          <div className="border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-10 text-center">
            <p className="mb-6 text-[rgb(var(--muted-foreground))]" style={garamond}>
              你当前还没有已激活的 6 周周期。
            </p>
            <button
              onClick={() => navigate('/')}
              className="border border-[rgb(var(--power-red))] px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[rgb(var(--power-red))]"
              style={cinzel}
            >
              返回首页购买
            </button>
          </div>
        )}

        {cycles.length > 0 && (
          <section className="mt-8 border border-[rgb(var(--border))] bg-black p-6">
            <h2 className="mb-4 text-sm uppercase tracking-[0.2em]" style={cinzel}>历史周期</h2>
            <div className="space-y-3">
              {cycles.map((cycle) => (
                <div key={cycle.id} className="flex flex-col justify-between gap-2 border border-[rgb(var(--border))] p-4 text-sm sm:flex-row">
                  <span style={garamond}>{typeLabel(cycle)}</span>
                  <span className="text-[rgb(var(--muted-foreground))]" style={garamond}>
                    {new Date(cycle.startedAt).toLocaleDateString('zh-CN')} - {new Date(cycle.endsAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EntitlementCard({ icon, title, active, action, inactiveActionLabel = '查看' }: {
  icon: React.ReactNode;
  title: string;
  active: boolean;
  action: () => void;
  inactiveActionLabel?: string;
}) {
  return (
    <div className="border border-[rgb(var(--border))] bg-black p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className={active ? 'text-green-400' : 'text-[rgb(var(--muted-foreground))]'}>{active ? <CheckCircle className="h-5 w-5" /> : icon}</span>
        <h3 className="text-sm uppercase tracking-[0.15em]" style={cinzel}>{title}</h3>
      </div>
      <p className="mb-4 text-sm text-[rgb(var(--muted-foreground))]" style={garamond}>
        {active ? '当前周期已解锁。' : '当前周期尚未解锁。'}
      </p>
      <button
        onClick={action}
        className="w-full border border-[rgb(var(--border))] px-4 py-2 text-xs uppercase tracking-[0.15em] hover:border-[rgb(var(--power-red))]"
        style={cinzel}
      >
        {active ? '打开' : inactiveActionLabel}
      </button>
    </div>
  );
}

function ActionButton({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 border border-[rgb(var(--border))] px-4 py-3 text-xs uppercase tracking-[0.15em] hover:border-[rgb(var(--power-red))]"
      style={cinzel}
    >
      {icon}
      {children}
    </button>
  );
}

function typeLabel(cycle: { type?: string; hasPlan?: boolean; hasAICoach?: boolean }) {
  if (cycle.hasPlan && cycle.hasAICoach) return '完整 AQUARION 体验';
  if (cycle.hasAICoach) return '私人专属 AI 教练';
  if (cycle.hasPlan) return '个人专属计划定制';
  return cycle.type || '训练周期';
}
