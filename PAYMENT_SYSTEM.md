# AQUARION 付费系统实现文档

## 概述

AQUARION 采用独立的双付费模式：
- **个人专属计划定制**：¥30 / 6周
- **私人专属 AI 教练**：¥150 / 6周
- **完整体验**：¥180 / 6周（包含以上两项）

## 数据结构

### localStorage 存储结构

```typescript
// 当前活跃的周期ID
localStorage.setItem('currentCycleId', 'cycle_1234567890');

// 付费周期数组
localStorage.setItem('paidCycles', JSON.stringify([
  {
    id: 'cycle_1234567890',
    status: 'active',  // 'active' | 'completed'
    price: 30,         // 或 150 或 180
    weeks: 6,
    startedAt: '2024-01-01T00:00:00.000Z',
    paidAt: '2024-01-01T00:00:00.000Z',
    completedAt: '2024-02-12T00:00:00.000Z',  // 仅在 status='completed' 时存在
    hasPlan: true,     // 是否购买了训练计划
    hasAICoach: false, // 是否购买了AI教练
    aiCoachPaidAt: '2024-01-01T00:00:00.000Z'  // 仅在购买AI教练时存在
  }
]));
```

## 权限检查逻辑

### 1. 训练计划权限检查

**文件**: `src/app/pages/Assessment.tsx`, `src/app/pages/TrainingPlan.tsx`

```typescript
const checkPlanAccess = (): boolean => {
  const currentCycleId = localStorage.getItem('currentCycleId');
  const paidCycles = localStorage.getItem('paidCycles');
  
  if (!currentCycleId || !paidCycles) return false;
  
  const cycles = JSON.parse(paidCycles);
  const activeCycle = cycles.find((cycle: any) =>
    cycle.id === currentCycleId && 
    cycle.status === 'active' && 
    cycle.hasPlan === true
  );
  
  return !!activeCycle;
};
```

### 2. AI教练权限检查

**文件**: `src/app/pages/AICoach.tsx`

```typescript
const checkAICoachAccess = (): boolean => {
  const currentCycleId = localStorage.getItem('currentCycleId');
  const paidCycles = localStorage.getItem('paidCycles');
  
  if (!currentCycleId || !paidCycles) return false;
  
  const cycles = JSON.parse(paidCycles);
  const activeCycle = cycles.find((cycle: any) =>
    cycle.id === currentCycleId && 
    cycle.status === 'active' && 
    cycle.hasAICoach === true
  );
  
  return !!activeCycle;
};
```

## 付费流程

### 1. 首页付费（新周期）

**文件**: `src/app/pages/Home.tsx`

用户可以选择三种付费选项：
- `plan`: 只购买训练计划（¥30）
- `ai`: 只购买AI教练（¥150）
- `bundle`: 完整体验（¥180）

```typescript
const handlePayment = (type: 'plan' | 'ai' | 'bundle') => {
  const cycleId = `cycle_${Date.now()}`;
  const newCycle = {
    id: cycleId,
    status: 'active',
    price: type === 'plan' ? 30 : type === 'ai' ? 150 : 180,
    weeks: 6,
    startedAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    hasPlan: type === 'plan' || type === 'bundle',
    hasAICoach: type === 'ai' || type === 'bundle',
  };
  
  // 保存到 localStorage
  const existingCycles = JSON.parse(localStorage.getItem('paidCycles') || '[]');
  existingCycles.push(newCycle);
  localStorage.setItem('paidCycles', JSON.stringify(existingCycles));
  localStorage.setItem('currentCycleId', cycleId);
};
```

### 2. AI教练补充购买（当前周期）

**文件**: `src/app/pages/AICoachLocked.tsx`

用户在有活跃训练周期的情况下，可以单独购买AI教练：

```typescript
const handlePurchase = () => {
  const currentCycleId = localStorage.getItem('currentCycleId');
  const paidCycles = JSON.parse(localStorage.getItem('paidCycles') || '[]');
  
  const cycleIndex = cycles.findIndex((c: any) => c.id === currentCycleId);
  
  // 更新当前周期，添加AI教练权限
  cycles[cycleIndex].hasAICoach = true;
  cycles[cycleIndex].aiCoachPaidAt = new Date().toISOString();
  localStorage.setItem('paidCycles', JSON.stringify(cycles));
};
```

### 3. 周期结束处理

**文件**: `src/app/pages/TrainingPlan.tsx`

第6周完成时：

