/**
 * Audit Log Service
 * Handles creating and querying audit log entries for system changes
 */

export type AuditAction = 'create' | 'update' | 'delete';
export type EntityType = 'time_entry' | 'client' | 'rate' | 'service' | 'user' | 'invoice';

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  timestamp: Date;
}

export interface CreateAuditLogEntry {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  userId?: string;
  actionType?: AuditAction;
  entityType?: EntityType;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Creates an audit log entry with all required fields
 * Property 20: Audit Log Completeness - ensures all required fields are captured
 */
export function createAuditLogEntry(
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


/**
 * Validates that an audit log entry has all required fields
 * Property 20: Audit Log Completeness
 */
export function isValidAuditLogEntry(entry: AuditLogEntry): boolean {
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

/**
 * Filters audit log entries based on provided criteria
 * Property 21: Audit Log Filtering - all returned entries satisfy all filter criteria
 */
export function filterAuditLogs(
  entries: AuditLogEntry[],
  filters: AuditLogFilters
): AuditLogEntry[] {
  return entries.filter((entry) => {
    // Filter by userId
    if (filters.userId !== undefined && entry.userId !== filters.userId) {
      return false;
    }

    // Filter by action type
    if (filters.actionType !== undefined && entry.action !== filters.actionType) {
      return false;
    }

    // Filter by entity type
    if (filters.entityType !== undefined && entry.entityType !== filters.entityType) {
      return false;
    }

    // Filter by date range (startDate)
    if (filters.startDate !== undefined && entry.timestamp < filters.startDate) {
      return false;
    }

    // Filter by date range (endDate)
    if (filters.endDate !== undefined && entry.timestamp > filters.endDate) {
      return false;
    }

    return true;
  });
}

/**
 * Determines what values changed between old and new state
 * Useful for update operations
 */
export function getChangedValues(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): { oldValues: Record<string, unknown>; newValues: Record<string, unknown> } {
  const changedOld: Record<string, unknown> = {};
  const changedNew: Record<string, unknown> = {};

  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  for (const key of allKeys) {
    if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
      changedOld[key] = oldValues[key];
      changedNew[key] = newValues[key];
    }
  }

  return { oldValues: changedOld, newValues: changedNew };
}
