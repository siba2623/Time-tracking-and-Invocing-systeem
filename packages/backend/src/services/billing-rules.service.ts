/**
 * Billing Rules Service
 * Handles billing rules for travel, allowances, etc.
 * Validates: Requirements 8.5
 */

export type BillingRuleType = 'travel' | 'allowance' | 'other';

export interface BillingRule {
  id: string;
  name: string;
  type: BillingRuleType;
  defaultAmount: number;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBillingRuleInput {
  name: string;
  type: BillingRuleType;
  defaultAmount: number;
  description?: string;
}

export interface UpdateBillingRuleInput {
  name?: string;
  type?: BillingRuleType;
  defaultAmount?: number;
  description?: string;
  active?: boolean;
}

/**
 * Creates a new billing rule
 */
export function createBillingRule(
  input: CreateBillingRuleInput,
  generateId: () => string = () => crypto.randomUUID()
): BillingRule {
  const now = new Date();
  return {
    id: generateId(),
    name: input.name,
    type: input.type,
    defaultAmount: input.defaultAmount,
    description: input.description ?? '',
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Updates an existing billing rule
 */
export function updateBillingRule(rule: BillingRule, updates: UpdateBillingRuleInput): BillingRule {
  return {
    ...rule,
    name: updates.name ?? rule.name,
    type: updates.type ?? rule.type,
    defaultAmount: updates.defaultAmount ?? rule.defaultAmount,
    description: updates.description ?? rule.description,
    active: updates.active ?? rule.active,
    updatedAt: new Date(),
  };
}

/**
 * Gets active billing rules
 */
export function getActiveBillingRules(rules: BillingRule[]): BillingRule[] {
  return rules.filter((rule) => rule.active);
}

/**
 * Gets billing rules by type
 */
export function getBillingRulesByType(rules: BillingRule[], type: BillingRuleType): BillingRule[] {
  return rules.filter((rule) => rule.type === type && rule.active);
}
