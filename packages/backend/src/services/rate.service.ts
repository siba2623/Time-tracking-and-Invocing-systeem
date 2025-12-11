/**
 * Rate Resolution Service
 * Validates: Requirements 1.4, 8.3, 8.4
 */

export interface Rate {
  id: string;
  serviceId: string;
  employeeId: string | null;
  hourlyRate: number;
}

/**
 * Get effective rate for a service/employee combination
 * Returns employee-specific rate if exists, otherwise default service rate
 * Validates: Requirements 1.4, 8.3, 8.4
 */
export function getEffectiveRate(
  rates: Rate[],
  serviceId: string,
  employeeId?: string
): number | null {
  // First, try to find employee-specific rate
  if (employeeId) {
    const employeeRate = rates.find(
      (r) => r.serviceId === serviceId && r.employeeId === employeeId
    );
    if (employeeRate) {
      return employeeRate.hourlyRate;
    }
  }

  // Fall back to default service rate (employeeId is null)
  const defaultRate = rates.find(
    (r) => r.serviceId === serviceId && r.employeeId === null
  );

  return defaultRate ? defaultRate.hourlyRate : null;
}

/**
 * Resolve rate with priority: employee-specific > default
 * Validates: Requirements 1.4, 8.3, 8.4
 */
export function resolveRate(
  employeeRate: number | null,
  defaultRate: number | null
): number | null {
  if (employeeRate !== null) {
    return employeeRate;
  }
  return defaultRate;
}
