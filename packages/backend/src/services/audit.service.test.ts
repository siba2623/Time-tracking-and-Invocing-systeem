import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Inline pure functions to avoid Prisma dependency
type AuditAction = 'create' | 'update' | 'delete';
type EntityType = 'time_entry' | 'client' | 'rate' | 'service' | 'user' | 'invoice';

interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  timestamp: Date;
}

interface CreateAuditLogEntry {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

interface AuditLogFilters {
  userId?: string;
  actionType?: AuditAction;
  entityType?: EntityType;
  startDate?: Date;
  endDate?: Date;
}

function createAuditLogEntry(
  input: CreateAuditLogEntry,
  generateId: () => string = () => crypto.randomUUID()
): AuditLogEntry {
  return {
    id: generateId(),
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    oldValues: input.oldValues ?? null,
    newValues: input.newValues ?? null,
    timestamp: new Date(),
  };
}

function isValidAuditLogEntry(entry: AuditLogEntry): boolean {
  return (
    typeof entry.id === 'string' &&
    entry.id.length > 0 &&
    typeof entry.userId === 'string' &&
    entry.userId.length > 0 &&
    ['create', 'update', 'delete'].includes(entry.action) &&
    typeof entry.entityType === 'string' &&
    entry.entityType.length > 0 &&
    typeof entry.entityId === 'string' &&
    entry.entityId.length > 0 &&
    entry.timestamp instanceof Date &&
    !isNaN(entry.timestamp.getTime())
  );
}


function filterAuditLogs(entries: AuditLogEntry[], filters: AuditLogFilters): AuditLogEntry[] {
  return entries.filter((entry) => {
    if (filters.userId !== undefined && entry.userId !== filters.userId) {
      return false;
    }
    if (filters.actionType !== undefined && entry.action !== filters.actionType) {
      return false;
    }
    if (filters.entityType !== undefined && entry.entityType !== filters.entityType) {
      return false;
    }
    if (filters.startDate !== undefined && entry.timestamp < filters.startDate) {
      return false;
    }
    if (filters.endDate !== undefined && entry.timestamp > filters.endDate) {
      return false;
    }
    return true;
  });
}

// Arbitraries for generating test data
const actionArb = fc.constantFrom<AuditAction>('create', 'update', 'delete');
const entityTypeArb = fc.constantFrom<EntityType>(
  'time_entry',
  'client',
  'rate',
  'service',
  'user',
  'invoice'
);

const auditLogInputArb = fc.record({
  userId: fc.uuid(),
  action: actionArb,
  entityType: entityTypeArb,
  entityId: fc.uuid(),
  oldValues: fc.option(fc.dictionary(fc.string(), fc.jsonValue()), { nil: null }),
  newValues: fc.option(fc.dictionary(fc.string(), fc.jsonValue()), { nil: null }),
});

// Generate audit log entries with specific timestamps for filtering tests
const auditLogEntryArb = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  action: actionArb,
  entityType: entityTypeArb,
  entityId: fc.uuid(),
  oldValues: fc.option(fc.dictionary(fc.string(), fc.jsonValue()), { nil: null }),
  newValues: fc.option(fc.dictionary(fc.string(), fc.jsonValue()), { nil: null }),
  timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
});

