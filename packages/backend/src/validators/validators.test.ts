import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateRate,
  validateDuration,
  validateActivityDate,
  validateAllocationPercentage,
  validateTimeEntryForm,
} from './index.js';

describe('Validation Functions - Property Tests', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 2: Duration Validation**
   * **Validates: Requirements 1.5, 14.2**
   *
   * For any duration input value, the validation function SHALL accept
   * the value if and only if it is a positive numeric value not exceeding 24.
   */
  describe('Property 2: Duration Validation', () => {
    it('accepts valid durations (positive numbers <= 24)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 24, noNaN: true }),
          (duration) => {
            const result = validateDuration(duration);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects durations exceeding 24 hours', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 24.01, max: 1000, noNaN: true }),
          (duration) => {
            const result = validateDuration(duration);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects zero or negative durations', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: 0, noNaN: true }),
          (duration) => {
            const result = validateDuration(duration);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });


    it('rejects non-numeric values', () => {
      fc.assert(
        fc.property(fc.string(), (value) => {
          const result = validateDuration(value as unknown);
          expect(result.valid).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: time-tracking-invoicing, Property 3: Rate Validation**
   * **Validates: Requirements 14.1**
   *
   * For any rate input value, the validation function SHALL accept
   * the value if and only if it is a positive numeric value.
   */
  describe('Property 3: Rate Validation', () => {
    it('accepts positive rates', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 10000, noNaN: true }),
          (rate) => {
            const result = validateRate(rate);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects zero or negative rates', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -10000, max: 0, noNaN: true }),
          (rate) => {
            const result = validateRate(rate);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects non-numeric values', () => {
      fc.assert(
        fc.property(fc.string(), (value) => {
          const result = validateRate(value as unknown);
          expect(result.valid).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: time-tracking-invoicing, Property 4: Date Validation**
   * **Validates: Requirements 1.2, 14.3**
   *
   * For any date input, the validation function SHALL accept the value
   * if and only if it represents a valid calendar date not more than 30 days in the past.
   */
  describe('Property 4: Date Validation', () => {
    it('accepts dates within the last 30 days', () => {
      const referenceDate = new Date('2025-12-11');
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 30 }),
          (daysAgo) => {
            const testDate = new Date(referenceDate);
            testDate.setDate(testDate.getDate() - daysAgo);
            const result = validateActivityDate(testDate, referenceDate);
            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects dates more than 30 days in the past', () => {
      const referenceDate = new Date('2025-12-11');
      
      fc.assert(
        fc.property(
          fc.integer({ min: 31, max: 365 }),
          (daysAgo) => {
            const testDate = new Date(referenceDate);
            testDate.setDate(testDate.getDate() - daysAgo);
            const result = validateActivityDate(testDate, referenceDate);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('30 days');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects future dates', () => {
      const referenceDate = new Date('2025-12-11');
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 365 }),
          (daysAhead) => {
            const testDate = new Date(referenceDate);
            testDate.setDate(testDate.getDate() + daysAhead);
            const result = validateActivityDate(testDate, referenceDate);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('future');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects invalid date strings', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => isNaN(new Date(s).getTime())),
          (invalidDate) => {
            const result = validateActivityDate(invalidDate);
            expect(result.valid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: time-tracking-invoicing, Property 13: Allocation Percentage Validation**
   * **Validates: Requirements 7.2**
   *
   * For any allocation percentage input, the system SHALL accept the value
   * if and only if it is between 0 and 100 inclusive.
   */
  describe('Property 13: Allocation Percentage Validation', () => {
    it('accepts percentages between 0 and 100 inclusive', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (percentage) => {
            const result = validateAllocationPercentage(percentage);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects percentages below 0', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: -0.01, noNaN: true }),
          (percentage) => {
            const result = validateAllocationPercentage(percentage);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects percentages above 100', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 100.01, max: 1000, noNaN: true }),
          (percentage) => {
            const result = validateAllocationPercentage(percentage);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects non-numeric values', () => {
      fc.assert(
        fc.property(fc.string(), (value) => {
          const result = validateAllocationPercentage(value as unknown);
          expect(result.valid).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });
});


describe('Form Validation Error Handling - Property Tests', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 25: Form Validation Error Specificity**
   * **Validates: Requirements 14.4**
   *
   * For any form submission with one or more invalid fields, the system SHALL
   * return error messages that identify each specific invalid field.
   */
  describe('Property 25: Form Validation Error Specificity', () => {
    it('returns field-specific errors for invalid rate', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: 0, noNaN: true }),
          (invalidRate) => {
            const result = validateTimeEntryForm({ rate: invalidRate });
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveProperty('rate');
            expect(result.errors.rate.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns field-specific errors for invalid duration', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 25, max: 1000, noNaN: true }),
          (invalidDuration) => {
            const result = validateTimeEntryForm({ duration: invalidDuration });
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveProperty('duration');
            expect(result.errors.duration.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns errors for each invalid field when multiple fields are invalid', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: 0, noNaN: true }),
          fc.double({ min: 25, max: 1000, noNaN: true }),
          (invalidRate, invalidDuration) => {
            const result = validateTimeEntryForm({
              rate: invalidRate,
              duration: invalidDuration,
            });
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveProperty('rate');
            expect(result.errors).toHaveProperty('duration');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('returns valid=true when all fields are valid', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 1000, noNaN: true }),
          fc.double({ min: 0.01, max: 24, noNaN: true }),
          (validRate, validDuration) => {
            const result = validateTimeEntryForm({
              rate: validRate,
              duration: validDuration,
            });
            expect(result.valid).toBe(true);
            expect(Object.keys(result.errors).length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
