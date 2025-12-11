import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getEffectiveRate, resolveRate, Rate } from './rate.service.js';

describe('Rate Service - Property Tests', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 9: Service Rate Auto-Fill**
   * **Validates: Requirements 1.4, 8.3, 8.4**
   *
   * For any service selection, the auto-filled rate SHALL equal the
   * employee-specific rate if one exists, otherwise the default service rate.
   */
  describe('Property 9: Service Rate Auto-Fill', () => {
    it('returns employee-specific rate when it exists', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.double({ min: 1, max: 500, noNaN: true }),
          fc.double({ min: 1, max: 500, noNaN: true }),
          (serviceId, employeeId, employeeRate, defaultRate) => {
            const rates: Rate[] = [
              { id: '1', serviceId, employeeId: null, hourlyRate: defaultRate },
              { id: '2', serviceId, employeeId, hourlyRate: employeeRate },
            ];
            
            const result = getEffectiveRate(rates, serviceId, employeeId);
            expect(result).toBe(employeeRate);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('falls back to default rate when no employee-specific rate exists', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.double({ min: 1, max: 500, noNaN: true }),
          (serviceId, employeeId, defaultRate) => {
            const rates: Rate[] = [
              { id: '1', serviceId, employeeId: null, hourlyRate: defaultRate },
            ];
            
            const result = getEffectiveRate(rates, serviceId, employeeId);
            expect(result).toBe(defaultRate);
          }
        ),
        { numRuns: 100 }
      );
    });


    it('returns null when no rate exists for service', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.uuid(),
          (serviceId, employeeId, otherServiceId) => {
            fc.pre(serviceId !== otherServiceId);
            const rates: Rate[] = [
              { id: '1', serviceId: otherServiceId, employeeId: null, hourlyRate: 100 },
            ];
            
            const result = getEffectiveRate(rates, serviceId, employeeId);
            expect(result).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('resolveRate prioritizes employee rate over default', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 1, max: 500, noNaN: true }),
          fc.double({ min: 1, max: 500, noNaN: true }),
          (employeeRate, defaultRate) => {
            const result = resolveRate(employeeRate, defaultRate);
            expect(result).toBe(employeeRate);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('resolveRate uses default when employee rate is null', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 1, max: 500, noNaN: true }),
          (defaultRate) => {
            const result = resolveRate(null, defaultRate);
            expect(result).toBe(defaultRate);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
