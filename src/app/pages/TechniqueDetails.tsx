import { useParams, Link } from "react-router";
import { ArrowLeft, Target, AlertTriangle, Lightbulb, Play, BookOpen } from "lucide-react";

export function TechniqueDetails() {
  const { id } = useParams();

  const technique = {
    id: 1,
    name: "钩腕防守转换",
    category: "钩腕技术",
    level: "中级",
    description: "一种从防守姿态快速转换为进攻的钩腕技术，适用于应对顶压型对手",
    videoUrl: "#",
    steps: [
      {
        title: "起始姿态",
        description: "保持手腕稍微内旋，肘部紧贴垫子，肩部保持稳定位置。重心略微后倾，为后续转换做准备。",
      },
      {
        title: "识别时机",
        description: "当对手开始施加顶压力量时，感受手指根部的压力变化。这是转换的最佳时机。",
      },
      {
        title: "钩腕发力",
        description: "快速内旋手腕，同时前臂向身体方向收缩。动作要爆发性强，不给对手反应时间。",
      },
      {
        title: "身体配合",
        description: "随着手腕钩入，身体重心前移，肩部下压，形成完整的进攻姿态。",
      },
      {
        title: "保持压力",
        description: "持续施加钩腕力量，不要给对手喘息机会。注意保持肘部位置，避免被判犯规。",
      },
    ],
    keyPoints: [
      "时机选择是成功的关键，不要过早或过晚发力",
      "手腕内旋和前臂收缩必须同时进行",
      "身体重心转移要流畅，避免失去平衡",
      "保持肘部在合法区域内",
    ],
    commonMistakes: [
      "过早暴露意图，让对手有准备",
      "手腕和身体动作不协调",
      "发力后没有持续跟进",
      "忽视肩部稳定性",
    ],
    trainingDrills: [
      { name: "钩腕定点练习", sets: 5, reps: 10, description: "使用固定装置练习钩腕动作" },
      { name: "转换时机训练", sets: 4, reps: 8, description: "模拟对手顶压，练习转换时机" },
      { name: "身体协调性训练", sets: 3, reps: 12, description: "完整动作链的流畅性练习" },
    ],
    relatedTechniques: [
      { id: 2, name: "顶压防守", level: "中级" },
      { id: 3, name: "侧压转换", level: "高级" },
      { id: 4, name: "钩腕强化", level: "基础" },
    ],
  };

  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/training-plan"
          className="inline-flex items-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          返回训练计划
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[rgb(var(--primary))]/20 text-[rgb(var(--primary))] rounded text-sm">
              {technique.category}
            </span>
            <span className="px-3 py-1 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded text-sm">
              {technique.level}
            </span>
          </div>
          <h1 className="text-5xl mb-4">{technique.name}</h1>
          <p className="text-xl text-[rgb(var(--muted-foreground))]">{technique.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-[rgb(var(--primary))]/20 to-[rgb(var(--accent))]/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-[rgb(var(--card))]/50 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-[rgb(var(--primary))]" />
                  </div>
                  <p className="text-[rgb(var(--muted-foreground))]">教学视频</p>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[rgb(var(--primary))]" />
                技术步骤
              </h2>
              <div className="space-y-6">
                {technique.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-full flex items-center justify-center font-medium text-[rgb(var(--background))]">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="mb-2">{step.title}</h3>
                      <p className="text-[rgb(var(--muted-foreground))]">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-[rgb(var(--primary))]" />
                关键要点
              </h2>
              <ul className="space-y-3">
                {technique.keyPoints.map((point, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-[rgb(var(--primary))] rounded-full mt-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-[rgb(var(--accent))]" />
                常见错误
              </h2>
              <div className="space-y-3">
                {technique.commonMistakes.map((mistake, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-[rgb(var(--accent))]/10 border border-accent/20 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-2 flex-shrink-0" />
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-chart-4" />
                训练方法
              </h2>
              <div className="space-y-4">
                {technique.trainingDrills.map((drill, index) => (
                  <div key={index} className="bg-[rgb(var(--secondary))]/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3>{drill.name}</h3>
                      <span className="text-sm text-[rgb(var(--muted-foreground))]">
                        {drill.sets} 组 × {drill.reps} 次
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">{drill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[rgb(var(--primary))]/10 to-[rgb(var(--accent))]/10 border border-primary/20 rounded-lg p-6 sticky top-24">
              <h3 className="mb-4">快速行动</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-[rgb(var(--background))] rounded hover:opacity-90 transition-opacity">
                  添加到训练计划
                </button>
                <button className="w-full py-3 border border-[rgb(var(--border))] rounded hover:bg-[rgb(var(--secondary))] transition-colors">
                  收藏此技术
                </button>
                <Link
                  to="/coach"
                  className="block w-full py-3 border border-[rgb(var(--border))] rounded hover:bg-[rgb(var(--secondary))] transition-colors text-center"
                >
                  向 AI 教练提问
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-[rgb(var(--border))]">
                <h4 className="text-sm mb-3 text-[rgb(var(--muted-foreground))]">适合人群</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>钩腕型选手</span>
                    <span className="text-[rgb(var(--primary))]">★★★★★</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>全能型选手</span>
                    <span className="text-[rgb(var(--primary))]">★★★★☆</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>顶压型选手</span>
                    <span className="text-[rgb(var(--muted-foreground))]">★★☆☆☆</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[rgb(var(--border))]">
                <h4 className="text-sm mb-3 text-[rgb(var(--muted-foreground))]">难度评估</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span>技术难度</span>
                      <span>70%</span>
                    </div>
                    <div className="w-full bg-[rgb(var(--secondary))] rounded-full h-1.5">
                      <div className="w-[70%] h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span>力量要求</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-[rgb(var(--secondary))] rounded-full h-1.5">
                      <div className="w-[60%] h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span>实战效果</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-[rgb(var(--secondary))] rounded-full h-1.5">
                      <div className="w-[85%] h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-6">
              <h3 className="mb-4">相关技术</h3>
              <div className="space-y-3">
                {technique.relatedTechniques.map((related) => (
                  <Link
                    key={related.id}
                    to={`/techniques/${related.id}`}
                    className="block p-3 bg-[rgb(var(--secondary))]/50 rounded hover:bg-[rgb(var(--secondary))] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="group-hover:text-[rgb(var(--primary))] transition-colors">
                        {related.name}
                      </span>
                      <span className="text-xs px-2 py-1 bg-[rgb(var(--primary))]/20 text-[rgb(var(--primary))] rounded">
                        {related.level}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
