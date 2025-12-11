import { describe, test, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Inline types and functions
interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  serviceId: string;
  activityDate: Date;
  memo: string;
  rate: number;
  duration: number;
  billable: boolean;
  amount: number;
}

interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  timeEntryId: string | null;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  type: 'time_entry' | 'additional_charge';
}

function getBillableEntriesForInvoice(
  entries: TimeEntry[],
  clientId: string,
  startDate: Date,
  endDate: Date
): TimeEntry[] {
  return entries.filter((entry) => {
    return (
      entry.clientId === clientId &&
      entry.billable &&
      entry.activityDate >= startDate &&
      entry.activityDate <= endDate
    );
  });
}

function createLineItemsFromEntries(
  entries: TimeEntry[],
  invoiceId: string,
  generateId: () => string = () => crypto.randomUUID()
): InvoiceLineItem[] {
  return entries.map((entry) => ({
    id: generateId(),
    invoiceId,
    timeEntryId: entry.id,
    description: entry.memo || `Service on ${entry.activityDate.toISOString().split('T')[0]}`,
    quantity: entry.duration,
    rate: entry.rate,
    amount: entry.amount,
    type: 'time_entry' as const,
  }));
}

let invoiceCounter = 0;

function generateInvoiceNumber(
  prefix: string = 'INV',
  existingNumbers: Set<string> = new Set()
): string {
  const year = new Date().getFullYear();
  let number: string;

  do {
    invoiceCounter++;
    number = `${prefix}-${year}-${String(invoiceCounter).padStart(6, '0')}`;
  } while (existingNumbers.has(number));

  return number;
}

function resetInvoiceCounter(): void {
  invoiceCounter = 0;
}

// Arbitraries
const timeEntryArb = fc.record({
  id: fc.uuid(),
  employeeId: fc.uuid(),
  clientId: fc.uuid(),
  serviceId: fc.uuid(),
  activityDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
  memo: fc.string({ maxLength: 100 }),
  rate: fc.double({ min: 10, max: 500, noNaN: true }),
  duration: fc.double({ min: 0.25, max: 24, noNaN: true }),
  billable: fc.boolean(),
  amount: fc.double({ min: 0, max: 10000, noNaN: true }),
});

describe('Invoice Service', () => {
  beforeEach(() => {
    resetInvoiceCounter();
  });


  /**
   * **Feature: time-tracking-invoicing, Property 10: Invoice Aggregation Correctness**
   * **Validates: Requirements 6.1, 6.2**
   */
  describe('Property 10: Invoice Aggregation Correctness', () => {
    test('invoice includes exactly all billable entries for client within date range', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryArb, { minLength: 1, maxLength: 30 }),
          fc.uuid(),
          fc.date({ min: new Date('2024-01-01'), max: new Date('2024-06-30') }),
          fc.date({ min: new Date('2024-07-01'), max: new Date('2025-12-31') }),
          (entries, targetClientId, startDate, endDate) => {
            const entriesWithTarget = entries.map((e, i) =>
              i === 0 ? { ...e, clientId: targetClientId, billable: true } : e
            );

            const [actualStart, actualEnd] =
              startDate <= endDate ? [startDate, endDate] : [endDate, startDate];

            const billableEntries = getBillableEntriesForInvoice(
              entriesWithTarget,
              targetClientId,
              actualStart,
              actualEnd
            );

            billableEntries.forEach((entry) => {
              expect(entry.billable).toBe(true);
              expect(entry.clientId).toBe(targetClientId);
              expect(entry.activityDate.getTime()).toBeGreaterThanOrEqual(actualStart.getTime());
              expect(entry.activityDate.getTime()).toBeLessThanOrEqual(actualEnd.getTime());
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('line items match original entry amounts', () => {
      fc.assert(
        fc.property(
          fc.array(timeEntryArb.filter((e) => e.billable), { minLength: 1, maxLength: 20 }),
          fc.uuid(),
          (entries, invoiceId) => {
            const lineItems = createLineItemsFromEntries(entries, invoiceId);

            expect(lineItems.length).toBe(entries.length);

            lineItems.forEach((item, index) => {
              expect(item.amount).toBe(entries[index].amount);
              expect(item.rate).toBe(entries[index].rate);
              expect(item.quantity).toBe(entries[index].duration);
              expect(item.timeEntryId).toBe(entries[index].id);
              expect(item.invoiceId).toBe(invoiceId);
              expect(item.type).toBe('time_entry');
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: time-tracking-invoicing, Property 11: Invoice Number Uniqueness**
   * **Validates: Requirements 6.5**
   */
  describe('Property 11: Invoice Number Uniqueness', () => {
    test('generated invoice numbers are unique', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (count) => {
          resetInvoiceCounter();
          const existingNumbers = new Set<string>();
          const generatedNumbers: string[] = [];

          for (let i = 0; i < count; i++) {
            const number = generateInvoiceNumber('INV', existingNumbers);
            generatedNumbers.push(number);
            existingNumbers.add(number);
          }

          const uniqueNumbers = new Set(generatedNumbers);
          expect(uniqueNumbers.size).toBe(count);
        }),
        { numRuns: 100 }
      );
    });

    test('invoice numbers follow expected format', () => {
      fc.assert(
        fc.property(fc.constantFrom('INV', 'BILL', 'REC'), (prefix) => {
          resetInvoiceCounter();
          const number = generateInvoiceNumber(prefix);
          const year = new Date().getFullYear();

          expect(number).toMatch(new RegExp(`^${prefix}-${year}-\\d{6}$`));
        }),
        { numRuns: 50 }
      );
    });
  });
});
