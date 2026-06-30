import { Link, useNavigate } from 'react-router';
import { Dumbbell, Brain, TrendingUp, Zap, Check, Lock, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { motion } from 'motion/react';
import { useState } from 'react';
import { validateInviteCode, markCodeAsUsed } from '../utils/inviteCode';
import {
  addAICoachToCurrentCycle,
  createPaidCycle,
  getPaidCycles,
  savePaidCycles,
} from '../utils/paymentAccess';

const PRICE_PLAN = 30; // 训练计划：30元/6周
const PRICE_AI_COACH = 150; // AI教练：150元/6周
const PRICE_BUNDLE = 180; // 完整体验：180元/6周

export default function Home() {
  const navigate = useNavigate();
  const [showPricingDialog, setShowPricingDialog] = useState(false);

  // 处理邀请码兑换 - 支持三种类型：plan, ai, bundle
  const handleInviteCodeSubmit = (code: string, expectedType: 'plan' | 'ai' | 'bundle') => {
    const validation = validateInviteCode(code);

    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    if (validation.type !== expectedType && validation.type !== 'bundle') {
      alert(`此邀请码类型不匹配。需要 ${expectedType === 'plan' ? '训练计划' : expectedType === 'ai' ? 'AI教练' : '完整体验'} 类型的邀请码。`);
      return;
    }

    const prices = {
      plan: PRICE_PLAN,
      ai: PRICE_AI_COACH,
      bundle: PRICE_BUNDLE,
    };
    const purchaseType = validation.type!;

    if (purchaseType === 'ai') {
      addAICoachToCurrentCycle(prices.ai, code);
    } else {
      const newCycle = createPaidCycle(purchaseType, prices[purchaseType], code);
      const existingCycles = getPaidCycles();
      existingCycles.push(newCycle);
      savePaidCycles(existingCycles);
      localStorage.setItem('currentCycleId', newCycle.id);
    }

    // 标记邀请码为已使用
    markCodeAsUsed(code);

    setShowPricingDialog(false);

    if (purchaseType === 'plan' || purchaseType === 'bundle') {
      alert('邀请码验证成功！现在开始填写能力评估。');
      navigate('/assessment');
    } else if (purchaseType === 'ai') {
      alert('邀请码验证成功！AI教练已启动，你可以在导航栏点击"AI教练"开始咨询。');
      navigate('/ai-coach');
    }
  };
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgb(var(--power-red)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--power-red)) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo/Title */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Dumbbell className="w-16 h-16 text-[rgb(var(--power-red))]" strokeWidth={2} />
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-wider">
                <span className="text-[rgb(var(--power-red))]">AQUARION</span>
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--power-silver))] mb-6 uppercase tracking-wide">
              AQUARION AI 手臂摔跤训练系统
            </h2>

            <p className="text-lg md:text-xl text-[rgb(var(--muted-foreground))] mb-8 max-w-2xl mx-auto leading-relaxed">
              通过身体结构、力量数据和AI分析，
              <br />
              为每个腕力爱好者生成专属训练周期
            </p>

            {/* 价格展示 */}
            <div className="mb-8 space-y-2">
              <div className="text-center">
                <span className="text-[rgb(var(--muted-foreground))]">个人专属计划定制：</span>
                <span className="text-2xl font-bold text-[rgb(var(--power-red))] ml-2">¥{PRICE_PLAN} / 6周</span>
              </div>
              <div className="text-center">
                <span className="text-[rgb(var(--muted-foreground))]">私人专属 AI 教练：</span>
                <span className="text-2xl font-bold text-[rgb(var(--power-orange))] ml-2">¥{PRICE_AI_COACH} / 6周</span>
              </div>
              <div className="text-center">
                <span className="text-[rgb(var(--muted-foreground))]">完整体验：</span>
                <span className="text-3xl font-black text-[rgb(var(--power-gold))] ml-2">¥{PRICE_BUNDLE} / 6周</span>
              </div>
            </div>

            {/* CTA Button */}
            <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-[rgb(var(--power-red))] hover:bg-[rgb(var(--primary-hover))] text-white text-xl px-12 py-7 font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105"
                >
                  查看付费方案
                  <Zap className="ml-2 w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase">
                    选择你的 AQUARION 训练服务
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    所有服务均以 6 周为一个周期。你可以单独购买训练计划，也可以额外启动私人专属 AI 教练。
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* 卡片 1：个人专属计划定制 */}
                  <PricingCard
                    title="个人专属计划定制"
                    price={PRICE_PLAN}
                    cycle="一周期 = 6周"
                    features={[
                      '专属能力评估',
                      '体重、手掌长度、小臂长度分析',
                      '技术路线建议',
                      '6周个人训练计划',
                      '每周自动递进',
                      '受伤状态调整模式',
                      '6周结束后强制重新评估',
                    ]}
                    description="适合想获得完整6周腕力专项训练计划的用户。"
                    onSubmit={(code) => handleInviteCodeSubmit(code, 'plan')}
                    inviteType="plan"
                    themeColor="rgb(var(--power-red))"
                  />

                  {/* 卡片 2：私人专属 AI 教练 */}
                  <PricingCard
                    title="启动私人专属 AI 教练"
                    price={PRICE_AI_COACH}
                    cycle="一周期 = 6周"
                    features={[
                      '私人AI腕力教练聊天',
                      '腕力知识答疑',
                      '技术路线分析',
                      '训练建议',
                      '饮食与体重管理建议',
                      '赛前准备建议',
                      '伤病恢复建议',
                      '联网搜索资料并自动总结',
                      '可参考用户当前训练数据',
                      '不会修改或干扰训练计划',
                    ]}
                    description="适合想随时获得腕力训练、技术、饮食、恢复和比赛策略建议的用户。"
                    onSubmit={(code) => handleInviteCodeSubmit(code, 'ai')}
                    inviteType="ai"
                    themeColor="rgb(var(--power-red))"
                  />

                  {/* 组合推荐卡片 */}
                  <PricingCard
                    title="完整 AQUARION 体验"
                    subtitle="个人专属计划定制 + 私人专属 AI 教练"
                    price={PRICE_BUNDLE}
                    cycle="一周期 = 6周"
                    features={[
                      `¥${PRICE_PLAN} 个人专属计划定制`,
                      `¥${PRICE_AI_COACH} 私人专属 AI 教练`,
                      '解锁完整 AQUARION 6周训练系统',
                    ]}
                    description=""
                    onSubmit={(code) => handleInviteCodeSubmit(code, 'bundle')}
                    inviteType="bundle"
                    themeColor="rgb(var(--power-red))"
                    recommended
                  />
                </div>
              </DialogContent>
            </Dialog>

            <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
              所有服务均以 6 周为一个周期 · 不会自动续费
            </p>
          </motion.div>
          
          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto"
          >
            <FeatureCard 
              icon={<Brain className="w-10 h-10" />}
              title="AI 技术分析"
              description="根据你的身体硬件数据，AI 智能推荐最适合你的技术路线"
            />
            <FeatureCard 
              icon={<Dumbbell className="w-10 h-10" />}
              title="科学训练计划"
              description="严格遵循专业训练理论，内侧力、外侧力、横向力、前端专项全面覆盖"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-10 h-10" />}
              title="精准进度追踪"
              description="每个动作独立进度管理，5×5 周期、RM 递增，严格按照训练指南递进"
            />
          </motion.div>
        </div>
      </div>
      
      {/* Training Philosophy Section */}
      <div className="border-t border-[rgb(var(--border))] py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 uppercase tracking-wide">
            <span className="text-[rgb(var(--power-red))]">训练</span>
            <span className="text-[rgb(var(--foreground))]">哲学</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <PhilosophyCard
              title="内侧力"
              subtitle="Inner Strength"
              color="rgb(var(--inner-strength))"
              description="二头弯举、内侧弯举、正面横扫、器械侧压"
            />
            <PhilosophyCard
              title="外侧力"
              subtitle="Outer Strength"
              color="rgb(var(--outer-strength))"
              description="虎口锤提、拇指旋提、锤式弯举、桡骨旋提"
            />
            <PhilosophyCard
              title="横向力"
              subtitle="Lateral Strength"
              color="rgb(var(--lateral-strength))"
              description="负重引体向上、侧面横扫、哑铃卧推"
            />
            <PhilosophyCard
              title="前端专项"
              subtitle="Front Control"
              color="rgb(var(--front-special))"
              description="屈腕、腕弯举、旋前旋后、指力训练"
            />
          </div>
        </div>
      </div>

      {/* 使用流程区域 */}
      <div className="border-t border-[rgb(var(--border))] py-20 bg-[rgb(var(--card))]/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 uppercase tracking-wide">
            <span className="text-[rgb(var(--power-red))]">使用</span>
            <span className="text-[rgb(var(--foreground))]">流程</span>
          </h3>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              <FlowStep number={1} title="选择付费方案" icon={<Zap className="w-6 h-6" />} />
              <FlowArrow />
              <FlowStep number={2} title="填写能力评估" icon={<Dumbbell className="w-6 h-6" />} />
              <FlowArrow />
              <FlowStep number={3} title="AI 推荐技术路线" icon={<Brain className="w-6 h-6" />} />
              <FlowArrow />
              <FlowStep number={4} title="生成 6 周计划" icon={<TrendingUp className="w-6 h-6" />} />
            </div>

            <div className="mt-8 flex items-center justify-center">
              <div className="text-center p-6 border border-[rgb(var(--power-red))] rounded-lg bg-[rgb(var(--card))]">
                <RefreshCw className="w-8 h-8 text-[rgb(var(--power-red))] mx-auto mb-2" />
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  第 6 周结束 → 重新评估并开启新周期
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 付费说明区域 */}
      <div className="border-t border-[rgb(var(--border))] py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase tracking-wide">
            <span className="text-[rgb(var(--power-red))]">付费</span>
            <span className="text-[rgb(var(--foreground))]">说明</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[rgb(var(--power-red))] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">¥{PRICE_PLAN}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">个人专属计划定制</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    每次支付 ¥{PRICE_PLAN}，解锁一个完整的 6 周训练周期。包含专属评估、技术建议和完整训练计划。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--power-red))]/50 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[rgb(var(--power-red))] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">私人专属 AI 教练</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    每次支付 ¥{PRICE_AI_COACH}，在 6 周周期内随时向AI教练咨询训练、技术、饮食和比赛准备建议。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <Lock className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">6 周后必须重新评估</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    训练 6 周后，你的力量数据和身体状态会发生变化。系统要求重新填写能力评估，
                    以确保新周期的训练计划依然精准适配你的当前水平。AI教练权限也会随周期结束。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <Check className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">不会自动续费</h4>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    我们不会自动扣费。每个周期结束后，你可以自行决定是否继续训练。
                    如需开启新周期，请重新支付并完成评估。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ number, title, icon }: { number: number; title: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[rgb(var(--card))] border-2 border-[rgb(var(--power-red))] p-4 rounded-lg text-center">
      <div className="flex items-center justify-center mb-2 text-[rgb(var(--power-red))]">
        {icon}
      </div>
      <div className="text-xs text-[rgb(var(--muted-foreground))] mb-1">步骤 {number}</div>
      <div className="text-sm font-bold">{title}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <div className="text-[rgb(var(--power-red))] text-2xl font-bold">→</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-8 hover:border-[rgb(var(--power-red))] transition-all duration-300 group">
      <div className="text-[rgb(var(--power-red))] mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-3 uppercase tracking-wide">{title}</h4>
      <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">{description}</p>
    </div>
  );
}

