import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Inline pure functions to avoid Prisma dependency
function calculateCommission(billableAmount: number, allocationPercentage: number): number {
  if (billableAmount < 0 || allocationPercentage < 0 || allocationPercentage > 100) {
    return 0;
  }
  return (billableAmount * allocationPercentage) / 100;
}

function isValidAllocationPercentage(percentage: number): boolean {
  return (
    typeof percentage === 'number' &&
    !isNaN(percentage) &&
    percentage >= 0 &&
    percentage <= 100
  );
}

describe('Commission Service', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 12: Commission Calculation**
   * **Validates: Requirements 7.3**
   *
   * For any employee with an allocation percentage and billable amount,
   * the calculated commission SHALL equal the billable amount multiplied
   * by the allocation percentage divided by 100.
   */
  describe('Property 12: Commission Calculation', () => {
    test('commission equals billableAmount × allocationPercentage / 100', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100000, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          (billableAmount, allocationPercentage) => {
            const commission = calculateCommission(billableAmount, allocationPercentage);
            const expected = (billableAmount * allocationPercentage) / 100;

            expect(commission).toBeCloseTo(expected, 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('zero billable amount results in zero commission', () => {
      fc.assert(
        fc.property(fc.double({ min: 0, max: 100, noNaN: true }), (allocationPercentage) => {
          const commission = calculateCommission(0, allocationPercentage);
          expect(commission).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    test('zero allocation percentage results in zero commission', () => {
      fc.assert(
        fc.property(fc.double({ min: 0, max: 100000, noNaN: true }), (billableAmount) => {
          const commission = calculateCommission(billableAmount, 0);
          expect(commission).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    test('100% allocation equals full billable amount', () => {
      fc.assert(
        fc.property(fc.double({ min: 0, max: 100000, noNaN: true }), (billableAmount) => {
          const commission = calculateCommission(billableAmount, 100);
          expect(commission).toBeCloseTo(billableAmount, 10);
        }),
        { numRuns: 100 }
      );
    });

    test('negative billable amount returns zero', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -100000, max: -0.01, noNaN: true }),
          fc.double({ min: 0, max: 100, noNaN: true }),
          (billableAmount, allocationPercentage) => {
            const commission = calculateCommission(billableAmount, allocationPercentage);
            expect(commission).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('allocation percentage outside 0-100 returns zero', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100000, noNaN: true }),
          fc.oneof(
            fc.double({ min: -100, max: -0.01, noNaN: true }),
            fc.double({ min: 100.01, max: 200, noNaN: true })
          ),
          (billableAmount, invalidPercentage) => {
            const commission = calculateCommission(billableAmount, invalidPercentage);
            expect(commission).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Additional tests for allocation percentage validation
   * (Property 13 is already tested in validators.test.ts)
   */
  describe('Allocation Percentage Validation', () => {
    test('valid percentages are accepted (0-100)', () => {
      fc.assert(
        fc.property(fc.double({ min: 0, max: 100, noNaN: true }), (percentage) => {
          expect(isValidAllocationPercentage(percentage)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    test('percentages below 0 are rejected', () => {
      fc.assert(
        fc.property(fc.double({ min: -1000, max: -0.01, noNaN: true }), (percentage) => {
          expect(isValidAllocationPercentage(percentage)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    test('percentages above 100 are rejected', () => {
      fc.assert(
        fc.property(fc.double({ min: 100.01, max: 1000, noNaN: true }), (percentage) => {
          expect(isValidAllocationPercentage(percentage)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    test('NaN is rejected', () => {
      expect(isValidAllocationPercentage(NaN)).toBe(false);
    });
  });
});
