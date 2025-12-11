/**
 * Commission and Payroll Service
 * Handles commission calculations and employee allocations
 * Validates: Requirements 7.2, 7.3, 7.4
 */

export interface EmployeeAllocation {
  id: string;
  employeeId: string;
  percentage: number; // 0-100
  effectiveFrom: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionResult {
  employeeId: string;
  billableAmount: number;
  allocationPercentage: number;
  commission: number;
}

export interface PayrollBreakdown {
  employeeId: string;
  clientId: string;
  totalHours: number;
  billableHours: number;
  billableAmount: number;
}

/**
 * Calculate commission for an employee
 * Property 12: Commission Calculation
 * commission = billableAmount × allocationPercentage / 100
 * Validates: Requirements 7.3
 */
export function calculateCommission(
  billableAmount: number,
  allocationPercentage: number
): number {
  if (billableAmount < 0 || allocationPercentage < 0 || allocationPercentage > 100) {
    return 0;
  }
  return (billableAmount * allocationPercentage) / 100;
}

/**
 * Validates allocation percentage is between 0 and 100
 * Property 13: Allocation Percentage Validation
 * Validates: Requirements 7.2
 */
export function isValidAllocationPercentage(percentage: number): boolean {
  return (
    typeof percentage === 'number' &&
    !isNaN(percentage) &&
    percentage >= 0 &&
    percentage <= 100
  );
}


/**
 * Creates an employee allocation record
 */
export function createEmployeeAllocation(
  employeeId: string,
  percentage: number,
  generateId: () => string = () => crypto.randomUUID()
): EmployeeAllocation | null {
  if (!isValidAllocationPercentage(percentage)) {
    return null;
  }

  const now = new Date();
  return {
    id: generateId(),
    employeeId,
    percentage,
    effectiveFrom: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Updates an employee allocation percentage
 */
export function updateEmployeeAllocation(
  allocation: EmployeeAllocation,
  newPercentage: number
): EmployeeAllocation | null {
  if (!isValidAllocationPercentage(newPercentage)) {
    return null;
  }

  return {
    ...allocation,
    percentage: newPercentage,
    updatedAt: new Date(),
  };
}

/**
 * Gets the effective allocation for an employee
 */
export function getEffectiveAllocation(
  allocations: EmployeeAllocation[],
  employeeId: string
): EmployeeAllocation | undefined {
  // Get the most recent allocation for the employee
  const employeeAllocations = allocations
    .filter((a) => a.employeeId === employeeId)
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());

  return employeeAllocations[0];
}

/**
 * Calculate commission report for multiple employees
 */
export function calculateCommissionReport(
  employeeBillableAmounts: Map<string, number>,
  allocations: EmployeeAllocation[]
): CommissionResult[] {
  const results: CommissionResult[] = [];

  for (const [employeeId, billableAmount] of employeeBillableAmounts) {
    const allocation = getEffectiveAllocation(allocations, employeeId);
    const allocationPercentage = allocation?.percentage ?? 0;
    const commission = calculateCommission(billableAmount, allocationPercentage);

    results.push({
      employeeId,
      billableAmount,
      allocationPercentage,
      commission,
    });
  }

  return results;
}