```typescript
const handleCycleComplete = () => {
  // 检查是否有AI教练权限
  const hadAICoach = currentCycle.hasAICoach;
  
  // 清除评估数据
  localStorage.removeItem('assessmentData');
  localStorage.removeItem('techRecommendation');
  
  // 标记周期为已完成
  cycles[cycleIndex].status = 'completed';
  cycles[cycleIndex].completedAt = new Date().toISOString();
  localStorage.setItem('paidCycles', JSON.stringify(cycles));
  localStorage.removeItem('currentCycleId');
  
  // 如果有AI教练，提示权限已结束
  if (hadAICoach) {
    alert('你的 AI教练服务已随本轮 6 周周期结束。如需继续使用 AQUARION AI Coach，请开启新的训练周期并重新购买 AI教练服务。');
  }
};
```

## AI教练实现

### 核心限制

AI教练只能提供建议，不能修改任何数据：
- ❌ 不能修改训练计划内容
- ❌ 不能修改训练动作和重量
- ❌ 不能修改训练频率和周数
- ❌ 不能修改能力评估数据
- ❌ 不能修改付费状态
- ❌ 不能修改受伤状态
- ✅ 可以读取用户数据作为参考
- ✅ 可以提供训练建议
- ✅ 可以回答问题

### 系统提示（System Prompt）

```typescript
const systemPrompt = `你是 AQUARION AI 教练，专业的手臂摔跤（腕力）训练顾问。

核心规则（严格遵守）：
1. 你只能提供建议和指导，绝对不能修改以下任何数据：
   - 训练计划内容、训练动作和重量、训练频率和周数
   - 能力评估数据、付费状态、受伤状态
2. 你是一个只读顾问
3. 如果用户要求你修改训练计划，你必须明确拒绝
4. 严重疼痛或损伤时建议立即就医
5. 不要提供危险的训练建议（过度负荷、危险减重、药物滥用、带伤硬练）
...
`;
```

### 用户上下文读取

```typescript
const getUserContext = (): string => {
  const assessmentData = localStorage.getItem('assessmentData');
  const techRecommendation = localStorage.getItem('techRecommendation');
  
  // 读取用户的评估数据、技术路线、当前力量数据等
  // 但不会修改任何数据
  
  return context;
};
```

## 环境变量配置

创建 `.env` 文件：

```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## 关于"联网搜索资料并自动总结"

⚠️ **重要说明**：

当前实现使用标准的 GPT-4 API，**不具备实时联网搜索能力**。

GPT-4 有丰富的训练数据，可以回答大部分腕力训练相关问题，但无法获取最新的实时信息。

**如需实现真正的联网搜索功能**，需要：
1. 集成搜索API（Bing Search API、Google Search API等）
2. 使用OpenAI的Function Calling功能让GPT请求搜索结果
3. 需要额外的开发和API费用

**当前建议**：
- GPT-4的知识库已足够丰富
- 可以将功能描述调整为"基于专业知识库提供训练建议"
- 或保持现状，依赖GPT-4的训练数据

## 页面路由

- `/` - 首页（付费入口）
- `/assessment` - 能力评估（需要 hasPlan 权限）
- `/tech-analysis` - 技术分析（需要 hasPlan 权限）
- `/training-plan` - 训练计划（需要 hasPlan 权限）
- `/ai-coach` - AI教练（需要 hasAICoach 权限，否则显示锁定页面）

## 测试流程

### 1. 购买训练计划
1. 访问首页
2. 点击"查看付费方案"
3. 选择"个人专属计划定制"（¥30）
4. 支付后跳转到能力评估

### 2. 购买AI教练（已有训练周期）
1. 点击导航栏"AI教练"
2. 进入锁定页面
3. 点击"支付 ¥150 启动 AI 教练"
4. 支付后刷新页面，进入聊天界面

### 3. 购买完整体验
1. 访问首页
2. 点击"查看付费方案"
3. 选择"完整 AQUARION 体验"（¥180）
4. 支付后跳转到能力评估
5. 完成评估后可同时使用训练计划和AI教练

### 4. 周期结束
1. 在训练计划页面完成第6周
2. 系统提示周期结束
3. 清除评估数据和当前周期ID
4. 跳转回首页重新付费

## 注意事项

1. **独立收费**：训练计划和AI教练完全独立，可单独购买
2. **周期绑定**：AI教练权限绑定到6周训练周期
3. **自动结束**：周期结束后AI教练权限自动失效
4. **只读限制**：AI教练不能修改任何训练数据
5. **安全限制**：AI教练不会提供危险建议
