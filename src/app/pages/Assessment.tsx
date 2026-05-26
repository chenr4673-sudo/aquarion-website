import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { AlertCircle, ChevronRight, Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';

// 动作数据类型定义
interface ExerciseData {
  [key: string]: string; // 动作名 -> 重量（字符串类型，空白时为空字符串）
}

interface AssessmentData {
  // 身体硬件数据
  bodyWeight: string;
  palmLength: string;
  forearmLength: string;

  // 训练频率
  weeklyFrequency: '3' | '4' | '5';

  // 动作能力数据
  exercises: ExerciseData;
}

export default function Assessment() {
  const navigate = useNavigate();

  const [data, setData] = useState<AssessmentData>({
    bodyWeight: '',
    palmLength: '',
    forearmLength: '',
    weeklyFrequency: '3',
    exercises: {}
  });

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<string[]>([]);

  // 检查付费状态 - 必须购买训练计划
  useEffect(() => {
    const currentCycleId = localStorage.getItem('currentCycleId');
    const paidCycles = localStorage.getItem('paidCycles');

    if (!currentCycleId || !paidCycles) {
      alert('请先购买"个人专属计划定制"才能进行能力评估');
      navigate('/');
      return;
    }

    const cycles = JSON.parse(paidCycles);
    const activeCycle = cycles.find((cycle: any) =>
      cycle.id === currentCycleId && cycle.status === 'active'
    );

    if (!activeCycle) {
      alert('当前没有有效的训练周期，请先购买训练计划');
      navigate('/');
      return;
    }

    if (!activeCycle.hasPlan) {
      alert('你还没有购买训练计划。请购买"个人专属计划定制"或"完整 AQUARION 体验"');
      navigate('/');
    }
  }, [navigate]);

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    // 只允许输入数字和小数点
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    if (field === 'bodyWeight' || field === 'palmLength' || field === 'forearmLength') {
      setData(prev => ({ ...prev, [field]: value }));
    } else {
      setData(prev => ({
        ...prev,
        exercises: { ...prev.exercises, [field]: value }
      }));
    }
  };

  // 验证第一步
  const validateStep1 = () => {
    const newErrors: string[] = [];

    if (!data.bodyWeight || parseFloat(data.bodyWeight) <= 0) {
      newErrors.push('请输入有效的当前体重');
    }
    if (!data.palmLength || parseFloat(data.palmLength) <= 0) {
      newErrors.push('请输入有效的手掌长度');
    }
    if (!data.forearmLength || parseFloat(data.forearmLength) <= 0) {
      newErrors.push('请输入有效的小臂长度');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // 验证第三步（动作数据）
  const validateStep3 = () => {
    const newErrors: string[] = [];
    const requiredExercises = Object.keys(exerciseCategories).flatMap(cat => 
      exerciseCategories[cat as keyof typeof exerciseCategories].exercises
    );
    
    for (const exercise of requiredExercises) {
      if (!data.exercises[exercise] || parseFloat(data.exercises[exercise]) <= 0) {
        newErrors.push(`请填写"${exercise}"的训练重量`);
      }
    }
    
    if (newErrors.length > 0) {
      setErrors(['请填写所有动作的训练重量（必须大于0）']);
      return false;
    }
    
    setErrors([]);
    return true;
  };

  // 提交评估
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    // 保存评估数据到 localStorage
    localStorage.setItem('assessmentData', JSON.stringify(data));
    
    // 跳转到技术分析页面
    navigate('/tech-analysis');
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Dumbbell className="w-10 h-10 text-[rgb(var(--power-red))]" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider">
              能力评估
            </h1>
          </div>
          <p className="text-[rgb(var(--muted-foreground))] text-lg">
            请如实填写以下数据，AI 将根据你的实际情况生成专属训练计划
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <StepIndicator step={1} currentStep={currentStep} label="身体数据" />
          <div className="h-px w-12 bg-border" />
          <StepIndicator step={2} currentStep={currentStep} label="训练频率" />
          <div className="h-px w-12 bg-border" />
          <StepIndicator step={3} currentStep={currentStep} label="动作能力" />
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-[rgb(var(--destructive))]/10 border border-destructive/50 p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-[rgb(var(--destructive))] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-[rgb(var(--destructive))] text-sm">{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: 身体硬件数据 */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-[rgb(var(--power-red))] uppercase">
              第一步：身体硬件数据
            </h3>

            <div className="space-y-6">
              <div>
                <Label htmlFor="bodyWeight" className="text-base font-semibold mb-2 block">
                  当前体重（kg）
                </Label>
                <Input
                  id="bodyWeight"
                  type="text"
                  inputMode="decimal"
                  placeholder="请输入当前体重 kg"
                  value={data.bodyWeight}
                  onChange={(e) => handleInputChange('bodyWeight', e.target.value)}
                  className="text-lg py-6"
                />
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                  你的当前体重
                </p>
              </div>

              <div>
                <Label htmlFor="palmLength" className="text-base font-semibold mb-2 block">
                  手掌长度（cm）
                </Label>
                <Input
                  id="palmLength"
                  type="text"
                  inputMode="decimal"
                  placeholder="请输入手掌长度 cm"
                  value={data.palmLength}
                  onChange={(e) => handleInputChange('palmLength', e.target.value)}
                  className="text-lg py-6"
                />
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                  从手腕横纹到中指尖的长度
                </p>
              </div>

              <div>
                <Label htmlFor="forearmLength" className="text-base font-semibold mb-2 block">
                  小臂长度（cm）
                </Label>
                <Input
                  id="forearmLength"
                  type="text"
                  inputMode="decimal"
                  placeholder="请输入小臂长度 cm"
                  value={data.forearmLength}
                  onChange={(e) => handleInputChange('forearmLength', e.target.value)}
                  className="text-lg py-6"
                />
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                  从肘关节到手腕的长度
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button
                onClick={() => {
                  if (validateStep1()) {
                    setCurrentStep(2);
                  }
                }}
                className="bg-[rgb(var(--power-red))] hover:bg-[rgb(var(--primary-hover))] px-8 py-6 text-lg"
              >
                下一步
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: 训练频率 */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-[rgb(var(--power-red))] uppercase">
              第二步：训练频率
            </h3>

            <p className="text-[rgb(var(--muted-foreground))] mb-6">
              手臂摔跤专项训练最低建议每周 3 次，以完整覆盖内侧力、外侧力、横向力和前端训练。
            </p>

            <RadioGroup
              value={data.weeklyFrequency}
              onValueChange={(value) => setData(prev => ({ ...prev, weeklyFrequency: value as '3' | '4' | '5' }))}
              className="space-y-4"
            >
              <FrequencyOption value="3" title="每周 3 天" description="基础训练，覆盖所有主要力量方向" />
              <FrequencyOption value="4" title="每周 4 天" description="增加弱项补强日，加速进步" />
              <FrequencyOption value="5" title="每周 5 天" description="高强度训练，额外增加前端专项日" />
            </RadioGroup>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="px-8 py-6 text-lg"
              >
                上一步
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                className="bg-[rgb(var(--power-red))] hover:bg-[rgb(var(--primary-hover))] px-8 py-6 text-lg"
              >
                下一步
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: 动作能力数据 */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-[rgb(var(--power-red))] uppercase">
              第三步：当前动作能力数据
            </h3>

            <p className="text-[rgb(var(--muted-foreground))] mb-8">
              请填写你目前能稳定完成各动作训练标准的重量（单位：kg）
            </p>

            <div className="space-y-10">
              {Object.entries(exerciseCategories).map(([key, category]) => (
                <ExerciseCategory
                  key={key}
                  title={category.title}
                  description={category.description}
                  exercises={category.exercises}
                  data={data}
                  onChange={handleInputChange}
                  color={category.color}
                />
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="px-8 py-6 text-lg"
              >
                上一步
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[rgb(var(--power-red))] hover:bg-[rgb(var(--primary-hover))] px-8 py-6 text-lg"
              >
                生成训练计划
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// 步骤指示器组件
function StepIndicator({ step, currentStep, label }: { step: number; currentStep: number; label: string }) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center font-bold
        ${isActive ? 'bg-[rgb(var(--power-red))] text-white' : 
          isCompleted ? 'bg-[rgb(var(--power-silver))] text-[rgb(var(--background))]' : 
          'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]'}
      `}>
        {step}
      </div>
      <span className={`text-sm ${isActive ? 'text-[rgb(var(--foreground))] font-semibold' : 'text-[rgb(var(--muted-foreground))]'}`}>
        {label}
      </span>
    </div>
  );
}

// 训练频率选项组件
function FrequencyOption({ value, title, description }: { value: string; title: string; description: string }) {
  return (
    <div className="flex items-start space-x-3 p-4 border border-[rgb(var(--border))] hover:border-[rgb(var(--power-red))] transition-colors cursor-pointer">
      <RadioGroupItem value={value} id={`frequency-${value}`} className="mt-1" />
      <Label htmlFor={`frequency-${value}`} className="flex-1 cursor-pointer">
        <div className="font-semibold text-lg mb-1">{title}</div>
        <div className="text-sm text-[rgb(var(--muted-foreground))]">{description}</div>
      </Label>
    </div>
  );
}

// 动作类别组件
function ExerciseCategory({ 
  title, 
  description, 
  exercises, 
  data, 
  onChange,
  color 
}: { 
  title: string; 
  description: string; 
  exercises: string[];
  data: AssessmentData;
  onChange: (field: string, value: string) => void;
  color: string;
}) {
  return (
    <div className="border-l-4 pl-4 md:pl-6" style={{ borderColor: color }}>
      <h4 className="text-lg md:text-xl font-bold mb-2 uppercase" style={{ color }}>{title}</h4>
      <p className="text-xs md:text-sm text-[rgb(var(--muted-foreground))] mb-4 leading-relaxed">{description}</p>
      
      <div className="grid grid-cols-1 gap-4">
        {exercises.map((exercise) => (
          <div key={exercise}>
            <Label htmlFor={exercise} className="text-sm font-medium mb-1.5 block">
              {exercise}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={exercise}
                type="text"
                inputMode="decimal"
                placeholder="重量 kg"
                value={data.exercises[exercise] || ''}
                onChange={(e) => onChange(exercise, e.target.value)}
                className="flex-1 text-base py-6"
              />
              <span className="text-[rgb(var(--muted-foreground))] text-sm font-semibold">kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 动作分类数据
const exerciseCategories = {
  frontSpecial: {
    title: 'A. 前端专项训练：20–30RM × 5组类',
    description: '这些动作主要采用 20–30RM 的高次数训练方式，每个动作 5 组。请填写你目前能稳定完成 20RM 到 30RM 的重量。',
    color: 'rgb(var(--front-special))',
    exercises: [
      '4cm卷把无绑带屈腕',
      '6cm卷把带绑带屈腕',
      '单边细卷把无绑带屈腕',
      '哑铃腕弯举',
      'V杆/固定器械旋前旋后',
      '6cm滚雷屈腕',
      '弹力带拇指根屈'
    ]
  },
  frontThreeSeven: {
    title: 'B. 前端三七训练法类',
    description: '三七训练法是锁定 7 秒，休息 3 秒，连续 1 分钟为 1 组，共 6 组。请填写你目前能稳定完成该标准的重量。',
    color: 'rgb(var(--front-special))',
    exercises: [
      '指力把手（三七训练法）',
      '拇指硬币捏块（三七训练法）'
    ]
  },
  frontFunctional: {
    title: 'C. 前端功能性训练类：20–30RM / 轻重量高频类',
    description: '这些动作主要用于前端耐受、血液循环和功能性强化，不追求大重量。请填写你目前能轻松控制的训练重量或阻力等级。',
    color: 'rgb(var(--front-functional))',
    exercises: [
      '握力器练习',
      '千斤卷/卷杆子练习',
      '米桶训练'
    ]
  },
  innerStrength5x5: {
    title: 'D. 后端内侧力：5RM × 5组增力类',
    description: '这些动作采用 5RM × 5组作为起始标准，并按照周期递进。请填写你目前能完成 5RM × 5组的重量。',
    color: 'rgb(var(--inner-strength))',
    exercises: [
      '二头弯举',
      '内侧弯举'
    ]
  },
  innerStrength12x4: {
    title: 'E. 后端内侧力：12RM × 4组增肌类',
    description: '这些动作采用 12RM × 4组，每三周小幅加重。请填写你目前能完成 12RM × 4组的重量。',
    color: 'rgb(var(--inner-strength))',
    exercises: [
      '正面横扫',
      '器械侧压'
    ]
  },
  outerStrength5x5: {
    title: 'F. 后端外侧力：5RM × 5组增力类',
    description: '这些动作采用 5RM × 5组作为起始标准，并按照周期递进。请填写你目前能完成 5RM × 5组的重量。',
    color: 'rgb(var(--outer-strength))',
    exercises: [
      '虎口锤提',
      '拇指旋提'
    ]
  },
  outerStrength8x4: {
    title: 'G. 后端外侧力：8RM × 4组增肌类',
    description: '这些动作采用 8RM × 4组，每三周增加 1–2kg。请填写你目前能完成 8RM × 4组的重量。',
    color: 'rgb(var(--outer-strength))',
    exercises: [
      '锤式弯举',
      '桡骨旋提',
      '虎口旋提',
      '拳峰提',
      '负重对握引体向上',
      '哑铃阿尔森划船'
    ]
  },
  lateralStrength5x5: {
    title: 'H. 横向力：5RM × 5组增力类',
    description: '该动作采用 5RM × 5组，并按照力量周期递进，但每次周期加重幅度为 3–5kg。请填写你目前能完成 5RM × 5组的负重。',
    color: 'rgb(var(--lateral-strength))',
    exercises: [
      '负重对握/反握引体向上'
    ]
  },
  lateralStrength12x4: {
    title: 'I. 横向力：12RM × 4组增肌增力类',
    description: '这些动作采用 12RM × 4组，每两周增加约 1kg。请填写你目前能完成 12RM × 4组的重量。',
    color: 'rgb(var(--lateral-strength))',
    exercises: [
      '侧面卷把横扫',
      '哑铃卧推',
      '哑铃推肩'
    ]
  }
};