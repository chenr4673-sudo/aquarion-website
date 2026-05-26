import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Calendar, Target, Dumbbell, Info, AlertTriangle, Heart, Lock } from 'lucide-react';
import { motion } from 'motion/react';

// 常量定义
const MAX_WEEKS = 6; // 最大训练周数
const PRICE_PER_CYCLE = 30; // 每个周期价格（元）

// 动作进度类型
interface ExerciseProgress {
  exercise: string;
  category: string;
  progressType: '5x5' | '20-30rm' | 'three-seven' | '12x4-inner' | '8x4-outer' | '12x4-lateral' | 'functional';
  trainingCount: number; // 该动作被训练的总次数
  currentWeight: number;
  currentRM: number;
  currentSets: number;
}

// 训练日
interface TrainingDay {
  day: string;
  dayName: string;
  focus: string;
  exercises: {
    exercise: string;
    weight: number;
    rm: number;
    sets: number;
    category: string;
    note?: string;
  }[];
}

export default function TrainingPlan() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekPlan, setWeekPlan] = useState<TrainingDay[]>([]);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [techRecommendation, setTechRecommendation] = useState<any>(null);
  const [exerciseProgresses, setExerciseProgresses] = useState<{ [key: string]: ExerciseProgress }>({});

  // 受伤状态管理
  const [isInjured, setIsInjured] = useState(false);
  const [injuredParts, setInjuredParts] = useState<string[]>([]);
  const [injuryWeek, setInjuryWeek] = useState(0); // 受伤后的周数（0=未受伤，1-3=恢复期）

  // 确认弹窗状态
  const [showNextWeekConfirm, setShowNextWeekConfirm] = useState(false);

  // 检查付费状态 - 必须购买训练计划
  const checkPaymentStatus = (): boolean => {
    const paidCycles = localStorage.getItem('paidCycles');
    if (!paidCycles) return false;

    const cycles = JSON.parse(paidCycles);
    const currentCycleId = localStorage.getItem('currentCycleId');

    if (!currentCycleId) return false;

    return cycles.some((cycle: any) =>
      cycle.id === currentCycleId && cycle.status === 'active' && cycle.hasPlan === true
    );
  };

  useEffect(() => {
    // 检查付费状态
    if (!checkPaymentStatus()) {
      alert('请先完成付费才能使用训练计划功能');
      navigate('/');
      return;
    }

    // 加载评估数据和技术建议
    const assessmentStr = localStorage.getItem('assessmentData');
    const techStr = localStorage.getItem('techRecommendation');

    if (!assessmentStr) {
      navigate('/assessment');
      return;
    }

    const assessment = JSON.parse(assessmentStr);
    const tech = techStr ? JSON.parse(techStr) : null;

    setAssessmentData(assessment);
    setTechRecommendation(tech);

    // 初始化动作进度（第一周）
    const progresses = initializeExerciseProgresses(assessment);
    setExerciseProgresses(progresses);
  }, [navigate]);

  useEffect(() => {
    if (!assessmentData) return;

    // 生成当前周的训练计划
    const plan = generateWeekPlan(
      assessmentData,
      exerciseProgresses,
      currentWeek,
      isInjured,
      injuredParts,
      injuryWeek
    );
    setWeekPlan(plan);
  }, [assessmentData, exerciseProgresses, currentWeek, isInjured, injuredParts, injuryWeek]);

  const handlePreviousWeek = () => {
    // 不允许返回上一周
    alert('为保证训练计划的严谨性，不支持返回上一周查看。请专注于当前周的训练。');
  };

  // 点击下一周按钮（弹出确认）
  const handleNextWeekClick = () => {
    if (currentWeek >= MAX_WEEKS) {
      // 已经是第6周，不能继续
      return;
    }
    // 显示确认弹窗
    setShowNextWeekConfirm(true);
  };

  // 确认进入下一周
  const confirmNextWeek = () => {
    setShowNextWeekConfirm(false);

    // 推进进度
    const newProgresses = isInjured
      ? exerciseProgresses // 受伤期间不推进进度
      : advanceProgresses(exerciseProgresses, assessmentData);
    setExerciseProgresses(newProgresses);
    setCurrentWeek(currentWeek + 1);

    // 如果处于受伤状态，增加受伤周数
    if (isInjured) {
      const newInjuryWeek = injuryWeek + 1;
      setInjuryWeek(newInjuryWeek);

      // 三周后自动关闭受伤状态
      if (newInjuryWeek > 3) {
        setIsInjured(false);
        setInjuredParts([]);
        setInjuryWeek(0);
        alert('三周恢复期已完成，系统已自动恢复正常训练模式。如果仍有疼痛、麻木、刺痛、无力或放射痛，请停止高强度训练并及时就医。');
      }
    }

    // 如果完成第6周，提示重新评估
    if (currentWeek + 1 === MAX_WEEKS) {
      // 到达第6周，但不弹窗，让用户先完成第6周训练
    }
  };

  // 取消进入下一周
  const cancelNextWeek = () => {
    setShowNextWeekConfirm(false);
  };

  // 完成第6周，开始重新评估
  const handleCycleComplete = () => {
    // 检查是否有AI教练权限
    const currentCycleId = localStorage.getItem('currentCycleId');
    let hadAICoach = false;

    if (currentCycleId) {
      const paidCycles = JSON.parse(localStorage.getItem('paidCycles') || '[]');
      const currentCycle = paidCycles.find((cycle: any) => cycle.id === currentCycleId);
      if (currentCycle && currentCycle.hasAICoach) {
        hadAICoach = true;
      }
    }

    let message = '当前 6 周训练周期已完成。由于你的力量数据、恢复状态和技术适配可能已经发生变化，请重新填写能力评估。系统会根据新的身体数据、训练频率和动作重量，重新生成下一轮 6 周训练计划。';

    if (hadAICoach) {
      message += '\n\n你的 AI教练服务已随本轮 6 周周期结束。如需继续使用 AQUARION AI Coach，请开启新的训练周期并重新购买 AI教练服务。';
    }

    alert(message);

    // 清除当前评估数据，但保留付费状态
    localStorage.removeItem('assessmentData');
    localStorage.removeItem('techRecommendation');

    // 标记当前周期为已完成
    if (currentCycleId) {
      const paidCycles = JSON.parse(localStorage.getItem('paidCycles') || '[]');
      const updatedCycles = paidCycles.map((cycle: any) => {
        if (cycle.id === currentCycleId) {
          return { ...cycle, status: 'completed', completedAt: new Date().toISOString() };
        }
        return cycle;
      });
      localStorage.setItem('paidCycles', JSON.stringify(updatedCycles));
      localStorage.removeItem('currentCycleId');
    }

    // 跳转到首页续费
    navigate('/');
  };

  // 处理受伤状态开关
  const handleInjuryToggle = (checked: boolean) => {
    setIsInjured(checked);
    if (checked) {
      setInjuryWeek(1); // 开启时设为第1周
    } else {
      // 手动关闭时重置
      setInjuredParts([]);
      setInjuryWeek(0);
    }
  };

  // 处理受伤部位选择
  const handleInjuredPartToggle = (part: string) => {
    setInjuredParts(prev =>
      prev.includes(part)
        ? prev.filter(p => p !== part)
        : [...prev, part]
    );
  };

  if (!assessmentData || weekPlan.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 text-[rgb(var(--power-red))] animate-pulse mx-auto mb-4" />
          <p className="text-xl text-[rgb(var(--muted-foreground))]">正在生成训练计划...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 md:w-10 h-8 md:h-10 text-[rgb(var(--power-red))]" />
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wider">
                  训练计划 <span className="text-[rgb(var(--power-red))]">第 {currentWeek} 周</span>
                </h1>
                <p className="text-sm md:text-base text-[rgb(var(--muted-foreground))] mt-1">
                  当前周期：第 {currentWeek} / {MAX_WEEKS} 周 · 每周 {assessmentData.weeklyFrequency} 次训练
                  {techRecommendation && ` · 主技术：${techRecommendation.mainTechnique}`}
                </p>
                {currentWeek === MAX_WEEKS && (
                  <p className="text-sm font-semibold mt-2 text-yellow-500">
                    ⚠️ 当前周期最后一周：第 {MAX_WEEKS} / {MAX_WEEKS} 周
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              onClick={handlePreviousWeek}
              disabled={true}
              variant="outline"
              size="sm"
              className="gap-2 flex-shrink-0 opacity-50 cursor-not-allowed"
              title="不支持返回上一周"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">上一周</span>
            </Button>
            <div className="flex-1 text-center">
              <div
                className="inline-block bg-[rgb(var(--card))] border border-[rgb(var(--border))] px-4 md:px-6 py-2"
                style={isInjured ? { borderColor: 'rgb(var(--klein-blue))' } : {}}
              >
                <span
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: isInjured ? 'rgb(var(--klein-blue))' : 'rgb(var(--power-red))' }}
                >
                  Week {currentWeek} / {MAX_WEEKS}
                  {isInjured && injuryWeek > 0 && (
                    <span className="ml-2 text-base">
                      (恢复{injuryWeek <= 3 ? `第${injuryWeek}周` : '过渡'})
                    </span>
                  )}
                </span>
              </div>
            </div>
            {currentWeek < MAX_WEEKS ? (
              <Button
                onClick={handleNextWeekClick}
                size="sm"
                className="gap-2 flex-shrink-0"
                style={isInjured
                  ? { backgroundColor: 'rgb(var(--klein-blue))', color: 'white' }
                  : { backgroundColor: 'rgb(var(--power-red))', color: 'white' }
                }
              >
                <span className="hidden sm:inline">查看下一周计划</span>
                <span className="sm:hidden">下一周</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCycleComplete}
                size="sm"
                className="gap-2 flex-shrink-0 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">重新进行能力评估</span>
                <span className="sm:hidden">重新评估</span>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Injury Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div
            className="bg-[rgb(var(--card))] border-2 p-6"
            style={{ borderColor: isInjured ? 'rgb(var(--klein-blue))' : 'rgb(var(--border))' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {isInjured ? (
                  <Heart className="w-6 h-6" style={{ color: 'rgb(var(--klein-blue))' }} />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
                )}
                <div>
                  <h3 className="text-lg font-bold uppercase">受伤状态</h3>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    {isInjured
                      ? '伤病调整模式已开启，训练压力已降低'
                      : '如果你当前手指、手掌、手腕或肘部有明显疼痛，请开启受伤状态'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isInjured}
                onCheckedChange={handleInjuryToggle}
                className="scale-150"
                style={{
                  backgroundColor: isInjured ? 'rgb(var(--klein-blue))' : 'rgb(100, 100, 100)',
                }}
              />
            </div>

            {/* Injured Parts Selection */}
            {isInjured && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgb(59, 130, 246, 0.3)' }}>
                <Label className="text-base font-semibold mb-3 block">
                  请选择受伤部位（可多选）
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    '手指/手掌',
                    '手腕桡侧',
                    '手腕尺侧',
                    '肘部内侧',
                    '肘部外侧'
                  ].map(part => (
                    <div
                      key={part}
                      className="flex items-center space-x-2 p-3 border rounded cursor-pointer hover:bg-[rgb(var(--muted))]/50"
                      style={{
                        borderColor: injuredParts.includes(part) ? 'rgb(var(--klein-blue))' : 'rgb(var(--border))',
                        backgroundColor: injuredParts.includes(part) ? 'rgb(59, 130, 246, 0.1)' : 'transparent'
                      }}
                      onClick={() => handleInjuredPartToggle(part)}
                    >
                      <Checkbox
                        id={part}
                        checked={injuredParts.includes(part)}
                        onCheckedChange={() => handleInjuredPartToggle(part)}
                        className="w-5 h-5"
                        style={{
                          borderColor: injuredParts.includes(part) ? 'rgb(var(--klein-blue))' : 'rgb(100, 100, 100)',
                          backgroundColor: injuredParts.includes(part) ? 'rgb(var(--klein-blue))' : 'transparent',
                        }}
                      />
                      <Label
                        htmlFor={part}
                        className="flex-1 cursor-pointer font-medium"
                      >
                        {part}
                      </Label>
                    </div>
                  ))}
                </div>

                {injuredParts.length > 0 && (
                  <div
                    className="mt-4 p-4 border rounded"
                    style={{
                      backgroundColor: 'rgb(59, 130, 246, 0.1)',
                      borderColor: 'rgb(var(--klein-blue))'
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'rgb(var(--klein-blue))' }}>
                      {injuredParts.length > 1 ? '多部位伤病保护模式：' : '当前受伤部位：'}
                      {injuredParts.join(' + ')}
                    </p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                      {getInjuryMessage(injuredParts)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Injury Alert Banner */}
          {isInjured && injuredParts.length > 0 && (
            <div
              className="mt-4 p-4 border-2 rounded"
              style={{
                backgroundColor: 'rgb(59, 130, 246, 0.1)',
                borderColor: 'rgb(var(--klein-blue))'
              }}
            >
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(var(--klein-blue))' }} />
                <div className="flex-1">
                  <p className="font-bold" style={{ color: 'rgb(var(--klein-blue))' }}>
                    当前处于伤病调整模式
                  </p>
                  <p className="text-sm text-[rgb(var(--foreground))] mt-1">
                    训练计划已降低整体压力，并根据受伤部位进行恢复期调整。所有相关训练重量已减少20%。
                    不追求突破重量，专注于维持动作质量、促进恢复。
                  </p>
                  {injuryWeek === 3 && (
                    <p className="text-sm font-semibold mt-2" style={{ color: 'rgb(var(--klein-blue))' }}>
                      恢复第3周/过渡恢复周：如果疼痛明显减轻，可逐步恢复到原重量的85%-90%。
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Training Days */}
        <div className="space-y-6">
          {weekPlan.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TrainingDayCard day={day} isInjured={isInjured} injuryWeek={injuryWeek} />
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/tech-analysis')}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Target className="w-5 h-5" />
            查看技术建议
          </Button>
        </div>
      </div>

      {/* 确认进入下一周弹窗 */}
      <AlertDialog open={showNextWeekConfirm} onOpenChange={setShowNextWeekConfirm}>
        <AlertDialogContent className="bg-[rgb(var(--card))] border-2 border-[rgb(var(--power-red))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-[rgb(var(--power-red))]">
              确认进入下一周训练？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-[rgb(var(--foreground))] mt-4">
              您确定要进入第 {currentWeek + 1} 周的训练吗？
              <br /><br />
              <strong className="text-yellow-500">⚠️ 重要提醒：</strong>
              <br />
              进入后，您将<strong>无法回到第 {currentWeek} 周</strong>的训练内容，也无法再次查看第 {currentWeek} 周的完整训练计划。
              <br /><br />
              请确保您已完成本周训练后再进入下一周。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelNextWeek}
              className="bg-[rgb(var(--muted))] hover:bg-[rgb(var(--muted))]/80"
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmNextWeek}
              className="bg-[rgb(var(--power-red))] hover:bg-[rgb(var(--primary-hover))] text-white"
            >
              确定进入第 {currentWeek + 1} 周
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// 训练日卡片组件
function TrainingDayCard({ day, isInjured, injuryWeek }: { day: TrainingDay; isInjured: boolean; injuryWeek: number }) {
  const isRestDay = day.exercises.length === 0;
  const themeColor = isInjured ? 'rgb(var(--klein-blue))' : 'rgb(var(--power-red))';

  if (isRestDay) {
    return (
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6 opacity-60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase">{day.dayName}</h3>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">{day.focus}</p>
          </div>
          <div className="text-4xl">💤</div>
        </div>
      </div>
    );
  }

  // 分组显示：主训练 + 前端专项
  const mainExercises = day.exercises.filter(e =>
    !e.category.includes('前端') || e.category === '前端三七训练法'
  );
  const frontSpecialExercises = day.exercises.filter(e =>
    e.category.includes('前端') && e.category !== '前端三七训练法'
  );

  return (
    <div
      className="bg-[rgb(var(--card))] border-2 transition-colors"
      style={{
        borderColor: 'rgb(var(--border))',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = themeColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgb(var(--border))';
      }}
    >
      {/* Header */}
      <div
        className="p-6"
        style={{
          background: `linear-gradient(to right, ${themeColor}, transparent)`
        }}
      >
        <h3 className="text-2xl font-black uppercase">{day.dayName}</h3>
        <p className="text-[rgb(var(--foreground)/0.9)] mt-1 font-semibold">{day.focus}</p>
      </div>

      {/* Exercises */}
      <div className="p-6">
        {mainExercises.length > 0 && (
          <div className="mb-6">
            <h4
              className="text-lg font-bold mb-4 uppercase"
              style={{ color: themeColor }}
            >
              主训练
            </h4>
            <div className="space-y-3">
              {mainExercises.map((exercise, index) => (
                <ExerciseRow
                  key={index}
                  exercise={exercise}
                  index={index + 1}
                  isInjured={isInjured}
                  themeColor={themeColor}
                />
              ))}
            </div>
          </div>
        )}

        {frontSpecialExercises.length > 0 && (
          <div>
            <h4 className="text-lg font-bold mb-4 uppercase text-[rgb(var(--front-special))]">
              前端专项
            </h4>
            <div className="space-y-3">
              {frontSpecialExercises.map((exercise, index) => (
                <ExerciseRow
                  key={index}
                  exercise={exercise}
                  index={mainExercises.length + index + 1}
                  isInjured={isInjured}
                  themeColor={themeColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 动作行组件
function ExerciseRow({
  exercise,
  index,
  isInjured,
  themeColor
}: {
  exercise: any;
  index: number;
  isInjured: boolean;
  themeColor: string;
}) {
  const categoryColor = getCategoryColor(exercise.category);

  return (
    <div
      className="flex items-start gap-3 p-4 bg-[rgb(var(--background))]/50 border transition-colors"
      style={{
        borderColor: 'rgb(var(--border), 0.5)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${themeColor}4D`; // 30% opacity
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgb(var(--border), 0.5)';
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold"
        style={{ backgroundColor: themeColor }}
      >
        {index}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h5 className="font-bold text-lg mb-1">{exercise.exercise}</h5>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs px-2 py-1 uppercase tracking-wide font-semibold"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}40`
                }}
              >
                {exercise.category}
              </span>
            </div>
            {exercise.note && (
              <div className="flex items-start gap-2 mt-2 text-sm text-[rgb(var(--muted-foreground))]">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{exercise.note}</span>
              </div>
            )}
            {/* 显示伤病调整信息 */}
            {exercise.originalWeight && exercise.originalWeight !== exercise.weight && (
              <div
                className="mt-2 p-2 border rounded text-xs"
                style={{
                  backgroundColor: 'rgb(59, 130, 246, 0.1)',
                  borderColor: 'rgb(59, 130, 246, 0.3)'
                }}
              >
                <p className="text-[rgb(var(--muted-foreground))]">
                  原计划：{exercise.originalWeight}kg × {exercise.rm}RM × {exercise.sets}组
                </p>
                <p className="font-semibold mt-1" style={{ color: 'rgb(var(--klein-blue))' }}>
                  伤病调整：重量降低 20%，保持动作质量，不追求突破
                </p>
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black" style={{ color: themeColor }}>
              {exercise.weight}kg
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              {exercise.rm > 0 ? `${exercise.rm}RM × ` : ''}{exercise.sets}组
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 获取训练类型颜色
function getCategoryColor(category: string): string {
  if (category.includes('内侧力')) return 'rgb(var(--inner-strength))';
  if (category.includes('外侧力')) return 'rgb(var(--outer-strength))';
  if (category.includes('横向力')) return 'rgb(var(--lateral-strength))';
  if (category.includes('前端')) return 'rgb(var(--front-special))';
  return 'rgb(var(--muted-foreground))';
}

// 初始化动作进度（第一周）
function initializeExerciseProgresses(assessmentData: any): { [key: string]: ExerciseProgress } {
  const progresses: { [key: string]: ExerciseProgress } = {};
  const exercises = assessmentData.exercises;

  // 5RM×5组增力类
  const fiveByFiveExercises = [
    '二头弯举', '内侧弯举', '虎口锤提', '拇指旋提', '负重对握/反握引体向上'
  ];
  
  fiveByFiveExercises.forEach(exercise => {
    if (exercises[exercise]) {
      progresses[exercise] = {
        exercise,
        category: exercise.includes('二头') || exercise.includes('内侧') ? '内侧力' :
                 exercise.includes('虎口') || exercise.includes('拇指') ? '外侧力' : '横向力',
        progressType: '5x5',
        trainingCount: 0,
        currentWeight: parseFloat(exercises[exercise]),
        currentRM: 5,
        currentSets: 5
      };
    }
  });

  // 20-30RM×5组前端专项
  const frontSpecialExercises = [
    '4cm卷把无绑带屈腕', '6cm卷把带绑带屈腕', '单边细卷把无绑带屈腕',
    '哑铃腕弯举', 'V杆/固定器械旋前旋后', '6cm滚雷屈腕', '弹力带拇指根屈'
  ];
  
  frontSpecialExercises.forEach(exercise => {
    if (exercises[exercise]) {
      progresses[exercise] = {
        exercise,
        category: '前端专项',
        progressType: '20-30rm',
        trainingCount: 0,
        currentWeight: parseFloat(exercises[exercise]),
        currentRM: 20,
        currentSets: 5
      };
    }
  });

  // 三七训练法
  const threeSevenExercises = ['指力把手（三七训练法）', '拇指硬币捏块（三七训练法）'];
  threeSevenExercises.forEach(exercise => {
    if (exercises[exercise]) {
      progresses[exercise] = {
        exercise,
        category: '前端三七训练法',
        progressType: 'three-seven',
        trainingCount: 0,
        currentWeight: parseFloat(exercises[exercise]),
        currentRM: 0, // 三七训练法不用RM
        currentSets: 6
      };
    }
  });

  // 12RM×4组内侧力
  const innerTwelveExercises = ['正面横扫', '器械侧压'];
  innerTwelveExercises.forEach(exercise => {
    if (exercises[exercise]) {
      progresses[exercise] = {
        exercise,
        category: '内侧力',
        progressType: '12x4-inner',
        trainingCount: 0,
        currentWeight: parseFloat(exercises[exercise]),
        currentRM: 12,
        currentSets: 4
      };
    }
  });

  // 8RM×4组外侧力
  const outerEightExercises = [
    '锤式弯举', '桡骨旋提', '虎口旋提', '拳峰提', '负重对握引体向上', '哑铃阿尔森划船'
  ];
  outerEightExercises.forEach(exercise => {
    if (exercises[exercise]) {
      progresses[exercise] = {
        exercise,
        category: '外侧力',
        progressType: '8x4-outer',
        trainingCount: 0,
        currentWeight: parseFloat(exercises[exercise]),
        currentRM: 8,
        currentSets: 4
      };
    }
  });

  // 12RM×4组横向力
  const lateralTwelveExercises = ['侧面卷把横扫', '哑铃卧推', '哑铃推肩'];
  lateralTwelveExercises.forEach(exercise => {
    if (exercises[exercise]) {
      progresses[exercise] = {
        exercise,
        category: '横向力',
        progressType: '12x4-lateral',
        trainingCount: 0,
        currentWeight: parseFloat(exercises[exercise]),
        currentRM: 12,
        currentSets: 4
      };
    }
  });

  // 前端功能性训练
  const functionalExercises = ['握力器练习', '千斤卷/卷杆子练习', '米桶训练'];
  functionalExercises.forEach(exercise => {
    if (exercises[exercise]) {
      progresses[exercise] = {
        exercise,
        category: '前端功能性',
        progressType: 'functional',
        trainingCount: 0,
        currentWeight: parseFloat(exercises[exercise]),
        currentRM: 20,
        currentSets: 5
      };
    }
  });

  return progresses;
}

// 推进所有动作进度（进入下一周）
function advanceProgresses(
  currentProgresses: { [key: string]: ExerciseProgress },
  assessmentData: any
): { [key: string]: ExerciseProgress } {
  const newProgresses = { ...currentProgresses };
  const frequency = parseInt(assessmentData.weeklyFrequency);
  
  // 计算每周每个动作大概会被训练几次
  // 这里简化处理：假设每个主要动作每周训练1次
  Object.keys(newProgresses).forEach(exerciseName => {
    const progress = { ...newProgresses[exerciseName] };
    
    // 增加训练次数（每周+1）
    progress.trainingCount += 1;
    
    // 根据进度类型更新RM和重量
    switch (progress.progressType) {
      case '5x5':
        // 5×5 → 3RM×10 → 4RM×8 → 5RM×7 → 6RM×6 → 加重回到5×5
        const cycle = progress.trainingCount % 5;
        if (cycle === 0) {
          progress.currentRM = 5;
          progress.currentSets = 5;
        } else if (cycle === 1) {
          progress.currentRM = 3;
          progress.currentSets = 10;
        } else if (cycle === 2) {
          progress.currentRM = 4;
          progress.currentSets = 8;
        } else if (cycle === 3) {
          progress.currentRM = 5;
          progress.currentSets = 7;
        } else if (cycle === 4) {
          progress.currentRM = 6;
          progress.currentSets = 6;
        }
        
        // 每完成一个周期（5次训练）加重
        if (cycle === 0 && progress.trainingCount > 0) {
          if (exerciseName === '负重对握/反握引体向上') {
            progress.currentWeight += 4; // 3-5kg
          } else {
            progress.currentWeight += 1.5; // 1-2kg
          }
        }
        break;
        
      case '20-30rm':
        // 20RM → 25RM → 30RM → 加重回到20RM
        const rmCycle = progress.trainingCount % 3;
        if (rmCycle === 0) {
          progress.currentRM = 20;
          if (progress.trainingCount > 0) {
            progress.currentWeight += 1; // 加重约1kg
          }
        } else if (rmCycle === 1) {
          progress.currentRM = 25;
        } else if (rmCycle === 2) {
          progress.currentRM = 30;
        }
        break;
        
      case 'three-seven':
        // 每周加0.5-1kg
        progress.currentWeight += 0.75;
        break;
        
      case '12x4-inner':
        // 每三周加1kg
        if (progress.trainingCount % 3 === 0 && progress.trainingCount > 0) {
          progress.currentWeight += 1;
        }
        break;
        
      case '8x4-outer':
        // 每三周加1-2kg
        if (progress.trainingCount % 3 === 0 && progress.trainingCount > 0) {
          progress.currentWeight += 1.5;
        }
        break;
        
      case '12x4-lateral':
        // 每两周加1kg
        if (progress.trainingCount % 2 === 0 && progress.trainingCount > 0) {
          progress.currentWeight += 1;
        }
        break;
        
      case 'functional':
        // 功能性训练不强制加重
        break;
    }
    
    newProgresses[exerciseName] = progress;
  });
  
  return newProgresses;
}

// 回退所有动作进度（返回上一周）
function rollbackProgresses(
  currentProgresses: { [key: string]: ExerciseProgress },
  assessmentData: any
): { [key: string]: ExerciseProgress } {
  const newProgresses = { ...currentProgresses };
  
  Object.keys(newProgresses).forEach(exerciseName => {
    const progress = { ...newProgresses[exerciseName] };
    
    if (progress.trainingCount > 0) {
      // 减少训练次数
      progress.trainingCount -= 1;
      
      // 根据进度类型回退RM和重量
      switch (progress.progressType) {
        case '5x5':
          const cycle = progress.trainingCount % 5;
          if (cycle === 0) {
            progress.currentRM = 5;
            progress.currentSets = 5;
            // 如果是周期开始，减重
            if (progress.trainingCount > 0) {
              if (exerciseName === '负重对握/反握引体向上') {
                progress.currentWeight -= 4;
              } else {
                progress.currentWeight -= 1.5;
              }
            }
          } else if (cycle === 4) {
            progress.currentRM = 6;
            progress.currentSets = 6;
          } else if (cycle === 3) {
            progress.currentRM = 5;
            progress.currentSets = 7;
          } else if (cycle === 2) {
            progress.currentRM = 4;
            progress.currentSets = 8;
          } else if (cycle === 1) {
            progress.currentRM = 3;
            progress.currentSets = 10;
          }
          break;
          
        case '20-30rm':
          const rmCycle = progress.trainingCount % 3;
          if (rmCycle === 2) {
            progress.currentRM = 30;
          } else if (rmCycle === 1) {
            progress.currentRM = 25;
          } else if (rmCycle === 0) {
            progress.currentRM = 20;
            if (progress.trainingCount > 0) {
              progress.currentWeight -= 1;
            }
          }
          break;
          
        case 'three-seven':
          progress.currentWeight -= 0.75;
          break;
          
        case '12x4-inner':
          if ((progress.trainingCount + 1) % 3 === 0) {
            progress.currentWeight -= 1;
          }
          break;
          
        case '8x4-outer':
          if ((progress.trainingCount + 1) % 3 === 0) {
            progress.currentWeight -= 1.5;
          }
          break;
          
        case '12x4-lateral':
          if ((progress.trainingCount + 1) % 2 === 0) {
            progress.currentWeight -= 1;
          }
          break;
      }
      
      newProgresses[exerciseName] = progress;
    }
  });
  
  return newProgresses;
}

// 获取受伤部位提示信息
function getInjuryMessage(injuredParts: string[]): string {
  const messages: string[] = [];

  if (injuredParts.includes('手指/手掌')) {
    messages.push('手指/手掌伤痛：已减少高强度前端专项刺激，增加前端功能性训练，用于维持血液循环和基础适应能力。');
  }
  if (injuredParts.includes('手腕桡侧')) {
    messages.push('手腕桡侧伤痛：已降低旋前、虎口、卷把和手腕控制类动作压力，避免继续压迫手腕外侧连接结构。');
  }
  if (injuredParts.includes('手腕尺侧')) {
    messages.push('手腕尺侧伤痛：已降低尺侧屈腕、内侧锁定和勾手类动作压力，避免继续压迫尺侧结构。');
  }
  if (injuredParts.includes('肘部内侧')) {
    messages.push('肘部内侧伤痛：已减少内侧力、侧压和高压锁定训练，并加入低强度充血恢复动作。');
  }
  if (injuredParts.includes('肘部外侧')) {
    messages.push('肘部外侧伤痛：已降低外侧力、旋前、锤式和肘外侧连接动作压力，并加入低强度恢复动作。');
  }

  if (injuredParts.length > 1) {
    return `多部位伤病保护模式：${messages.join(' ')}`;
  }

  return messages.join(' ');
}

// 生成一周训练计划
function generateWeekPlan(
  assessmentData: any,
  progresses: { [key: string]: ExerciseProgress },
  weekNumber: number,
  isInjured: boolean = false,
  injuredParts: string[] = [],
  injuryWeek: number = 0
): TrainingDay[] {
  const frequency = parseInt(assessmentData.weeklyFrequency);
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const plan: TrainingDay[] = [];

  if (frequency === 3) {
    // 每周3天：内侧力、外侧力、横向力
    plan.push(createTrainingDay('周一', 'Monday', '内侧力 + 前端专项', progresses, 'inner', isInjured, injuredParts, injuryWeek));
    plan.push(createRestDay('周二', 'Tuesday', '休息日'));
    plan.push(createTrainingDay('周三', 'Wednesday', '外侧力 + 前端专项', progresses, 'outer', isInjured, injuredParts, injuryWeek));
    plan.push(createRestDay('周四', 'Thursday', '休息日'));
    plan.push(createTrainingDay('周五', 'Friday', '横向力 + 前端专项', progresses, 'lateral', isInjured, injuredParts, injuryWeek));
    plan.push(createRestDay('周六', 'Saturday', '前端功能性训练（可选）'));
    plan.push(createRestDay('周日', 'Sunday', '完全休息'));
  } else if (frequency === 4) {
    // 每周4天：内侧力、外侧力、横向力、弱项补强
    plan.push(createTrainingDay('周一', 'Monday', '内侧力 + 前端专项', progresses, 'inner', isInjured, injuredParts, injuryWeek));
    plan.push(createRestDay('周二', 'Tuesday', '休息日'));
    plan.push(createTrainingDay('周三', 'Wednesday', '外侧力 + 前端专项', progresses, 'outer', isInjured, injuredParts, injuryWeek));
    plan.push(createRestDay('周四', 'Thursday', '休息日'));
    plan.push(createTrainingDay('周五', 'Friday', '横向力 + 前端专项', progresses, 'lateral', isInjured, injuredParts, injuryWeek));
    plan.push(createTrainingDay('周六', 'Saturday', '弱项补强 + 前端专项', progresses, 'weakness', isInjured, injuredParts, injuryWeek));
    plan.push(createRestDay('周日', 'Sunday', '完全休息'));
  } else {
    // 每周5天：内侧力、外侧力、横向力、弱项补强、前端专项日
    plan.push(createTrainingDay('周一', 'Monday', '内侧力 + 前端专项', progresses, 'inner', isInjured, injuredParts, injuryWeek));
    plan.push(createTrainingDay('周二', 'Tuesday', '外侧力 + 前端专项', progresses, 'outer', isInjured, injuredParts, injuryWeek));
    plan.push(createRestDay('周三', 'Wednesday', '休息日'));
    plan.push(createTrainingDay('周四', 'Thursday', '横向力 + 前端专项', progresses, 'lateral', isInjured, injuredParts, injuryWeek));
    plan.push(createTrainingDay('周五', 'Friday', '弱项补强 + 前端专项', progresses, 'weakness', isInjured, injuredParts, injuryWeek));
    plan.push(createTrainingDay('周六', 'Saturday', '前端强化日', progresses, 'front-focus', isInjured, injuredParts, injuryWeek));
    plan.push(createRestDay('周日', 'Sunday', '完全休息'));
  }

  return plan;
}

// 创建训练日
function createTrainingDay(
  dayName: string,
  day: string,
  focus: string,
  progresses: { [key: string]: ExerciseProgress },
  type: 'inner' | 'outer' | 'lateral' | 'weakness' | 'front-focus',
  isInjured: boolean = false,
  injuredParts: string[] = [],
  injuryWeek: number = 0
): TrainingDay {
  const exercises: any[] = [];

  if (type === 'inner') {
    // 内侧力日
    addExerciseIfExists(exercises, progresses, '二头弯举', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '内侧弯举', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '正面横扫', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '器械侧压', isInjured, injuredParts, injuryWeek);

    // 肘部内侧受伤时添加恢复动作
    if (isInjured && injuredParts.includes('肘部内侧')) {
      addRecoveryExercise(exercises, '夹臂俯卧撑', 0, 15, 3, '横向力', '低强度充血恢复动作');
      addRecoveryExercise(exercises, '三头绳索下拉', 10, 15, 3, '横向力', '低强度充血恢复动作');
    }

    // 前端专项（受伤时减少数量）
    const frontExercises = isInjured && (injuredParts.includes('手指/手掌') || injuredParts.includes('手腕桡侧') || injuredParts.includes('手腕尺侧'))
      ? ['握力器练习', '千斤卷/卷杆子练习'] // 只保留功能性训练
      : ['4cm卷把无绑带屈腕', '哑铃腕弯举', 'V杆/固定器械旋前旋后', '指力把手（三七训练法）'];

    frontExercises.forEach(ex => addExerciseIfExists(exercises, progresses, ex, isInjured, injuredParts, injuryWeek));
  } else if (type === 'outer') {
    // 外侧力日
    addExerciseIfExists(exercises, progresses, '虎口锤提', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '拇指旋提', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '锤式弯举', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '桡骨旋提', isInjured, injuredParts, injuryWeek);

    // 肘部外侧受伤时添加恢复动作
    if (isInjured && injuredParts.includes('肘部外侧')) {
      addRecoveryExercise(exercises, '夹臂俯卧撑', 0, 15, 3, '横向力', '低强度充血恢复动作');
      addRecoveryExercise(exercises, '三头绳索下拉', 10, 15, 3, '横向力', '低强度充血恢复动作');
    }

    // 前端专项
    const frontExercises = isInjured && (injuredParts.includes('手指/手掌') || injuredParts.includes('手腕桡侧') || injuredParts.includes('手腕尺侧'))
      ? ['握力器练习', '千斤卷/卷杆子练习']
      : ['6cm卷把带绑带屈腕', '单边细卷把无绑带屈腕', '6cm滚雷屈腕', '拇指硬币捏块（三七训练法）'];

    frontExercises.forEach(ex => addExerciseIfExists(exercises, progresses, ex, isInjured, injuredParts, injuryWeek));
  } else if (type === 'lateral') {
    // 横向力日
    addExerciseIfExists(exercises, progresses, '负重对握/反握引体向上', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '侧面卷把横扫', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '哑铃卧推', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '哑铃推肩', isInjured, injuredParts, injuryWeek);

    // 肘部受伤时添加恢复动作
    if (isInjured && (injuredParts.includes('肘部内侧') || injuredParts.includes('肘部外侧'))) {
      addRecoveryExercise(exercises, '夹臂俯卧撑', 0, 15, 3, '横向力', '低强度充血恢复动作');
      addRecoveryExercise(exercises, '三头绳索下拉', 10, 15, 3, '横向力', '低强度充血恢复动作');
    }

    // 前端专项
    const frontExercises = isInjured && (injuredParts.includes('手指/手掌') || injuredParts.includes('手腕桡侧') || injuredParts.includes('手腕尺侧'))
      ? ['握力器练习', '米桶训练']
      : ['4cm卷把无绑带屈腕', '哑铃腕弯举', '弹力带拇指根屈'];

    frontExercises.forEach(ex => addExerciseIfExists(exercises, progresses, ex, isInjured, injuredParts, injuryWeek));
  } else if (type === 'weakness') {
    // 弱项补强日
    addExerciseIfExists(exercises, progresses, '虎口旋提', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '拳峰提', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '负重对握引体向上', isInjured, injuredParts, injuryWeek);
    addExerciseIfExists(exercises, progresses, '哑铃阿尔森划船', isInjured, injuredParts, injuryWeek);

    // 前端专项
    const frontExercises = isInjured && (injuredParts.includes('手指/手掌') || injuredParts.includes('手腕桡侧') || injuredParts.includes('手腕尺侧'))
      ? ['握力器练习', '千斤卷/卷杆子练习']
      : ['6cm卷把带绑带屈腕', 'V杆/固定器械旋前旋后', '6cm滚雷屈腕'];

    frontExercises.forEach(ex => addExerciseIfExists(exercises, progresses, ex, isInjured, injuredParts, injuryWeek));
  } else if (type === 'front-focus') {
    // 前端强化日（受伤时改为功能性训练为主）
    if (isInjured && (injuredParts.includes('手指/手掌') || injuredParts.includes('手腕桡侧') || injuredParts.includes('手腕尺侧'))) {
      addExerciseIfExists(exercises, progresses, '握力器练习', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, '千斤卷/卷杆子练习', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, '米桶训练', isInjured, injuredParts, injuryWeek);
    } else {
      addExerciseIfExists(exercises, progresses, '4cm卷把无绑带屈腕', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, '6cm卷把带绑带屈腕', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, '单边细卷把无绑带屈腕', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, '哑铃腕弯举', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, 'V杆/固定器械旋前旋后', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, '指力把手（三七训练法）', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, '拇指硬币捏块（三七训练法）', isInjured, injuredParts, injuryWeek);
      addExerciseIfExists(exercises, progresses, '握力器练习', isInjured, injuredParts, injuryWeek);
    }
  }

  return {
    day,
    dayName,
    focus,
    exercises
  };
}

// 创建休息日
function createRestDay(dayName: string, day: string, focus: string): TrainingDay {
  return {
    day,
    dayName,
    focus,
    exercises: []
  };
}

// 添加恢复训练动作
function addRecoveryExercise(
  exercises: any[],
  exerciseName: string,
  weight: number,
  rm: number,
  sets: number,
  category: string,
  note: string
) {
  exercises.push({
    exercise: exerciseName,
    weight,
    rm,
    sets,
    category,
    note
  });
}

// 判断动作是否受到伤病影响
function isExerciseAffectedByInjury(exerciseName: string, injuredParts: string[]): boolean {
  // 手指/手掌：影响所有前端专项和三七训练法
  if (injuredParts.includes('手指/手掌')) {
    if (exerciseName.includes('屈腕') || exerciseName.includes('腕弯举') ||
        exerciseName.includes('旋前旋后') || exerciseName.includes('滚雷') ||
        exerciseName.includes('拇指') || exerciseName.includes('指力') ||
        exerciseName.includes('捏块') || exerciseName.includes('握力器') ||
        exerciseName.includes('千斤卷') || exerciseName.includes('米桶')) {
      return true;
    }
  }

  // 手腕桡侧：影响旋前、虎口、卷把、手腕控制
  if (injuredParts.includes('手腕桡侧')) {
    if (exerciseName.includes('卷把') || exerciseName.includes('虎口') ||
        exerciseName.includes('拇指') || exerciseName.includes('旋前旋后') ||
        exerciseName.includes('腕弯举') || exerciseName.includes('屈腕') ||
        exerciseName.includes('旋提') || exerciseName.includes('桡骨')) {
      return true;
    }
  }

  // 手腕尺侧：影响尺侧屈腕、内侧弯举、侧压、横扫
  if (injuredParts.includes('手腕尺侧')) {
    if (exerciseName.includes('内侧弯举') || exerciseName.includes('侧压') ||
        exerciseName.includes('横扫') || exerciseName.includes('屈腕') ||
        exerciseName.includes('腕弯举') || exerciseName.includes('卷把')) {
      return true;
    }
  }

  // 肘部内侧：影响内侧力、侧压、横扫
  if (injuredParts.includes('肘部内侧')) {
    if (exerciseName.includes('二头') || exerciseName.includes('内侧') ||
        exerciseName.includes('侧压') || exerciseName.includes('横扫')) {
      return true;
    }
  }

  // 肘部外侧：影响外侧力、旋前、锤式、引体向上
  if (injuredParts.includes('肘部外侧')) {
    if (exerciseName.includes('锤式') || exerciseName.includes('虎口') ||
        exerciseName.includes('拇指') || exerciseName.includes('引体') ||
        exerciseName.includes('桡骨') || exerciseName.includes('拳峰') ||
        exerciseName.includes('阿尔森')) {
      return true;
    }
  }

  return false;
}

// 添加动作（如果存在）
function addExerciseIfExists(
  exercises: any[],
  progresses: { [key: string]: ExerciseProgress },
  exerciseName: string,
  isInjured: boolean = false,
  injuredParts: string[] = [],
  injuryWeek: number = 0
) {
  const progress = progresses[exerciseName];
  if (progress) {
    let note = '';
    let weight = progress.currentWeight;
    let originalWeight: number | undefined = undefined;

    // 根据进度类型添加说明
    if (progress.progressType === '5x5') {
      const cycle = progress.trainingCount % 5;
      if (cycle === 0) {
        note = '5×5周期 - 第1次：5RM×5组';
      } else if (cycle === 1) {
        note = '5×5周期 - 第2次：3RM×10组';
      } else if (cycle === 2) {
        note = '5×5周期 - 第3次：4RM×8组';
      } else if (cycle === 3) {
        note = '5×5周期 - 第4次：5RM×7组';
      } else if (cycle === 4) {
        note = '5×5周期 - 第5次：6RM×6组，下次将加重';
      }
    } else if (progress.progressType === '20-30rm') {
      const rmCycle = progress.trainingCount % 3;
      if (rmCycle === 0) {
        note = '20-30RM递增 - 本周20RM';
      } else if (rmCycle === 1) {
        note = '20-30RM递增 - 本周25RM';
      } else if (rmCycle === 2) {
        note = '20-30RM递增 - 本周30RM，下次将加重';
      }
    } else if (progress.progressType === 'three-seven') {
      note = '锁定7秒，休息3秒，连续1分钟为1组，共6组';
    }

    // 受伤状态下调整重量
    if (isInjured && injuredParts.length > 0 && isExerciseAffectedByInjury(exerciseName, injuredParts)) {
      originalWeight = weight;

      // 第1-2周：降低20%
      if (injuryWeek <= 2) {
        weight = weight * 0.8;
      }
      // 第3周：恢复到85-90%
      else if (injuryWeek === 3) {
        weight = weight * 0.875; // 87.5%
        note = (note ? note + ' | ' : '') + '恢复过渡周：逐步恢复重量';
      }
    }

    exercises.push({
      exercise: progress.exercise,
      weight: Math.round(weight * 10) / 10, // 保留1位小数
      originalWeight: originalWeight ? Math.round(originalWeight * 10) / 10 : undefined,
      rm: progress.currentRM || 0,
      sets: progress.currentSets,
      category: progress.category,
      note
    });
  }
}