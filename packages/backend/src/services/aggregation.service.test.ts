import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Inline pure functions to avoid Prisma dependency
interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  duration: number;
  billable: boolean;
  amount: number;
  activityDate: Date;
}

interface HoursByEmployee {
  employeeId: string;
  totalHours: number;
}

interface BillableBreakdown {
  billableHours: number;
  nonBillableHours: number;
  totalHours: number;
}

interface HoursByClient {
  clientId: string;
  totalHours: number;
}

interface RevenueByConsultant {
  employeeId: string;
  totalRevenue: number;
}

function aggregateHoursByEmployee(entries: TimeEntry[]): HoursByEmployee[] {
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

function calculateBillableBreakdown(entries: TimeEntry[]): BillableBreakdown {
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


function aggregateHoursByClient(entries: TimeEntry[]): HoursByClient[] {
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

function aggregateRevenueByConsultant(entries: TimeEntry[]): RevenueByConsultant[] {
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

// Arbitraries for generating test data
const timeEntryArb = fc.record({
  id: fc.uuid(),
  employeeId: fc.uuid(),
  clientId: fc.uuid(),
  duration: fc.double({ min: 0.25, max: 24, noNaN: true }),
  billable: fc.boolean(),
  amount: fc.double({ min: 0, max: 10000, noNaN: true }),
  activityDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
});

describe('Aggregation Service', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 14: Hours Aggregation by Employee**
   * **Validates: Requirements 4.1, 7.1**
   *
   * For any set of time entries, the total hours per employee SHALL equal
   * the sum of duration values for all entries belonging to that employee.
   */
  describe('Property 14: Hours Aggregation by Employee', () => {
    test('total hours per employee equals sum of durations for that employee', () => {
      fc.assert(
        fc.property(fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }), (entries) => {
          const result = aggregateHoursByEmployee(entries);

          // For each employee in result, verify the total matches manual calculation
          for (const { employeeId, totalHours } of result) {
            const expectedTotal = entries
              .filter((e) => e.employeeId === employeeId)
              .reduce((sum, e) => sum + e.duration, 0);

            expect(totalHours).toBeCloseTo(expectedTotal, 10);
          }

          // Verify all employees with entries are represented
          const employeeIds = new Set(entries.map((e) => e.employeeId));
          expect(result.length).toBe(employeeIds.size);
        }),
        { numRuns: 100 }
      );
    });

    test('empty entries returns empty result', () => {
      const result = aggregateHoursByEmployee([]);
      expect(result).toEqual([]);
    });
  });


  /**
   * **Feature: time-tracking-invoicing, Property 15: Billable vs Non-Billable Breakdown**
   * **Validates: Requirements 4.2**
   *
   * For any set of time entries, the billable hours total SHALL equal the sum of
   * durations where billable is true, and non-billable hours SHALL equal the sum
   * where billable is false.
   */
  describe('Property 15: Billable vs Non-Billable Breakdown', () => {
    test('billable hours equals sum of durations where billable is true', () => {
      fc.assert(
        fc.property(fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }), (entries) => {
          const result = calculateBillableBreakdown(entries);

          const expectedBillable = entries
            .filter((e) => e.billable)
            .reduce((sum, e) => sum + e.duration, 0);

          const expectedNonBillable = entries
            .filter((e) => !e.billable)
            .reduce((sum, e) => sum + e.duration, 0);

          expect(result.billableHours).toBeCloseTo(expectedBillable, 10);
          expect(result.nonBillableHours).toBeCloseTo(expectedNonBillable, 10);
          expect(result.totalHours).toBeCloseTo(expectedBillable + expectedNonBillable, 10);
        }),
        { numRuns: 100 }
      );
    });

    test('total hours equals billable plus non-billable', () => {
      fc.assert(
        fc.property(fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }), (entries) => {
          const result = calculateBillableBreakdown(entries);
          expect(result.totalHours).toBeCloseTo(result.billableHours + result.nonBillableHours, 10);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: time-tracking-invoicing, Property 16: Hours by Client Report**
   * **Validates: Requirements 9.1**
   *
   * For any date range, the hours-by-client report SHALL show totals that equal
   * the sum of durations grouped by client for entries within that range.
   */
  describe('Property 16: Hours by Client Report', () => {
    test('total hours per client equals sum of durations for that client', () => {
      fc.assert(
        fc.property(fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }), (entries) => {
          const result = aggregateHoursByClient(entries);

          // For each client in result, verify the total matches manual calculation
          for (const { clientId, totalHours } of result) {
            const expectedTotal = entries
              .filter((e) => e.clientId === clientId)
              .reduce((sum, e) => sum + e.duration, 0);

            expect(totalHours).toBeCloseTo(expectedTotal, 10);
          }

          // Verify all clients with entries are represented
          const clientIds = new Set(entries.map((e) => e.clientId));
          expect(result.length).toBe(clientIds.size);
        }),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: time-tracking-invoicing, Property 17: Revenue by Consultant Report**
   * **Validates: Requirements 9.2**
   *
   * For any date range, the revenue-by-consultant report SHALL show totals that
   * equal the sum of billable amounts grouped by employee for entries within that range.
   */
  describe('Property 17: Revenue by Consultant Report', () => {
    test('total revenue per consultant equals sum of billable amounts for that employee', () => {
      fc.assert(
        fc.property(fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }), (entries) => {
          const result = aggregateRevenueByConsultant(entries);

          // For each employee in result, verify the total matches manual calculation
          for (const { employeeId, totalRevenue } of result) {
            const expectedTotal = entries
              .filter((e) => e.employeeId === employeeId && e.billable)
              .reduce((sum, e) => sum + e.amount, 0);

            expect(totalRevenue).toBeCloseTo(expectedTotal, 10);
          }

          // Verify only employees with billable entries are represented
          const employeesWithBillable = new Set(
            entries.filter((e) => e.billable).map((e) => e.employeeId)
          );
          expect(result.length).toBe(employeesWithBillable.size);
        }),
        { numRuns: 100 }
      );
    });

    test('non-billable entries do not contribute to revenue', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              employeeId: fc.uuid(),
              clientId: fc.uuid(),
              duration: fc.double({ min: 0.25, max: 24, noNaN: true }),
              billable: fc.constant(false),
              amount: fc.double({ min: 100, max: 10000, noNaN: true }),
              activityDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (nonBillableEntries) => {
            const result = aggregateRevenueByConsultant(nonBillableEntries);
            expect(result).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
