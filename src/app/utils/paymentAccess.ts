export type PurchaseType = 'plan' | 'ai' | 'bundle';

export interface PaidCycle {
  id: string;
  status: 'active' | 'completed';
  type?: PurchaseType;
  price: number;
  weeks: number;
  startedAt: string;
  paidAt: string;
  completedAt?: string;
  inviteCode?: string;
  aiCoachInviteCode?: string;
  hasPlan: boolean;
  hasAICoach: boolean;
  aiCoachPaidAt?: string;
  updatedAt?: string;
}

export const WEEKS_PER_CYCLE = 6;

export function getPaidCycles(): PaidCycle[] {
  try {
    const stored = localStorage.getItem('paidCycles');
    if (!stored) return [];

    const cycles = JSON.parse(stored);
    return Array.isArray(cycles) ? cycles : [];
  } catch {
    return [];
  }
}

export function savePaidCycles(cycles: PaidCycle[]) {
  localStorage.setItem('paidCycles', JSON.stringify(cycles));
}

export function findCurrentCycle(cycles = getPaidCycles()): { cycle: PaidCycle | null; index: number } {
  const currentCycleId = localStorage.getItem('currentCycleId');
  if (!currentCycleId) return { cycle: null, index: -1 };

  const index = cycles.findIndex((cycle) => cycle.id === currentCycleId && cycle.status === 'active');
  return {
    cycle: index === -1 ? null : cycles[index],
    index,
  };
}

export function hasTrainingPlanAccess(cycle: PaidCycle | null | undefined): boolean {
  return cycle?.status === 'active' && cycle.hasPlan === true;
}

export function hasAICoachAccess(cycle: PaidCycle | null | undefined): boolean {
  return cycle?.status === 'active' && cycle.hasAICoach === true;
}

export function createPaidCycle(type: PurchaseType, price: number, inviteCode?: string): PaidCycle {
  const now = new Date().toISOString();

  return {
    id: `cycle_${Date.now()}`,
    status: 'active',
    type,
    price,
    weeks: WEEKS_PER_CYCLE,
    startedAt: now,
    paidAt: now,
    inviteCode,
    hasPlan: type === 'plan' || type === 'bundle',
    hasAICoach: type === 'ai' || type === 'bundle',
    aiCoachPaidAt: type === 'ai' || type === 'bundle' ? now : undefined,
  };
}

export function addAICoachToCurrentCycle(price: number, inviteCode?: string): PaidCycle {
  const cycles = getPaidCycles();
  const { cycle, index } = findCurrentCycle(cycles);
  const now = new Date().toISOString();

  if (cycle && index !== -1) {
    const updatedCycle: PaidCycle = {
      ...cycle,
      hasAICoach: true,
      aiCoachPaidAt: now,
      aiCoachInviteCode: inviteCode || cycle.aiCoachInviteCode,
      updatedAt: now,
    };

    cycles[index] = updatedCycle;
    savePaidCycles(cycles);
    localStorage.setItem('currentCycleId', updatedCycle.id);
    return updatedCycle;
  }

  const newCycle = createPaidCycle('ai', price, inviteCode);
  cycles.push(newCycle);
  savePaidCycles(cycles);
  localStorage.setItem('currentCycleId', newCycle.id);
  return newCycle;
}
