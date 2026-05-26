import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Brain, Target, TrendingUp, AlertTriangle, Award, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface TechRecommendation {
  mainTechnique: string;
  secondaryTechnique: string;
  reason: string;
  hardwareAnalysis: string; // 硬件判断结果，例如："体重 72kg，手掌 19.5cm = 手掌长，小臂 27.5cm = 小臂长"
  hardwareAdvantages: string[];
  weaknesses: string[];
  trainingFocus: string[];
}

export default function TechAnalysis() {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState<TechRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取评估数据
    const assessmentDataStr = localStorage.getItem('assessmentData');
    if (!assessmentDataStr) {
      navigate('/assessment');
      return;
    }

    const assessmentData = JSON.parse(assessmentDataStr);
    
    // 生成技术建议
    const techRec = generateTechRecommendation(assessmentData);
    setRecommendation(techRec);
    
    // 保存技术建议
    localStorage.setItem('techRecommendation', JSON.stringify(techRec));
    
    setLoading(false);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/training-plan');
  };

  if (loading || !recommendation) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-[rgb(var(--power-red))] animate-pulse mx-auto mb-4" />
          <p className="text-xl text-[rgb(var(--muted-foreground))]">AI 正在分析你的数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-[rgb(var(--power-red))]" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider">
              AI 技术分析
            </h1>
          </div>
          <p className="text-[rgb(var(--muted-foreground))] text-lg">
            基于你的身体硬件和能力数据，AI 为你推荐最适合的技术路线
          </p>
        </motion.div>

        {/* Main & Secondary Techniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[rgb(var(--card))] border-2 border-[rgb(var(--power-red))] p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-[rgb(var(--power-red))]" />
              <h3 className="text-2xl font-bold uppercase">主技术路线</h3>
            </div>
            <div className="text-4xl font-black text-[rgb(var(--power-red))] mb-2">
              {recommendation.mainTechnique}
            </div>
            <p className="text-[rgb(var(--muted-foreground))]">推荐作为你的核心技术发展方向</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--power-silver))] p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-[rgb(var(--power-silver))]" />
              <h3 className="text-2xl font-bold uppercase">副技术路线</h3>
            </div>
            <div className="text-3xl font-black text-[rgb(var(--power-silver))] mb-2">
              {recommendation.secondaryTechnique}
            </div>
            <p className="text-[rgb(var(--muted-foreground))]">辅助技术，用于应对不同对手</p>
          </motion.div>
        </div>

        {/* Reason */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-7 h-7 text-[rgb(var(--power-red))]" />
            <h3 className="text-xl font-bold uppercase">为什么适合你</h3>
          </div>
          <p className="text-[rgb(var(--foreground)/0.9)] leading-relaxed text-lg">
            {recommendation.reason}
          </p>
        </motion.div>

        {/* Hardware Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-r from-[rgb(var(--primary))]/10 to-transparent border border-[rgb(var(--power-red))]/30 p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-7 h-7 text-[rgb(var(--power-red))]" />
            <h3 className="text-xl font-bold uppercase">你的硬件判断结果</h3>
          </div>
          <p className="text-[rgb(var(--foreground))] leading-relaxed text-lg font-semibold">
            {recommendation.hardwareAnalysis}
          </p>
        </motion.div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h4 className="text-lg font-bold uppercase">硬件优势</h4>
            </div>
            <ul className="space-y-2">
              {recommendation.hardwareAdvantages.map((advantage, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm text-[rgb(var(--foreground))]/80">{advantage}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h4 className="text-lg font-bold uppercase">当前短板</h4>
            </div>
            <ul className="space-y-2">
              {recommendation.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">⚠</span>
                  <span className="text-sm text-[rgb(var(--foreground))]/80">{weakness}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-[rgb(var(--power-red))]" />
              <h4 className="text-lg font-bold uppercase">训练重点</h4>
            </div>
            <ul className="space-y-2">
              {recommendation.trainingFocus.map((focus, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[rgb(var(--power-red))] mt-1">→</span>
                  <span className="text-sm text-[rgb(var(--foreground))]/80">{focus}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-[rgb(var(--power-red))] hover:bg-[rgb(var(--primary-hover))] text-white text-xl px-12 py-7 font-bold uppercase tracking-wide"
          >
            查看训练计划
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// 生成技术建议的函数
function generateTechRecommendation(data: any): TechRecommendation {
  const bodyWeight = parseFloat(data.bodyWeight);
  const palmLength = parseFloat(data.palmLength);
  const forearmLength = parseFloat(data.forearmLength);
  const exercises = data.exercises;

  // 根据体重判断手掌和小臂的长短
  let palmThreshold: { long: number; short: number };
  let forearmThreshold: { long: number; short: number };

  if (bodyWeight < 75) {
    palmThreshold = { long: 19, short: 17 };
    forearmThreshold = { long: 27, short: 25 };
  } else {
    palmThreshold = { long: 21, short: 19 };
    forearmThreshold = { long: 29, short: 27 };
  }

  // 判断手掌长度类型
  let palmType: '手掌长' | '手掌中等' | '手掌短';
  if (palmLength > palmThreshold.long) {
    palmType = '手掌长';
  } else if (palmLength < palmThreshold.short) {
    palmType = '手掌短';
  } else {
    palmType = '手掌中等';
  }

  // 判断小臂长度类型
  let forearmType: '小臂长' | '小臂中等' | '小臂短';
  if (forearmLength > forearmThreshold.long) {
    forearmType = '小臂长';
  } else if (forearmLength < forearmThreshold.short) {
    forearmType = '小臂短';
  } else {
    forearmType = '小臂中等';
  }

  // 构建硬件分析文本
  const hardwareAnalysis = `体重 ${bodyWeight}kg，手掌 ${palmLength}cm = ${palmType}，小臂 ${forearmLength}cm = ${forearmType}`;

  // 计算各维度力量水平
  const innerStrength = (
    parseFloat(exercises['二头弯举'] || 0) +
    parseFloat(exercises['内侧弯举'] || 0)
  ) / 2;

  const outerStrength = (
    parseFloat(exercises['虎口锤提'] || 0) +
    parseFloat(exercises['拇指旋提'] || 0) +
    parseFloat(exercises['锤式弯举'] || 0)
  ) / 3;

  const lateralStrength = (
    parseFloat(exercises['负重对握/反握引体向上'] || 0) +
    parseFloat(exercises['侧面卷把横扫'] || 0)
  ) / 2;

  const frontControl = (
    parseFloat(exercises['4cm卷把无绑带屈腕'] || 0) +
    parseFloat(exercises['哑铃腕弯举'] || 0) +
    parseFloat(exercises['指力把手（三七训练法）'] || 0)
  ) / 3;

  const fingerStrength = parseFloat(exercises['指力把手（三七训练法）'] || 0);
  const backPull = parseFloat(exercises['虎口锤提'] || 0);
  const supination = innerStrength; // 内侧力作为旋后能力的代表
  const hookStructure = (innerStrength + fingerStrength) / 2;

  // 用于判断的布尔值
  const isLongForearm = forearmType === '小臂长';
  const isShortForearm = forearmType === '小臂短';
  const isMediumForearm = forearmType === '小臂中等';
  const isLongPalm = palmType === '手掌长';
  const isShortPalm = palmType === '手掌短';
  const isMediumPalm = palmType === '手掌中等';

  let mainTechnique = '';
  let secondaryTechnique = '';
  let reason = '';
  const hardwareAdvantages: string[] = [];
  const weaknesses: string[] = [];
  const trainingFocus: string[] = [];

  // 技术路线判断逻辑
  // 优先判断：小臂长、手掌长、前端强、外侧强、后拉强 -> 低位顶峰
  if (isLongForearm && isLongPalm && frontControl >= 10 && outerStrength >= 15 && backPull >= 15) {
    mainTechnique = '低位顶峰';
    secondaryTechnique = '王之移动';
    reason = '你的小臂长、手掌长，前端控制和外侧力表现优秀，后拉能力强。这是低位顶峰的完美硬件条件。小臂长提供杠杆优势和控距能力，手长能够有效包裹对手手指、控制虎口和拳峰，前端强可以锁定手腕，外侧力和后拉强可以进行强力的后向拉扯压制。';

    hardwareAdvantages.push('小臂长，杠杆和控距优势明显');
    hardwareAdvantages.push('手掌长，包裹控制能力强');
    hardwareAdvantages.push('前端控制能力优秀');
    hardwareAdvantages.push('外侧力和后拉能力出色');

    if (innerStrength < outerStrength * 0.8) weaknesses.push('内侧力相对较弱，需加强全面性');
    if (lateralStrength < 20) weaknesses.push('横向力有待提升');

    trainingFocus.push('继续强化前端专项训练，保持手腕控制优势');
    trainingFocus.push('提升虎口锤提、拇指旋提和后拉力量');
    trainingFocus.push('补强内侧力，提高技术全面性');
  }
  // 小臂短、手掌长、前端强、上提/背压强 -> 高位顶峰
  else if (isShortForearm && isLongPalm && frontControl >= 10 && lateralStrength >= 18) {
    mainTechnique = '高位顶峰';
    secondaryTechnique = '推手';
    reason = '你的小臂较短但手掌长，前端控制强，横向力（上提/背压）出色。小臂短适合高位快速爆发和近距离终结，手长能够有效控制对手手指和手腕，横向力强可以提供强大的肩压和推压，爆发终结能力好。';

    hardwareAdvantages.push('手掌长，前端控制能力强');
    hardwareAdvantages.push('小臂短，适合近距离爆发');
    hardwareAdvantages.push('横向力（肩压/背压）表现出色');
    hardwareAdvantages.push('前端控制优秀，手腕锁定能力强');

    if (outerStrength < 15) weaknesses.push('外侧力需要加强');
    if (backPull < 12) weaknesses.push('后拉能力偏弱');

    trainingFocus.push('保持并强化前端专项优势');
    trainingFocus.push('提升肩压、背压和推压能力');
    trainingFocus.push('强化爆发终结能力和上提力量');
  }
  // 小臂长、手掌短/中等、下三指强、旋后强、勾手结构好 -> 高位勾手
  else if (isLongForearm && (isShortPalm || isMediumPalm) && fingerStrength >= 8 && supination >= 12 && hookStructure >= 10) {
    mainTechnique = '高位勾手';
    secondaryTechnique = '低位顶峰';
    reason = '你的小臂长但手掌相对较短或中等，下三指力量强，旋后能力（内侧力）优秀，勾手结构好。小臂长提供控距优势，内侧力强适合高位勾手的旋后和下三指发力模式，通过勾手结构控制对手。';

    hardwareAdvantages.push('小臂长，控距优势明显');
    hardwareAdvantages.push('下三指力量强，适合勾手');
    hardwareAdvantages.push('旋后能力（内侧力）优秀');
    hardwareAdvantages.push('勾手结构好');

    if (isShortPalm) weaknesses.push('手掌较短，前端包裹能力稍弱');
    if (outerStrength < innerStrength * 0.8) weaknesses.push('外侧力相对较弱');
    if (frontControl < 10) weaknesses.push('前端控制需要提升');

    trainingFocus.push('强化二头弯举和内侧弯举，提升旋后能力');
    trainingFocus.push('继续提升下三指和指力训练');
    trainingFocus.push('补强前端控制，提高手腕稳定性');
  }
  // 小臂短、手掌短、内侧力强、尺侧屈腕强、旋后强 -> 内侧勾手
  else if (isShortForearm && isShortPalm && innerStrength >= 15 && supination >= 12) {
    mainTechnique = '内侧勾手';
    secondaryTechnique = '高位勾手';
    reason = '你的小臂较短、手掌较短，但内侧力表现出色，旋后能力强。这是典型的内侧勾手硬件，适合近距离硬碰硬，通过强大的内侧力、尺侧屈腕和旋后能力在近身距离压制对手。';

    hardwareAdvantages.push('内侧力强大');
    hardwareAdvantages.push('紧凑身材，适合近距离作战');
    hardwareAdvantages.push('旋后能力优秀');

    if (frontControl < 8) weaknesses.push('前端控制较弱，需要加强');
    if (outerStrength < 12) weaknesses.push('外侧力有待提升');
    if (lateralStrength < 15) weaknesses.push('横向力偏弱');

    trainingFocus.push('继续强化内侧力和旋后训练');
    trainingFocus.push('提升尺侧屈腕能力');
    trainingFocus.push('补强前端专项，提高手腕控制');
  }
  // 外侧力强、旋前强、耐力强、防守转换能力强 -> 王之移动作为防守型副技术
  else if (outerStrength >= innerStrength * 1.1 && lateralStrength >= 18 && frontControl >= 10) {
    mainTechnique = '外侧勾手';
    secondaryTechnique = '王之移动';
    reason = '你的外侧力、横向力和前端控制表现均衡且出色，这是外侧勾手的理想条件。外侧勾手需要全面的能力，包括旋前、耐力和防守转换，虽然难度较高，但一旦掌握将是非常强大的全能技术。王之移动可作为防守型副技术。';

    hardwareAdvantages.push('外侧力出色');
    hardwareAdvantages.push('横向力表现优秀');
    hardwareAdvantages.push('整体能力较均衡');
    hardwareAdvantages.push('前端控制能力强');

    if (innerStrength < outerStrength * 0.9) weaknesses.push('内侧力需要平衡发展');
    if (fingerStrength < 8) weaknesses.push('下三指力量需要提升');

    trainingFocus.push('全面提升各维度力量，保持均衡发展');
    trainingFocus.push('强化旋前能力和防守转换');
    trainingFocus.push('提升耐力训练');
  }
  // 横向力强、肩压强、推压能力强 -> 推手作为破解防守外线的副技术
  else if (lateralStrength >= 20 && parseFloat(exercises['哑铃卧推'] || 0) >= 20) {
    mainTechnique = '高位顶峰';
    secondaryTechnique = '推手';
    reason = '你的横向力（肩压/背压）和推压能力表现突出。高位顶峰可以充分利用你的横向力优势，推手作为副技术可以有效破解对手的防守外线，提供多样化的进攻手段。';

    hardwareAdvantages.push('横向力（肩压/背压）表现出色');
    hardwareAdvantages.push('推压能力强');
    if (frontControl >= 10) hardwareAdvantages.push('前端控制能力优秀');

    if (innerStrength < 15) weaknesses.push('内侧力需要提升');
    if (outerStrength < 15) weaknesses.push('外侧力需要加强');

    trainingFocus.push('保持横向力优势，强化肩压和推压');
    trainingFocus.push('提升爆发终结能力');
    trainingFocus.push('补强内侧力和外侧力');
  }
  // 各项能力比较均衡，硬件中等 -> 外侧勾手作为长期高级路线
  else if (isMediumForearm && isMediumPalm &&
           Math.abs(innerStrength - outerStrength) < 3 &&
           Math.abs(innerStrength - lateralStrength) < 5 &&
           frontControl >= 8) {
    mainTechnique = '外侧勾手';
    secondaryTechnique = '高位勾手';
    reason = '你的各项能力比较均衡，硬件处于中等长度，没有明显短板。这种全面性非常适合外侧勾手这一高级技术路线。外侧勾手需要全面的能力发展，难度更高，但一旦掌握将拥有极强的适应性和技术深度。';

    hardwareAdvantages.push('整体能力较均衡，无明显硬件短板');
    hardwareAdvantages.push('手掌和小臂长度适中，适应性强');
    hardwareAdvantages.push('各维度力量发展平衡');

    if (frontControl < 10) weaknesses.push('前端控制需要继续提升');
    if (innerStrength < 15) weaknesses.push('内侧力需要加强');
    if (outerStrength < 15) weaknesses.push('外侧力需要提升');

    trainingFocus.push('全面提升各维度力量，保持均衡发展');
    trainingFocus.push('强化前端专项训练');
    trainingFocus.push('提升旋前和旋后能力');
  }
  // 默认：根据最强项推荐
  else {
    if (innerStrength >= outerStrength && innerStrength >= lateralStrength) {
      mainTechnique = '高位勾手';
      secondaryTechnique = '内侧勾手';
      reason = '综合你的硬件数据和能力数据，内侧力是你的最强项。建议从高位勾手入手，这是利用内侧力和旋后能力的高效技术路线。';
      hardwareAdvantages.push('内侧力表现突出');
    } else if (outerStrength >= innerStrength && outerStrength >= lateralStrength) {
      mainTechnique = '低位顶峰';
      secondaryTechnique = '王之移动';
      reason = '综合你的硬件数据和能力数据，外侧力是你的最强项。建议从低位顶峰入手，充分发挥你的外侧力和后拉优势。';
      hardwareAdvantages.push('外侧力表现突出');
    } else {
      mainTechnique = '高位顶峰';
      secondaryTechnique = '推手';
      reason = '综合你的硬件数据和能力数据，横向力是你的最强项。建议从高位顶峰入手，利用肩压、背压和推压优势。';
      hardwareAdvantages.push('横向力表现突出');
    }

    if (frontControl < 10) weaknesses.push('前端控制需要提升');
    weaknesses.push('各维度力量需要均衡发展');
    trainingFocus.push('全面提升力量水平');
  }

  // 通用训练建议
  if (!trainingFocus.some(f => f.includes('前端'))) {
    trainingFocus.push('前端专项是所有技术的基础，持续强化');
  }

  return {
    mainTechnique,
    secondaryTechnique,
    reason,
    hardwareAnalysis,
    hardwareAdvantages,
    weaknesses,
    trainingFocus
  };
}
