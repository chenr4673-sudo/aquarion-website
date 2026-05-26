import { Check } from "lucide-react";
import { Link } from "react-router";

export function Pricing() {
  const plans = [
    {
      name: "基础版",
      price: "¥99",
      period: "/月",
      description: "适合腕力新手",
      features: [
        "基础能力评估",
        "标准训练计划",
        "技术库访问（100+技术）",
        "进度追踪",
        "社区访问",
        "邮件支持",
      ],
      cta: "开始使用",
      highlighted: false,
    },
    {
      name: "专业版",
      price: "¥199",
      period: "/月",
      description: "最受欢迎的选择",
      features: [
        "完整能力评估",
        "个性化训练计划",
        "完整技术库（500+技术）",
        "AI 教练聊天（无限制）",
        "高级进度分析",
        "视频分析功能",
        "优先支持",
        "月度 1v1 咨询",
      ],
      cta: "立即订阅",
      highlighted: true,
    },
    {
      name: "精英版",
      price: "¥399",
      period: "/月",
      description: "适合认真的竞技者",
      features: [
        "专业版所有功能",
        "实时比赛策略分析",
        "定制训练计划",
        "每周 1v1 教练指导",
        "生物力学分析",
        "营养计划定制",
        "伤病预防方案",
        "专属社区",
        "VIP 支持",
      ],
      cta: "联系我们",
      highlighted: false,
    },
  ];

  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[rgb(var(--primary))]/10 border border-primary/20 rounded-full mb-6">
            <span className="text-[rgb(var(--primary))] text-sm uppercase tracking-wider">订阅套餐</span>
          </div>
          <h1 className="text-5xl mb-4">选择适合你的计划</h1>
          <p className="text-xl text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto">
            无论你是初学者还是职业选手，我们都有适合你的方案
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-lg p-8 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-[rgb(var(--primary))]/10 to-[rgb(var(--accent))]/10 border-2 border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-[rgb(var(--card))] border border-[rgb(var(--border))] hover:border-primary/50 transition-all"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-[rgb(var(--background))] text-sm rounded-full">
                  最受欢迎
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl mb-2">{plan.name}</h3>
                <p className="text-[rgb(var(--muted-foreground))] text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl">{plan.price}</span>
                  <span className="text-[rgb(var(--muted-foreground))]">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[rgb(var(--primary))] flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/login"
                className={`block w-full py-3 rounded text-center transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-[rgb(var(--background))] hover:opacity-90"
                    : "border border-[rgb(var(--border))] hover:bg-[rgb(var(--secondary))]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-8 mb-16">
          <h2 className="text-3xl mb-8 text-center">常见问题</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="mb-2">可以随时取消吗？</h3>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                是的，你可以随时取消订阅。取消后，你仍可使用服务至当前计费周期结束。
              </p>
            </div>

            <div>
              <h3 className="mb-2">可以升级或降级套餐吗？</h3>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                当然可以。你可以随时升级或降级套餐，差价将按比例计算。
              </p>
            </div>

            <div>
              <h3 className="mb-2">支持哪些支付方式？</h3>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                我们支持信用卡、支付宝、微信支付等多种支付方式。
              </p>
            </div>

            <div>
              <h3 className="mb-2">有试用期吗？</h3>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                所有新用户享有 7 天免费试用，无需绑定支付方式。
              </p>
            </div>

            <div>
              <h3 className="mb-2">数据安全吗？</h3>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                我们采用银行级加密技术保护你的数据，绝不会泄露你的个人信息。
              </p>
            </div>

            <div>
              <h3 className="mb-2">有团队折扣吗？</h3>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                5 人以上的团队可享受特别折扣，请联系我们获取定制方案。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[rgb(var(--primary))]/10 via-accent/10 to-[rgb(var(--primary))]/10 border border-primary/20 rounded-lg p-12 text-center">
          <h2 className="text-3xl mb-4">还在犹豫？</h2>
          <p className="text-[rgb(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
            免费试用 7 天，亲身体验 AI 教练的强大功能。无需信用卡，随时可以取消。
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-[rgb(var(--background))] rounded hover:opacity-90 transition-opacity"
          >
            开始免费试用
          </Link>
        </div>
      </div>
    </div>
  );
}
