// AI 教练 API 端点 - 安全调用 OpenAI

import type { Context } from 'npm:hono';

export async function handleAICoach(c: Context) {
  try {
    // 获取请求体
    const body = await c.req.json();
    const { messages, userContext } = body;

    // 验证请求
    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: '无效的请求参数' }, 400);
    }

    // 从服务器环境变量获取 API Key（安全！）
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      console.error('OpenAI API Key 未配置');
      return c.json({ error: 'AI 服务暂时不可用' }, 500);
    }

    // 构建系统提示词
    const systemPrompt = `你是 AQUARION AI 教练，专业的手臂摔跤（腕力）训练顾问。你拥有丰富的腕力训练、力量训练、运动营养和比赛准备知识。

${userContext ? `用户上下文：\n${userContext}\n` : ''}

核心规则（严格遵守）：
1. 你只能提供建议和指导，绝对不能修改以下任何数据：
   - 训练计划内容
   - 训练动作和重量
   - 训练频率和周数
   - 能力评估数据
   - 付费状态
   - 受伤状态
2. 你是一个只读顾问，用户的所有训练数据对你来说都是只读的
3. 如果用户要求你修改训练计划、改变周数、调整重量等，你必须明确拒绝并解释你只能提供建议
4. 当用户描述严重疼痛、急性损伤或持续不适时，必须建议他们立即停止训练并就医
5. 不要提供危险的训练建议（如过度负荷、危险动作、危险减重、药物滥用、带伤硬练等）
6. 回答要专业、简洁、实用，使用中文
7. 可以参考用户的评估数据提供个性化建议
8. 如果用户问题超出你的专业范围，诚实告知
9. 不要鼓励或建议任何违反训练指南原则的行为
10. 利用你的知识库回答问题，提供基于科学训练理论的建议

你可以回答的问题包括：
- 手臂摔跤（腕力）训练技巧和方法
- 内侧力、外侧力、横向力、前端专项的训练原理
- 力量训练计划的原理和建议（但不能修改用户的计划）
- 营养和体重管理建议（增肌、减脂、赛前控重）
- 恢复和休息建议
- 比赛准备策略和战术分析
- 轻微训练损伤的康复建议（严重损伤必须建议就医）
- 技术分析和战术指导（上手、过手、顶腕、钩腕等）
- 心理准备和比赛心态
- 训练装备和辅助工具的使用建议`;

    // 调用 OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API 错误:', error);
      return c.json({ error: 'AI 服务请求失败' }, response.status);
    }

    const data = await response.json();

    return c.json({
      message: data.choices[0].message.content,
      usage: data.usage,
    });

  } catch (error) {
    console.error('AI Coach 错误:', error);
    return c.json({ error: '服务器内部错误' }, 500);
  }
}