function PhilosophyCard({ title, subtitle, color, description }: {
  title: string;
  subtitle: string;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6 hover:scale-105 transition-all duration-300">
      <div className="h-1 mb-4" style={{ backgroundColor: color }} />
      <h5 className="text-2xl font-bold mb-1 uppercase">{title}</h5>
      <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4 uppercase tracking-wider">{subtitle}</p>
      <p className="text-sm text-[rgb(var(--foreground))]/70 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({
  title,
  subtitle,
  price,
  cycle,
  features,
  description,
  onSubmit,
  inviteType,
  themeColor,
  recommended = false,
}: {
  title: string;
  subtitle?: string;
  price: number;
  cycle: string;
  features: string[];
  description: string;
  onSubmit: (code: string) => void;
  inviteType: 'plan' | 'ai' | 'bundle';
  themeColor: string;
  recommended?: boolean;
}) {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      onSubmit(inviteCode.trim());
    }
  };

  return (
    <div
      className={`bg-[rgb(var(--card))] border-2 p-6 rounded-lg flex flex-col ${
        recommended ? 'border-[rgb(var(--power-gold))] shadow-lg shadow-[rgb(var(--power-gold))]/20' : 'border-[rgb(var(--border))]'
      }`}
    >
      {recommended && (
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1 bg-[rgb(var(--power-gold))] text-black text-xs font-bold uppercase tracking-wide rounded-full">
            推荐
          </span>
        </div>
      )}

      <div className="h-1 mb-4" style={{ backgroundColor: themeColor }} />

      <h4 className="text-xl font-bold mb-2 uppercase">{title}</h4>
      {subtitle && <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">{subtitle}</p>}

      <div className="mb-4">
        <div className="text-4xl font-black" style={{ color: themeColor }}>
          ¥{price}
        </div>
        <div className="text-sm text-[rgb(var(--muted-foreground))]">{cycle}</div>
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: themeColor }} />
            <span className="text-[rgb(var(--foreground))]">{feature}</span>
          </li>
        ))}
      </ul>

      {description && (
        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4 italic">{description}</p>
      )}

      {/* 邀请码输入区域 */}
      <div className="space-y-3">
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3 text-xs text-yellow-200">
          <p className="font-semibold mb-1">如何获取邀请码？</p>
          <p>请联系客服购买后获取邀请码</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="text"
            placeholder="输入邀请码"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full"
          />
          <Button
            type="submit"
            className="w-full text-white hover:opacity-90 transition-all whitespace-normal h-auto py-3 leading-tight"
            style={{ backgroundColor: themeColor }}
          >
            验证邀请码并解锁
          </Button>
        </form>
      </div>
    </div>
  );
}
