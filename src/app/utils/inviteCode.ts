// 邀请码管理系统

export interface InviteCode {
  code: string;
  type: 'plan' | 'ai' | 'bundle';
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
  valid: boolean;
}

// 预设的邀请码列表（你可以手动添加）
const VALID_CODES: { [key: string]: Omit<InviteCode, 'code'> } = {
  // 训练计划邀请码示例
  'AQUA-PLAN-2024': { type: 'plan', createdAt: '2024-01-01', valid: true },

  // AI教练邀请码示例
  'AQUA-AI-2024': { type: 'ai', createdAt: '2024-01-01', valid: true },

  // 完整体验邀请码示例
  'AQUA-BUNDLE-2024': { type: 'bundle', createdAt: '2024-01-01', valid: true },
};

/**
 * 生成邀请码
 */
export function generateInviteCode(type: 'plan' | 'ai' | 'bundle'): string {
  const prefix = type === 'plan' ? 'PLAN' : type === 'ai' ? 'AI' : 'BUNDLE';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `AQUA-${prefix}-${randomPart}${timestamp}`;
}

/**
 * 验证邀请码
 */
export function validateInviteCode(code: string): {
  valid: boolean;
  type?: 'plan' | 'ai' | 'bundle';
  message: string;
} {
  // 检查是否为空
  if (!code || code.trim() === '') {
    return { valid: false, message: '请输入邀请码' };
  }

  const normalizedCode = code.trim().toUpperCase();

  // 检查是否在预设列表中
  if (VALID_CODES[normalizedCode]) {
    const codeInfo = VALID_CODES[normalizedCode];

    if (!codeInfo.valid) {
      return { valid: false, message: '此邀请码已失效' };
    }

    // 检查是否已使用
    const usedCodes = getUsedCodes();
    if (usedCodes.includes(normalizedCode)) {
      return { valid: false, message: '此邀请码已被使用' };
    }

    return {
      valid: true,
      type: codeInfo.type,
      message: '邀请码验证成功'
    };
  }

  return { valid: false, message: '邀请码无效或不存在' };
}

/**
 * 标记邀请码为已使用
 */
export function markCodeAsUsed(code: string): void {
  const usedCodes = getUsedCodes();
  const normalizedCode = code.trim().toUpperCase();

  if (!usedCodes.includes(normalizedCode)) {
    usedCodes.push(normalizedCode);
    localStorage.setItem('usedInviteCodes', JSON.stringify(usedCodes));
  }
}

/**
 * 获取已使用的邀请码列表
 */
function getUsedCodes(): string[] {
  const stored = localStorage.getItem('usedInviteCodes');
  return stored ? JSON.parse(stored) : [];
}

/**
 * 批量生成邀请码（管理员使用）
 */
export function generateBatchCodes(type: 'plan' | 'ai' | 'bundle', count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateInviteCode(type));
  }
  return codes;
}
