import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, Loader2 } from "lucide-react";

export function Subscription() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const subscriptionStatus = localStorage.getItem("subscriptionStatus");
  const isAlreadySubscribed = subscriptionStatus === "active";

  const plans = [
    {
      id: "monthly",
      name: "月度订阅",
      price: "¥99",
      period: "每月",
      description: "按月付费，随时取消"
    },
    {
      id: "yearly",
      name: "年度订阅",
      price: "¥999",
      period: "每年",
      description: "节省 ¥189，相当于每月 ¥83",
      badge: "推荐"
    }
  ];

  const benefits = [
    "AI 个性化训练计划生成",
    "每周动态调整训练强度",
    "伤痛状态恢复计划",
    "训练记录追踪和可视化",
    "AI 教练实时答疑",
    "12周系统训练方案",
    "无限次重新生成计划",
    "优先客户支持"
  ];

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set subscription status to active
    localStorage.setItem("subscriptionStatus", "active");
    localStorage.setItem("subscriptionPlan", selectedPlan);
    localStorage.setItem("subscriptionDate", new Date().toISOString());
    
    setIsProcessing(false);
    
    // Navigate to assessment
    navigate("/assessment");
  };

  if (isAlreadySubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-[rgb(var(--primary))]/10 border border-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-[rgb(var(--primary))]" />
          </div>
          <h1 className="text-3xl font-bold mb-4">订阅已激活</h1>
          <p className="text-[rgb(var(--muted-foreground))] mb-8">
            你已经订阅了 Dragon Arm AI 训练平台
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/training-plan")}
              className="px-6 py-3 bg-[rgb(var(--primary))] text-[rgb(var(--background))] hover:bg-[rgb(var(--primary))]/90 transition-all"
            >
              查看训练计划
            </button>
            <button
              onClick={() => navigate("/assessment")}
              className="px-6 py-3 border border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary))] transition-all"
            >
              重新评估
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">
            选择你的订阅方案
          </h1>
          <p className="text-lg text-[rgb(var(--muted-foreground))]">
            订阅后立即开始能力评估，AI 将为你生成个性化训练计划
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Plan Cards */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as "monthly" | "yearly")}
                  className={`w-full text-left p-6 border-2 transition-all ${
                    selectedPlan === plan.id
                      ? "border-primary bg-[rgb(var(--primary))]/5"
                      : "border-[rgb(var(--border))] hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">{plan.description}</p>
                    </div>
                    {plan.badge && (
                      <span className="px-3 py-1 bg-[rgb(var(--primary))] text-[rgb(var(--background))] text-xs font-medium uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-[rgb(var(--muted-foreground))]">/ {plan.period}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full mt-6 px-8 py-4 bg-[rgb(var(--primary))] text-[rgb(var(--background))] text-lg font-medium uppercase tracking-wide hover:bg-[rgb(var(--primary))]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  处理中...
                </>
              ) : (
                "立即订阅并开始"
              )}
            </button>

            <p className="text-xs text-[rgb(var(--muted-foreground))] text-center mt-4">
              目前为模拟支付，实际部署时将集成 Stripe 支付
            </p>
          </div>

          {/* Benefits */}
          <div className="border border-[rgb(var(--border))] p-8">
            <h3 className="text-xl font-bold mb-6">订阅权益</h3>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[rgb(var(--primary))] flex-shrink-0 mt-0.5" />
                  <span className="text-[rgb(var(--muted-foreground))]">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="border-t border-[rgb(var(--border))] pt-12">
          <h3 className="text-2xl font-bold mb-6 text-center">常见问题</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">可以随时取消吗？</h4>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                是的，你可以随时取消订阅。取消后将在当前计费周期结束后停止续费。
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">训练计划如何生成？</h4>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                完成7步能力评估后，AI 会根据你的身体数据、训练经验、技术风格和伤痛情况生成个性化计划。
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">受伤了怎么办？</h4>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                训练计划页面有"受伤状态"开关，开启后 AI 会调整训练强度，进入恢复模式。
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">如何调整训练计划？</h4>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                每周根据你的完成情况和疼痛反馈，AI 会自动调整下一周的训练强度和内容。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}