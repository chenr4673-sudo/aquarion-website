import { useNavigate } from 'react-router';
import { Brain, TrendingUp, Zap, Check, Lock, RefreshCw, MessageCircle, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { projectId } from '../../utils/supabase/info';
import { useLanguage } from '../context/LanguageContext';

const PRICE_PLAN = 20;
const PRICE_AI_COACH = 99;
const PRICE_BUNDLE = 110;
const CURRENCY = 'A$';

const cinzelStyle = { fontFamily: 'Cinzel, Georgia, serif' };
const garamondStyle = { fontFamily: 'EB Garamond, Georgia, serif' };

// Origin for Stripe redirect URLs
const SITE_ORIGIN = window.location.origin;

export default function Home() {
  const navigate = useNavigate();
  const { user, session, activeCycle, remainingDays } = useAuth();
  const { t, lang } = useLanguage();
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  const hasActiveCycle = () => (
    !!activeCycle &&
    activeCycle.status === 'active' &&
    new Date(activeCycle.endsAt).getTime() > Date.now()
  );

  const ownsPlan = () => hasActiveCycle() && activeCycle?.hasPlan === true;
  const ownsAi = () => hasActiveCycle() && activeCycle?.hasAICoach === true;

  const alreadyOwns = (productType: 'plan' | 'ai' | 'bundle') => {
    if (productType === 'plan') return ownsPlan();
    if (productType === 'ai') return ownsAi();
    return ownsPlan() && ownsAi();
  };

  const bundleUnavailable = () => hasActiveCycle() && (ownsPlan() || ownsAi());

  const bundleUnavailableLabel = () => (
    alreadyOwns('bundle')
      ? (lang === 'en' ? '✓ Already owned' : '✓ 已拥有')
      : (lang === 'en' ? 'Single item owned' : '已购买单项，不可买组合')
  );

  const unavailableBundleMessage = () => {
    if (alreadyOwns('bundle')) {
      return lang === 'en'
        ? 'You already own the full bundle for this cycle.'
        : '你已经拥有当前周期的完整组合。';
    }
    return lang === 'en'
      ? 'The bundle is only available before buying any single item. Please buy the missing single product instead.'
      : '组合套餐只适合当前周期还没购买任何服务时直接购买。你已购买单项服务，请单独加购缺少的功能。';
  };

  // Open pricing — requires login, but users with one product can add the other.
  const handleOpenPricing = () => {
    if (!user) {
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }
    setShowPricingDialog(true);
  };

  const handleCheckout = async (productType: 'plan' | 'ai' | 'bundle') => {
    if (!user || !session) {
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }

    if (productType === 'bundle' && bundleUnavailable()) {
      alert(unavailableBundleMessage());
      return;
    }

    if (alreadyOwns(productType)) {
      alert(lang === 'en' ? 'You already own this product for the current cycle.' : '你已经拥有当前周期的这个功能。');
      return;
    }

    setCheckoutLoading(productType);
    setCheckoutError('');

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d7eafa70/payment/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            productType,
            successUrl: `${SITE_ORIGIN}/payment-success`,
            cancelUrl: SITE_ORIGIN,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.message || data.error || '创建支付会话失败');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (error) {
      setCheckoutError(`网络错误：${error}`);
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[rgb(var(--foreground))]">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-48 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgb(var(--power-red) / 0.6), transparent)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgb(var(--power-red) / 0.15) 0%, transparent 70%)', transform: 'translate(-50%, -40%)' }} />

        <div className="relative z-10 container mx-auto px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }}>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.2em] uppercase mb-4 text-glow-red"
              style={cinzelStyle}>
              AQUARION
            </h1>

            <div className="ornament-line justify-center text-sm tracking-[0.4em] uppercase text-[rgb(var(--muted-foreground))] mb-12"
              style={cinzelStyle}>
              This Summer
            </div>

            <p className="text-base md:text-lg text-[rgb(var(--muted-foreground))] max-w-xl mx-auto leading-loose mb-4"
              style={{ ...garamondStyle, fontSize: '1.1rem' }}>
              通过身体结构、力量数据与 AI 分析，<br />
              为每位腕力爱好者生成专属训练周期
            </p>

            {/* Pricing summary */}
            <div className="flex flex-col items-center gap-2 mb-10 mt-8">
              <PriceLine label="个人专属计划定制" price={PRICE_PLAN} />
              <PriceLine label="私人专属 AI 教练" price={PRICE_AI_COACH} />
              <div className="mt-1 text-[rgb(var(--power-gold))] tracking-[0.2em]" style={cinzelStyle}>
                <span className="text-xs uppercase">完整体验</span>
                <span className="text-3xl font-bold ml-3">{CURRENCY}{PRICE_BUNDLE}</span>
                <span className="text-xs ml-1">/ 6周</span>
              </div>
            </div>

            {/* Active cycle banner */}
            {user && activeCycle && new Date(activeCycle.endsAt).getTime() > Date.now() && (
              <div className="mb-6 inline-flex items-center gap-3 px-6 py-3 border border-[rgb(var(--power-red))]/30"
                style={{ background: 'rgba(160,8,12,0.06)' }}>
                <ShieldCheck className="w-4 h-4 text-[rgb(var(--power-red))]" />
                <span style={{ ...cinzelStyle, fontSize: '0.7rem', letterSpacing: '0.15em' }}>
                  训练周期进行中 · 剩余 {remainingDays} 天
                </span>
                <button onClick={() => navigate('/my-plan')}
                  className="text-[rgb(var(--power-red))] underline underline-offset-2"
                  style={{ ...cinzelStyle, fontSize: '0.65rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                  查看详情
                </button>
              </div>
            )}

            {/* Payment methods badge */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgb(var(--muted-foreground))', ...cinzelStyle }}>支持</span>
              <span className="text-xs px-2 py-0.5 border border-[rgb(var(--border))] text-[rgb(var(--muted-foreground))]" style={cinzelStyle}>💳 信用卡</span>
              <span className="text-xs px-2 py-0.5 border border-[rgb(var(--border))] text-[rgb(var(--muted-foreground))]" style={cinzelStyle}>Stripe 可用方式</span>
            </div>

            {/* CTA */}
            <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
              <DialogTrigger asChild>
                <button
                  onClick={e => { e.preventDefault(); handleOpenPricing(); }}
                  className="inline-flex items-center gap-3 px-12 py-4 border border-[rgb(var(--power-red))] text-[rgb(var(--foreground))] uppercase tracking-[0.3em] text-sm transition-all duration-500 hover:bg-[rgb(var(--power-red))] hover:text-white group glow-red"
                  style={cinzelStyle}
                >
                  {user ? '查看付费方案' : '登录 · 查看付费方案'}
                  <CreditCard className="w-4 h-4 transition-transform group-hover:scale-110" />
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[rgb(var(--card))] border-[rgb(var(--border))]">
                <DialogHeader>
                  <DialogTitle className="tracking-[0.2em] uppercase" style={cinzelStyle}>
                    选择你的 AQUARION 训练服务
                  </DialogTitle>
                  <DialogDescription className="text-[rgb(var(--muted-foreground))]" style={garamondStyle}>
                    所有服务均以 6 周为一个周期 · 支付方式以 Stripe 结账页实际显示为准
                  </DialogDescription>
                </DialogHeader>

                {checkoutError && (
                  <div className="border border-red-600/30 p-3 text-sm text-red-400" style={{ background: 'rgba(160,8,12,0.08)', ...garamondStyle }}>
                    {checkoutError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                  <PricingCard
                    title="个人专属计划定制"
                    price={PRICE_PLAN}
                    features={['专属能力评估', '体重/手掌/小臂分析', '技术路线建议', '6周个人训练计划', '每周自动递进', '受伤状态调整模式']}
                    description="适合想获得完整6周腕力专项训练计划的用户。"
                    onCheckout={() => handleCheckout('plan')}
                    loading={checkoutLoading === 'plan'}
                    owned={alreadyOwns('plan')}
                  />
                  <PricingCard
                    title="私人专属 AI 教练"
                    price={PRICE_AI_COACH}
                    features={['私人AI腕力教练聊天', '技术/训练/饮食答疑', '赛前准备建议', '伤病恢复建议', '联网搜索并总结', '可参考当前训练数据']}
                    description="适合想随时获得专业训练、技术、饮食和比赛建议的用户。"
                    onCheckout={() => handleCheckout('ai')}
                    loading={checkoutLoading === 'ai'}
                    owned={alreadyOwns('ai')}
                  />
                  <PricingCard
                    title="完整 AQUARION 体验"
                    subtitle="个人专属计划定制 + 私人专属 AI 教练"
                    price={PRICE_BUNDLE}
                    features={[`${CURRENCY}${PRICE_PLAN} ${t('home.plan.label')}`, `${CURRENCY}${PRICE_AI_COACH} ${t('home.ai.label')}`, lang === 'en' ? 'Unlock the full 6-week training system' : '解锁完整6周训练系统']}
                    description=""
                    onCheckout={() => handleCheckout('bundle')}
                    loading={checkoutLoading === 'bundle'}
                    owned={bundleUnavailable()}
                    ownedLabel={bundleUnavailableLabel()}
                    recommended
                  />
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[rgb(var(--muted-foreground))]" style={cinzelStyle}>
                  <span>💳 Visa / Mastercard</span>
                  <span className="text-[rgb(var(--border))]">·</span>
                  <span>🔒 Stripe 安全加密 · 其他方式以结账页显示为准</span>
                </div>
              </DialogContent>
            </Dialog>

            <p className="mt-5 text-xs tracking-[0.15em] text-[rgb(var(--muted-foreground))]" style={cinzelStyle}>
              所有服务均以 6 周为一个周期 · 不会自动续费 · 安全支付
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-px mt-24 max-w-5xl mx-auto border border-[rgb(var(--border))]">
            <FeatureCard icon={<Brain className="w-7 h-7" />} title="AI 技术分析" description="根据你的身体硬件数据，AI 智能推荐最适合你的技术路线" />
            <FeatureCard icon={<Zap className="w-7 h-7" />} title="科学训练计划" description="严格遵循专业训练理论，内侧力、外侧力、横向力、前端专项全面覆盖" />
            <FeatureCard icon={<TrendingUp className="w-7 h-7" />} title="精准进度追踪" description="每个动作独立进度管理，5×5 周期、RM 递增，严格按照训练指南递进" />
          </motion.div>
        </div>
      </section>

      {/* ── Training Philosophy ── */}
      <section className="border-t border-[rgb(var(--border))] py-24">
        <div className="container mx-auto px-6">
          <SectionTitle>训练哲学</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <PhilosophyCard title="内侧力" subtitle="Inner Strength" color="rgb(var(--inner-strength))" description="二头弯举、内侧弯举、正面横扫、器械侧压" />
            <PhilosophyCard title="外侧力" subtitle="Outer Strength" color="rgb(var(--outer-strength))" description="虎口锤提、拇指旋提、锤式弯举、桡骨旋提" />
            <PhilosophyCard title="横向力" subtitle="Lateral Strength" color="rgb(var(--lateral-strength))" description="负重引体向上、侧面横扫、哑铃卧推" />
            <PhilosophyCard title="前端专项" subtitle="Front Control" color="rgb(var(--front-special))" description="屈腕、腕弯举、旋前旋后、指力训练" />
          </div>
        </div>
      </section>

      {/* ── Flow ── */}
      <section className="border-t border-[rgb(var(--border))] py-24">
        <div className="container mx-auto px-6">
          <SectionTitle>使用流程</SectionTitle>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              <FlowStep number={1} title="注册账号" icon={<Zap className="w-5 h-5" />} />
              <FlowArrow />
              <FlowStep number={2} title="选择方案支付" icon={<CreditCard className="w-5 h-5" />} />
              <FlowArrow />
              <FlowStep number={3} title="填写能力评估" icon={<Brain className="w-5 h-5" />} />
              <FlowArrow />
              <FlowStep number={4} title="生成 6 周计划" icon={<TrendingUp className="w-5 h-5" />} />
            </div>
            <div className="mt-10 flex items-center justify-center">
              <div className="text-center p-6 border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
                <RefreshCw className="w-6 h-6 text-[rgb(var(--power-red))] mx-auto mb-3" />
                <p className="text-xs tracking-[0.15em] text-[rgb(var(--muted-foreground))] uppercase" style={cinzelStyle}>
                  第 6 周结束 → 重新评估并开启新周期
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Payment Info ── */}
      <section className="border-t border-[rgb(var(--border))] py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <SectionTitle>付费说明</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PaymentInfoCard icon={<CreditCard className="w-5 h-5 text-[rgb(var(--power-red))]" />} title="安全在线支付"
              description="通过 Stripe 全球支付平台处理，支持信用卡等已开通的安全支付方式；具体以结账页实际显示为准。" />
            <PaymentInfoCard icon={<MessageCircle className="w-5 h-5 text-[rgb(var(--power-red))]" />} title="购买记录云端保存"
              description="支付完成后，你的训练周期自动绑定到账号，换设备或刷新页面均不会丢失。" />
            <PaymentInfoCard icon={<Lock className="w-5 h-5 text-[rgb(var(--power-gold))]" />} title="6 周后必须重新评估"
              description="训练 6 周后，系统要求重新填写能力评估，确保新周期训练计划精准适配你的当前水平。" />
            <PaymentInfoCard icon={<Check className="w-5 h-5 text-[rgb(var(--power-red))]" />} title="不会自动续费"
              description="我们不会自动扣费。每个周期结束后，你可以自行决定是否继续训练并开启新周期。" />
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab={authTab} />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-6 mb-16">
      <span className="block flex-1 h-px bg-[rgb(var(--border))] max-w-[100px]" />
      <h2 className="text-sm tracking-[0.35em] uppercase text-[rgb(var(--foreground))]" style={cinzelStyle}>{children}</h2>
      <span className="block flex-1 h-px bg-[rgb(var(--border))] max-w-[100px]" />
    </div>
  );
}

function PriceLine({ label, price }: { label: string; price: number }) {
  return (
    <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]" style={garamondStyle}>
      <span>{label}</span>
      <span className="w-12 h-px bg-[rgb(var(--border))]" />
      <span className="text-[rgb(var(--foreground))] font-medium">{CURRENCY}{price} <span className="text-xs text-[rgb(var(--muted-foreground))]">/ 6周</span></span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[rgb(var(--card))] p-8 group hover:bg-[rgb(var(--muted))/0.3] transition-colors duration-300">
      <div className="text-[rgb(var(--power-red))] mb-5">{icon}</div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-[rgb(var(--foreground))]" style={cinzelStyle}>{title}</h4>
      <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed" style={garamondStyle}>{description}</p>
    </div>
  );
}

function PhilosophyCard({ title, subtitle, color, description }: { title: string; subtitle: string; color: string; description: string }) {
  return (
    <div className="border border-[rgb(var(--border))] p-6 bg-[rgb(var(--card))] transition-colors duration-400">
      <div className="h-px mb-5 w-full" style={{ backgroundColor: color }} />
      <h5 className="text-sm font-semibold uppercase tracking-[0.2em] mb-1" style={cinzelStyle}>{title}</h5>
      <p className="text-[10px] text-[rgb(var(--muted-foreground))] uppercase tracking-[0.2em] mb-4" style={cinzelStyle}>{subtitle}</p>
      <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed" style={garamondStyle}>{description}</p>
    </div>
  );
}

function FlowStep({ number, title, icon }: { number: number; title: string; icon: React.ReactNode }) {
  return (
    <div className="border border-[rgb(var(--border))] p-4 text-center bg-[rgb(var(--card))]">
      <div className="text-[rgb(var(--power-red))] flex justify-center mb-2">{icon}</div>
      <div className="text-[10px] tracking-[0.2em] text-[rgb(var(--muted-foreground))] mb-1 uppercase" style={cinzelStyle}>{number.toString().padStart(2, '0')}</div>
      <div className="text-xs font-medium uppercase tracking-[0.1em]" style={cinzelStyle}>{title}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <span className="text-[rgb(var(--power-red))] text-lg">—</span>
    </div>
  );
}

function PaymentInfoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="border border-[rgb(var(--border))] p-6 bg-[rgb(var(--card))] flex items-start gap-4">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={cinzelStyle}>{title}</h4>
        <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed" style={garamondStyle}>{description}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, subtitle, price, features, description, onCheckout, loading, recommended = false, owned = false, ownedLabel }: {
  title: string; subtitle?: string; price: number; features: string[]; description: string;
  onCheckout: () => void; loading: boolean; recommended?: boolean; owned?: boolean; ownedLabel?: string;
}) {
  const { t, lang } = useLanguage();
  return (
    <div className={`border p-5 flex flex-col bg-[rgb(var(--card))] ${recommended ? 'border-[rgb(var(--power-gold))]' : 'border-[rgb(var(--border))]'}`}>
      {recommended && (
        <div className="text-center mb-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[rgb(var(--power-gold))]" style={cinzelStyle}>{t('pricing.recommend')}</span>
        </div>
      )}
      <div className="h-px mb-4" style={{ backgroundColor: recommended ? 'rgb(var(--power-gold))' : 'rgb(var(--power-red))' }} />
      <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={cinzelStyle}>{title}</h4>
      {subtitle && <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4" style={garamondStyle}>{subtitle}</p>}
      <div className="mb-4">
        <div className="text-3xl font-bold" style={{ ...cinzelStyle, color: recommended ? 'rgb(var(--power-gold))' : 'rgb(var(--power-red))' }}>{CURRENCY}{price}</div>
        <div className="text-xs text-[rgb(var(--muted-foreground))] tracking-[0.1em]" style={cinzelStyle}>一周期 = 6周</div>
      </div>
      <ul className="space-y-2 mb-5 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-[rgb(var(--power-red))] mt-0.5 flex-shrink-0">—</span>
            <span className="text-[rgb(var(--foreground))/0.85]" style={garamondStyle}>{f}</span>
          </li>
        ))}
      </ul>
      {description && <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4 italic" style={garamondStyle}>{description}</p>}
      <button
        onClick={owned ? undefined : onCheckout}
        disabled={loading || owned}
        className="w-full py-3 border text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:text-white flex items-center justify-center gap-2"
        style={{
          ...cinzelStyle,
          borderColor: owned ? 'rgba(100,100,100,0.4)' : recommended ? 'rgb(var(--power-gold))' : 'rgb(var(--power-red))',
          color: owned ? 'rgb(var(--muted-foreground))' : 'rgb(var(--foreground))',
          background: owned ? 'rgba(50,50,50,0.2)' : loading ? 'rgba(160,8,12,0.15)' : 'none',
          cursor: owned || loading ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={e => !loading && !owned && ((e.currentTarget as HTMLButtonElement).style.background = recommended ? 'rgb(var(--power-gold))' : 'rgb(var(--power-red))')}
        onMouseLeave={e => !loading && !owned && ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
      >
        {owned
          ? <>{ownedLabel || (lang === 'en' ? '✓ Already owned' : '✓ 已拥有')}</>
          : loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />{t('pricing.loading')}</>
            : <><CreditCard className="w-4 h-4" />{t('pricing.buy')}</>
        }
      </button>
    </div>
  );
}
