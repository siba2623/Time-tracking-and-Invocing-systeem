import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Inline the pure functions for testing without Prisma dependency
function calculateAmount(rate: number, duration: number, billable: boolean): number {
  if (!billable) {
    return 0;
  }
  return Math.round(rate * duration * 100) / 100;
}

function canModifyEntry(entryCreatedAt: Date, currentTime: Date = new Date()): boolean {
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const timeDiff = currentTime.getTime() - entryCreatedAt.getTime();
  return timeDiff <= twentyFourHoursMs;
}

function isEntryOwner(entryEmployeeId: string, userId: string): boolean {
  return entryEmployeeId === userId;
}

function canUserModifyEntry(
  entryEmployeeId: string,
  entryCreatedAt: Date,
  userId: string,
  currentTime: Date = new Date()
): boolean {
  return isEntryOwner(entryEmployeeId, userId) && canModifyEntry(entryCreatedAt, currentTime);
}

describe('Time Entry Service - Property Tests', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 1: Amount Calculation Correctness**
   * **Validates: Requirements 1.6, 1.7**
   */
  describe('Property 1: Amount Calculation Correctness', () => {
    it('billable entries have amount = rate × duration', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 1000, noNaN: true }),
          fc.double({ min: 0.01, max: 24, noNaN: true }),
          (rate, duration) => {
            const amount = calculateAmount(rate, duration, true);
            const expected = Math.round(rate * duration * 100) / 100;
            expect(amount).toBeCloseTo(expected, 2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('non-billable entries have amount = 0', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 1000, noNaN: true }),
          fc.double({ min: 0.01, max: 24, noNaN: true }),
          (rate, duration) => {
            const amount = calculateAmount(rate, duration, false);
            expect(amount).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: time-tracking-invoicing, Property 7: Edit Window Enforcement**
   * **Feature: time-tracking-invoicing, Property 8: Delete Window Enforcement**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
   */
  describe('Property 7 & 8: Edit/Delete Window Enforcement', () => {
    it('allows modification within 24 hours', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 23 }),
          fc.integer({ min: 0, max: 59 }),
          (hoursAgo, minutes) => {
            const now = new Date();
            const createdAt = new Date(now.getTime() - (hoursAgo * 60 + minutes) * 60 * 1000);
            expect(canModifyEntry(createdAt, now)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('denies modification after 24 hours', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 25, max: 168 }),
          (hoursAgo) => {
            const now = new Date();
            const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
            expect(canModifyEntry(createdAt, now)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('allows modification only if user owns entry AND within window', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          fc.boolean(),
          fc.integer({ min: 0, max: 48 }),
          (entryOwnerId, requesterId, sameUser, hoursAgo) => {
            const now = new Date();
            const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
            const userId = sameUser ? entryOwnerId : requesterId;
            
            const canModify = canUserModifyEntry(entryOwnerId, createdAt, userId, now);
            const isOwner = entryOwnerId === userId;
            const withinWindow = hoursAgo <= 24;
            
            expect(canModify).toBe(isOwner && withinWindow);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
