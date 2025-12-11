/**
 * Aggregation and Reporting Service
 * Handles hours and revenue aggregation
 * Validates: Requirements 4.1, 4.2, 7.1, 9.1, 9.2, 9.3
 */

export interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  duration: number;
  billable: boolean;
  amount: number;
  activityDate: Date;
}

export interface HoursByEmployee {
  employeeId: string;
  totalHours: number;
}

export interface BillableBreakdown {
  billableHours: number;
  nonBillableHours: number;
  totalHours: number;
}

export interface HoursByClient {
  clientId: string;
  totalHours: number;
}

export interface RevenueByConsultant {
  employeeId: string;
  totalRevenue: number;
}

/**
 * Calculate total hours per employee
 * Property 14: Hours Aggregation by Employee
 * Validates: Requirements 4.1, 7.1
 */
export function aggregateHoursByEmployee(entries: TimeEntry[]): HoursByEmployee[] {
  const hoursMap = new Map<string, number>();

  for (const entry of entries) {
    const current = hoursMap.get(entry.employeeId) ?? 0;
    hoursMap.set(entry.employeeId, current + entry.duration);
  }

  return Array.from(hoursMap.entries()).map(([employeeId, totalHours]) => ({
    employeeId,
    totalHours,
  }));
}


/**
 * Calculate billable vs non-billable breakdown
 * Property 15: Billable vs Non-Billable Breakdown
 * Validates: Requirements 4.2
 */
export function calculateBillableBreakdown(entries: TimeEntry[]): BillableBreakdown {
  let billableHours = 0;
  let nonBillableHours = 0;

  for (const entry of entries) {
    if (entry.billable) {
      billableHours += entry.duration;
    } else {
      nonBillableHours += entry.duration;
    }
  }

  return {
    billableHours,
    nonBillableHours,
    totalHours: billableHours + nonBillableHours,
  };
}

/**
 * Calculate hours by client
 * Property 16: Hours by Client Report
 * Validates: Requirements 9.1
 */
export function aggregateHoursByClient(entries: TimeEntry[]): HoursByClient[] {
  const hoursMap = new Map<string, number>();

  for (const entry of entries) {
    const current = hoursMap.get(entry.clientId) ?? 0;
    hoursMap.set(entry.clientId, current + entry.duration);
  }

  return Array.from(hoursMap.entries()).map(([clientId, totalHours]) => ({
    clientId,
    totalHours,
  }));
}

/**
 * Calculate revenue by consultant (billable amounts only)
 * Property 17: Revenue by Consultant Report
 * Validates: Requirements 9.2
 */
export function aggregateRevenueByConsultant(entries: TimeEntry[]): RevenueByConsultant[] {
  const revenueMap = new Map<string, number>();

  for (const entry of entries) {
    if (entry.billable) {
      const current = revenueMap.get(entry.employeeId) ?? 0;
      revenueMap.set(entry.employeeId, current + entry.amount);
    }
  }

  return Array.from(revenueMap.entries()).map(([employeeId, totalRevenue]) => ({
    employeeId,
    totalRevenue,
  }));
}

/**
 * Filter entries by date range
 */
export function filterEntriesByDateRange(
  entries: TimeEntry[],
  startDate: Date,
  endDate: Date
): TimeEntry[] {
  return entries.filter((entry) => {
    const entryDate = entry.activityDate;
    return entryDate >= startDate && entryDate <= endDate;
  });
}