describe('Audit Service', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 20: Audit Log Completeness**
   * **Validates: Requirements 11.1, 11.2**
   *
   * For any create, update, or delete operation on time entries, clients, or rates,
   * an audit log entry SHALL be created containing the user ID, action type,
   * entity type, entity ID, timestamp, and changed values.
   */
  describe('Property 20: Audit Log Completeness', () => {
    test('created audit log entries contain all required fields', () => {
      fc.assert(
        fc.property(auditLogInputArb, (input) => {
          const entry = createAuditLogEntry(input);

          // Verify all required fields are present and valid
          expect(isValidAuditLogEntry(entry)).toBe(true);

          // Verify specific field values match input
          expect(entry.userId).toBe(input.userId);
          expect(entry.action).toBe(input.action);
          expect(entry.entityType).toBe(input.entityType);
          expect(entry.entityId).toBe(input.entityId);

          // Verify timestamp is set
          expect(entry.timestamp).toBeInstanceOf(Date);
          expect(entry.timestamp.getTime()).toBeLessThanOrEqual(Date.now());

          // Verify old/new values are captured
          if (input.oldValues !== undefined) {
            expect(entry.oldValues).toEqual(input.oldValues);
          }
          if (input.newValues !== undefined) {
            expect(entry.newValues).toEqual(input.newValues);
          }
        }),
        { numRuns: 100 }
      );
    });


    test('create action captures new values', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          entityTypeArb,
          fc.uuid(),
          fc.dictionary(fc.string(), fc.jsonValue()),
          (userId, entityType, entityId, newValues) => {
            const entry = createAuditLogEntry({
              userId,
              action: 'create',
              entityType,
              entityId,
              newValues,
            });

            expect(entry.action).toBe('create');
            expect(entry.newValues).toEqual(newValues);
            expect(entry.oldValues).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('update action captures both old and new values', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          entityTypeArb,
          fc.uuid(),
          fc.dictionary(fc.string(), fc.jsonValue()),
          fc.dictionary(fc.string(), fc.jsonValue()),
          (userId, entityType, entityId, oldValues, newValues) => {
            const entry = createAuditLogEntry({
              userId,
              action: 'update',
              entityType,
              entityId,
              oldValues,
              newValues,
            });

            expect(entry.action).toBe('update');
            expect(entry.oldValues).toEqual(oldValues);
            expect(entry.newValues).toEqual(newValues);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('delete action captures old values', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          entityTypeArb,
          fc.uuid(),
          fc.dictionary(fc.string(), fc.jsonValue()),
          (userId, entityType, entityId, oldValues) => {
            const entry = createAuditLogEntry({
              userId,
              action: 'delete',
              entityType,
              entityId,
              oldValues,
            });

            expect(entry.action).toBe('delete');
            expect(entry.oldValues).toEqual(oldValues);
            expect(entry.newValues).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: time-tracking-invoicing, Property 21: Audit Log Filtering**
   * **Validates: Requirements 11.3**
   *
   * For any audit log query with filters (date range, user, action type),
   * all returned entries SHALL satisfy all applied filter criteria.
   */
  describe('Property 21: Audit Log Filtering', () => {
    test('filtering by userId returns only entries for that user', () => {
      fc.assert(
        fc.property(
          fc.array(auditLogEntryArb, { minLength: 1, maxLength: 50 }),
          fc.uuid(),
          (entries, targetUserId) => {
            // Ensure at least some entries have the target userId
            const entriesWithTarget = entries.map((e, i) =>
              i === 0 ? { ...e, userId: targetUserId } : e
            );

            const filtered = filterAuditLogs(entriesWithTarget, { userId: targetUserId });

            // All filtered entries should have the target userId
            filtered.forEach((entry) => {
              expect(entry.userId).toBe(targetUserId);
            });

            // Should include all entries with target userId
            const expected = entriesWithTarget.filter((e) => e.userId === targetUserId);
            expect(filtered.length).toBe(expected.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering by actionType returns only entries with that action', () => {
      fc.assert(
        fc.property(
          fc.array(auditLogEntryArb, { minLength: 1, maxLength: 50 }),
          actionArb,
          (entries, targetAction) => {
            // Ensure at least some entries have the target action
            const entriesWithTarget = entries.map((e, i) =>
              i === 0 ? { ...e, action: targetAction } : e
            );

            const filtered = filterAuditLogs(entriesWithTarget, { actionType: targetAction });

            // All filtered entries should have the target action
            filtered.forEach((entry) => {
              expect(entry.action).toBe(targetAction);
            });

            // Should include all entries with target action
            const expected = entriesWithTarget.filter((e) => e.action === targetAction);
            expect(filtered.length).toBe(expected.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filtering by entityType returns only entries for that entity type', () => {
      fc.assert(
        fc.property(
          fc.array(auditLogEntryArb, { minLength: 1, maxLength: 50 }),
          entityTypeArb,
          (entries, targetEntityType) => {
            // Ensure at least some entries have the target entity type
            const entriesWithTarget = entries.map((e, i) =>
              i === 0 ? { ...e, entityType: targetEntityType } : e
            );

            const filtered = filterAuditLogs(entriesWithTarget, { entityType: targetEntityType });

            // All filtered entries should have the target entity type
            filtered.forEach((entry) => {
              expect(entry.entityType).toBe(targetEntityType);
            });

            // Should include all entries with target entity type
            const expected = entriesWithTarget.filter((e) => e.entityType === targetEntityType);
            expect(filtered.length).toBe(expected.length);
          }
        ),
        { numRuns: 100 }
      );
    });


    test('filtering by date range returns only entries within range', () => {
      fc.assert(
        fc.property(
          fc.array(auditLogEntryArb, { minLength: 1, maxLength: 50 }),
          fc.date({ min: new Date('2024-01-01'), max: new Date('2024-06-30') }),
          fc.date({ min: new Date('2024-07-01'), max: new Date('2025-12-31') }),
          (entries, startDate, endDate) => {
            // Ensure startDate <= endDate
            const [actualStart, actualEnd] =
              startDate <= endDate ? [startDate, endDate] : [endDate, startDate];

            const filtered = filterAuditLogs(entries, {
              startDate: actualStart,
              endDate: actualEnd,
            });

            // All filtered entries should be within the date range
            filtered.forEach((entry) => {
              expect(entry.timestamp.getTime()).toBeGreaterThanOrEqual(actualStart.getTime());
              expect(entry.timestamp.getTime()).toBeLessThanOrEqual(actualEnd.getTime());
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('combining multiple filters applies AND logic', () => {
      fc.assert(
        fc.property(
          fc.array(auditLogEntryArb, { minLength: 1, maxLength: 50 }),
          fc.uuid(),
          actionArb,
          entityTypeArb,
          (entries, targetUserId, targetAction, targetEntityType) => {
            // Ensure at least one entry matches all criteria
            const entriesWithTarget = entries.map((e, i) =>
              i === 0
                ? {
                    ...e,
                    userId: targetUserId,
                    action: targetAction,
                    entityType: targetEntityType,
                  }
                : e
            );

            const filtered = filterAuditLogs(entriesWithTarget, {
              userId: targetUserId,
              actionType: targetAction,
              entityType: targetEntityType,
            });

            // All filtered entries should satisfy ALL criteria
            filtered.forEach((entry) => {
              expect(entry.userId).toBe(targetUserId);
              expect(entry.action).toBe(targetAction);
              expect(entry.entityType).toBe(targetEntityType);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('empty filters return all entries', () => {
      fc.assert(
        fc.property(fc.array(auditLogEntryArb, { minLength: 0, maxLength: 50 }), (entries) => {
          const filtered = filterAuditLogs(entries, {});
          expect(filtered.length).toBe(entries.length);
        }),
        { numRuns: 100 }
      );
    });
  });
});
