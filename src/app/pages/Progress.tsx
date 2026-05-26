import { TrendingUp, Calendar, Activity, AlertTriangle } from "lucide-react";

export function Progress() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl uppercase tracking-tight mb-2">进步追踪</h1>
          <p className="text-[rgb(var(--muted-foreground))]">
            查看你的训练数据和进步趋势
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-sm text-[rgb(var(--muted-foreground))]">总训练周数</div>
          </div>

          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <div className="text-3xl font-bold mb-1">85%</div>
            <div className="text-sm text-[rgb(var(--muted-foreground))]">平均完成率</div>
          </div>

          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-[rgb(var(--primary))]" />
            </div>
            <div className="text-3xl font-bold mb-1">36</div>
            <div className="text-sm text-[rgb(var(--muted-foreground))]">总训练次数</div>
          </div>

          <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
            <div className="text-3xl font-bold mb-1">2.1</div>
            <div className="text-sm text-[rgb(var(--muted-foreground))]">平均疼痛评分</div>
          </div>
        </div>

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-8">
          <h2 className="text-2xl font-bold mb-6">主要动作重量变化</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">对握负重引体</span>
                <span className="text-[rgb(var(--primary))]">+15kg</span>
              </div>
              <div className="w-full h-2 bg-[rgb(var(--secondary))]">
                <div className="h-full bg-[rgb(var(--primary))]" style={{ width: "75%" }} />
              </div>
              <div className="flex items-center justify-between mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                <span>起始: 体重+5kg</span>
                <span>当前: 体重+20kg</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">4cm 卷把屈腕</span>
                <span className="text-[rgb(var(--primary))]">+12kg</span>
              </div>
              <div className="w-full h-2 bg-[rgb(var(--secondary))]">
                <div className="h-full bg-[rgb(var(--primary))]" style={{ width: "60%" }} />
              </div>
              <div className="flex items-center justify-between mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                <span>起始: 20kg</span>
                <span>当前: 32kg</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">单手哑铃二头弯举</span>
                <span className="text-[rgb(var(--primary))]">+8kg</span>
              </div>
              <div className="w-full h-2 bg-[rgb(var(--secondary))]">
                <div className="h-full bg-[rgb(var(--primary))]" style={{ width: "50%" }} />
              </div>
              <div className="flex items-center justify-between mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                <span>起始: 16kg</span>
                <span>当前: 24kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-[rgb(var(--primary))]/10 to-[rgb(var(--accent))]/10 border border-primary/20 p-6">
          <h3 className="font-bold mb-2">训练提示</h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            你的进步很稳定！继续保持当前训练频率和强度。建议下周在前端专项动作上尝试增加2-3kg重量。
          </p>
        </div>
      </div>
    </div>
  );
}
