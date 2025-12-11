import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  filterEntriesForEmployee,
  filterEntriesForAdmin,
  TimeEntry,
} from './filtering.service.js';

// Arbitrary for generating time entries
const timeEntryArb = fc.record({
  id: fc.uuid(),
  employeeId: fc.uuid(),
  clientId: fc.uuid(),
  activityDate: fc.date({ min: new Date('2025-01-01'), max: new Date('2025-12-31') }),
  billable: fc.boolean(),
});

describe('Filtering Service - Property Tests', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 5: Employee Timesheet Filtering**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
   *
   * For any employee and any combination of filters, all returned time entries
   * SHALL belong to that employee AND satisfy all applied filter criteria.
   */
  describe('Property 5: Employee Timesheet Filtering', () => {
    it('all returned entries belong to the specified employee', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }),
          fc.uuid(),
          (entries, employeeId) => {
            const result = filterEntriesForEmployee(entries, employeeId);
            result.forEach((entry) => {
              expect(entry.employeeId).toBe(employeeId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('client filter returns only entries for that client', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }),
          fc.uuid(),
          fc.uuid(),
          (entries, employeeId, clientId) => {
            const result = filterEntriesForEmployee(entries, employeeId, { clientId });
            result.forEach((entry) => {
              expect(entry.clientId).toBe(clientId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });


    it('billable filter returns only entries matching billable status', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }),
          fc.uuid(),
          fc.boolean(),
          (entries, employeeId, billable) => {
            const result = filterEntriesForEmployee(entries, employeeId, { billable });
            result.forEach((entry) => {
              expect(entry.billable).toBe(billable);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: time-tracking-invoicing, Property 6: Admin Time Logs Filtering**
   * **Validates: Requirements 5.1, 5.2**
   *
   * For any combination of filters, all returned time entries SHALL satisfy
   * all applied filter criteria simultaneously.
   */
  describe('Property 6: Admin Time Logs Filtering', () => {
    it('employee filter returns only entries for that employee', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }),
          fc.uuid(),
          (entries, employeeId) => {
            const result = filterEntriesForAdmin(entries, { employeeId });
            result.forEach((entry) => {
              expect(entry.employeeId).toBe(employeeId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('combined filters return entries matching ALL criteria', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }),
          fc.uuid(),
          fc.uuid(),
          fc.boolean(),
          (entries, employeeId, clientId, billable) => {
            const result = filterEntriesForAdmin(entries, { employeeId, clientId, billable });
            result.forEach((entry) => {
              expect(entry.employeeId).toBe(employeeId);
              expect(entry.clientId).toBe(clientId);
              expect(entry.billable).toBe(billable);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('no filters returns all entries', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryArb, { minLength: 0, maxLength: 50 }),
          (entries) => {
            const result = filterEntriesForAdmin(entries, {});
            expect(result.length).toBe(entries.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
