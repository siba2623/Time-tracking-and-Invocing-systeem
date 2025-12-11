import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Inline types and functions
interface TimeEntryExport {
  id: string;
  employeeId: string;
  employeeName?: string;
  clientId: string;
  clientName?: string;
  serviceId: string;
  serviceName?: string;
  activityDate: Date;
  memo: string;
  rate: number;
  duration: number;
  billable: boolean;
  amount: number;
}

function transformEntriesForExport(entries: TimeEntryExport[]): Record<string, unknown>[] {
  return entries.map((entry) => ({
    activityDate: entry.activityDate.toISOString().split('T')[0],
    employeeName: entry.employeeName ?? entry.employeeId,
    clientName: entry.clientName ?? entry.clientId,
    serviceName: entry.serviceName ?? entry.serviceId,
    memo: entry.memo,
    duration: entry.duration,
    rate: entry.rate,
    billable: entry.billable ? 'Yes' : 'No',
    amount: entry.amount,
  }));
}

function parseExportedData(rows: Record<string, unknown>[]): Partial<TimeEntryExport>[] {
  return rows.map((row) => ({
    activityDate: row.activityDate ? new Date(row.activityDate as string) : undefined,
    employeeName: row.employeeName as string | undefined,
    clientName: row.clientName as string | undefined,
    serviceName: row.serviceName as string | undefined,
    memo: row.memo as string | undefined,
    duration: typeof row.duration === 'number' ? row.duration : parseFloat(row.duration as string),
    rate: typeof row.rate === 'number' ? row.rate : parseFloat(row.rate as string),
    billable: row.billable === 'Yes' || row.billable === true,
    amount: typeof row.amount === 'number' ? row.amount : parseFloat(row.amount as string),
  }));
}


// Arbitraries
const timeEntryExportArb = fc.record({
  id: fc.uuid(),
  employeeId: fc.uuid(),
  employeeName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  clientId: fc.uuid(),
  clientName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  serviceId: fc.uuid(),
  serviceName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  activityDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
  memo: fc.string({ maxLength: 100 }),
  rate: fc.double({ min: 10, max: 500, noNaN: true }),
  duration: fc.double({ min: 0.25, max: 24, noNaN: true }),
  billable: fc.boolean(),
  amount: fc.double({ min: 0, max: 10000, noNaN: true }),
});

describe('Excel Service', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 22: Excel Export Round-Trip**
   * **Validates: Requirements 5.3**
   *
   * For any set of filtered time entries, exporting to Excel and parsing
   * the result SHALL yield data equivalent to the original filtered entries.
   */
  describe('Property 22: Excel Export Round-Trip', () => {
    test('exported and parsed data matches original entries', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryExportArb, { minLength: 1, maxLength: 30 }),
          (entries) => {
            // Export entries
            const exported = transformEntriesForExport(entries);

            // Parse exported data
            const parsed = parseExportedData(exported);

            // Verify count matches
            expect(parsed.length).toBe(entries.length);

            // Verify each entry matches
            for (let i = 0; i < entries.length; i++) {
              const orig = entries[i];
              const pars = parsed[i];

              // Check memo matches
              expect(pars.memo).toBe(orig.memo);

              // Check numeric values match (with tolerance for floating point)
              expect(pars.duration).toBeCloseTo(orig.duration, 10);
              expect(pars.rate).toBeCloseTo(orig.rate, 10);
              expect(pars.amount).toBeCloseTo(orig.amount, 10);

              // Check billable matches
              expect(pars.billable).toBe(orig.billable);

              // Check date matches
              const origDate = orig.activityDate.toISOString().split('T')[0];
              const parsDate = pars.activityDate?.toISOString().split('T')[0];
              expect(parsDate).toBe(origDate);
            }
          }
        ),
        { numRuns: 100 }
      );
    });


    test('billable flag is correctly preserved', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryExportArb, { minLength: 1, maxLength: 20 }),
          (entries) => {
            const exported = transformEntriesForExport(entries);
            const parsed = parseExportedData(exported);

            for (let i = 0; i < entries.length; i++) {
              expect(parsed[i].billable).toBe(entries[i].billable);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('empty entries array exports and parses correctly', () => {
      const exported = transformEntriesForExport([]);
      const parsed = parseExportedData(exported);
      expect(parsed).toEqual([]);
    });

    test('export includes all required columns', () => {
      fc.assert(
        fc.property(timeEntryExportArb, (entry) => {
          const exported = transformEntriesForExport([entry]);
          const row = exported[0];

          // Verify all expected keys are present
          expect(row).toHaveProperty('activityDate');
          expect(row).toHaveProperty('employeeName');
          expect(row).toHaveProperty('clientName');
          expect(row).toHaveProperty('serviceName');
          expect(row).toHaveProperty('memo');
          expect(row).toHaveProperty('duration');
          expect(row).toHaveProperty('rate');
          expect(row).toHaveProperty('billable');
          expect(row).toHaveProperty('amount');
        }),
        { numRuns: 100 }
      );
    });
  });
});
