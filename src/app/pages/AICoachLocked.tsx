import { MessageCircle, Lock, Check, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { useState } from 'react';

const PRICE_AI_COACH = 99;

export default function AICoachLocked() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = () => {
    setIsProcessing(true);

    // 模拟付费流程
    setTimeout(() => {
      const currentCycleId = localStorage.getItem('currentCycleId');
      const paidCycles = localStorage.getItem('paidCycles');

      if (!currentCycleId || !paidCycles) {
        alert('未找到有效的训练周期。请先购买"个人专属计划定制"或"完整 AQUARION 体验"。');
        setIsProcessing(false);
        navigate('/');
        return;
      }

      const cycles = JSON.parse(paidCycles);
      const cycleIndex = cycles.findIndex((c: any) => c.id === currentCycleId);

      if (cycleIndex === -1) {
        alert('未找到当前周期。请先购买训练计划。');
        setIsProcessing(false);
        navigate('/');
        return;
      }

      const currentCycle = cycles[cycleIndex];

      // 检查周期状态和训练计划权限
      if (currentCycle.status !== 'active') {
        alert('当前训练周期已结束。请先开启新的训练周期后再购买 AI教练服务。');
        setIsProcessing(false);
        navigate('/');
        return;
      }

      if (!currentCycle.hasPlan) {
        alert('你还没有购买训练计划。AI教练需要配合训练计划使用。请先购买"个人专属计划定制"或"完整 AQUARION 体验"。');
        setIsProcessing(false);
        navigate('/');
        return;
      }

      // 更新当前周期，添加AI教练权限
      cycles[cycleIndex].hasAICoach = true;
      cycles[cycleIndex].aiCoachPaidAt = new Date().toISOString();
      localStorage.setItem('paidCycles', JSON.stringify(cycles));

      setIsProcessing(false);
      alert('支付成功！AI教练已启动。');
      window.location.reload(); // 重新加载页面以显示聊天界面
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* 锁定图标 */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-orange-900/20 rounded-full flex items-center justify-center border-2 border-[rgb(var(--power-orange))]/50">
                <Lock className="w-16 h-16 text-[rgb(var(--power-orange))]" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-[rgb(var(--power-orange))] rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider mb-4">
            <span className="text-[rgb(var(--power-orange))]">AQUARION</span>{' '}
            <span className="text-[rgb(var(--foreground))]">AI 教练</span>
          </h1>

          <p className="text-xl text-[rgb(var(--power-orange))] mb-8 font-semibold">私人专属腕力训练顾问</p>

          {/* 功能说明 */}
          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--power-orange))]/30 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-[rgb(var(--power-orange))]" />
              <h2 className="text-2xl font-bold">功能介绍</h2>
            </div>

            <p className="text-[rgb(var(--muted-foreground))] mb-6 leading-relaxed">
              私人专属 AI 教练为独立付费功能。支付 <strong className="text-[rgb(var(--power-orange))]">¥{PRICE_AI_COACH}</strong> 后，
              可在当前6周周期内向 AQUARION AI Coach 提问，获得腕力训练、技术、饮食、恢复和比赛准备建议。
              AI教练仅提供建议，不会修改你的训练计划。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">私人AI腕力教练聊天</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">腕力知识答疑</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">技术路线分析</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">训练建议</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">饮食与体重管理建议</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">赛前准备建议</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">伤病恢复建议</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">联网搜索资料并自动总结</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">可参考用户当前训练数据</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[rgb(var(--power-orange))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm">不会修改或干扰训练计划</span>
                </div>
              </div>
            </div>
          </div>

          {/* 价格和购买 */}
          <div className="bg-gradient-to-br from-orange-900/20 to-orange-600/10 border-2 border-[rgb(var(--power-orange))]/50 rounded-lg p-8 mb-6">
            <div className="text-5xl font-black text-[rgb(var(--power-orange))] mb-2">¥{PRICE_AI_COACH}</div>
            <div className="text-[rgb(var(--muted-foreground))] mb-6">一周期 = 6周</div>

            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="bg-[rgb(var(--power-orange))] hover:bg-[rgb(var(--power-orange))]/90 text-white text-lg px-10 py-6 font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {isProcessing ? '处理中...' : `支付 ¥${PRICE_AI_COACH} 启动 AI 教练`}
            </Button>
          </div>

          {/* 重要提示 */}
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-left text-sm text-yellow-200">
                <strong>重要提示：</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>AI教练权限与当前 6 周训练周期绑定</li>
                  <li>周期结束后，AI教练权限自动结束</li>
                  <li>新周期需要重新购买 AI教练服务</li>
                  <li>AI教练只读取训练数据，不会修改计划、周数或受伤状态</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
