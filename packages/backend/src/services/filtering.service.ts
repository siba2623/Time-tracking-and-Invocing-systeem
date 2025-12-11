/**
 * Filtering Service - Pure functions for filtering time entries
 * Validates: Requirements 2.1-2.4, 5.1, 5.2
 */

export interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  activityDate: Date;
  billable: boolean;
}

export interface TimeEntryFilters {
  employeeId?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  billable?: boolean;
}

/**
 * Filter time entries for employee timesheet view
 * All returned entries must belong to the specified employee
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
export function filterEntriesForEmployee(
  entries: TimeEntry[],
  employeeId: string,
  filters: Omit<TimeEntryFilters, 'employeeId'> = {}
): TimeEntry[] {
  return entries.filter((entry) => {
    // Must belong to employee
    if (entry.employeeId !== employeeId) return false;

    // Apply client filter
    if (filters.clientId && entry.clientId !== filters.clientId) return false;

    // Apply date range filter
    if (filters.startDate && entry.activityDate < filters.startDate) return false;
    if (filters.endDate && entry.activityDate > filters.endDate) return false;

    // Apply billable filter
    if (filters.billable !== undefined && entry.billable !== filters.billable) return false;

    return true;
  });
}

/**
 * Filter time entries for admin view (all employees)
 * Validates: Requirements 5.1, 5.2
 */
export function filterEntriesForAdmin(
  entries: TimeEntry[],
  filters: TimeEntryFilters = {}
): TimeEntry[] {
  return entries.filter((entry) => {
    // Apply employee filter (optional for admin)
    if (filters.employeeId && entry.employeeId !== filters.employeeId) return false;

    // Apply client filter
    if (filters.clientId && entry.clientId !== filters.clientId) return false;

    // Apply date range filter
    if (filters.startDate && entry.activityDate < filters.startDate) return false;
    if (filters.endDate && entry.activityDate > filters.endDate) return false;

    // Apply billable filter
    if (filters.billable !== undefined && entry.billable !== filters.billable) return false;

    return true;
  });
}
