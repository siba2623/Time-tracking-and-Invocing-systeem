/**
 * Time Entry Service
 * Validates: Requirements 1.1-1.8, 3.1-3.4
 */

/**
 * Calculate amount for a time entry
 * When billable is true: amount = rate × duration
 * When billable is false: amount = 0
 * Validates: Requirements 1.6, 1.7
 */
export function calculateAmount(rate: number, duration: number, billable: boolean): number {
  if (!billable) {
    return 0;
  }
  return Math.round(rate * duration * 100) / 100; // Round to 2 decimal places
}

/**
 * Check if a time entry can be modified (within 24-hour window)
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
export function canModifyEntry(
  entryCreatedAt: Date,
  currentTime: Date = new Date()
): boolean {
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const timeDiff = currentTime.getTime() - entryCreatedAt.getTime();
  return timeDiff <= twentyFourHoursMs;
}

/**
 * Check if user owns the entry
 */
export function isEntryOwner(entryEmployeeId: string, userId: string): boolean {
  return entryEmployeeId === userId;
}

/**
 * Check if entry can be modified by user (owns entry AND within window)
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
export function canUserModifyEntry(
  entryEmployeeId: string,
  entryCreatedAt: Date,
  userId: string,
  currentTime: Date = new Date()
): boolean {
  return isEntryOwner(entryEmployeeId, userId) && canModifyEntry(entryCreatedAt, currentTime);
}


import { mockDb } from '../lib/mock-db.js';
import { ApiError } from '../types/errors.js';
import {
  validateRate,
  validateDuration,
  validateActivityDate,
} from '../validators/index.js';

export interface CreateTimeEntryInput {
  clientId: string;
  serviceId: string;
  activityDate: Date;
  memo?: string;
  rate: number;
  duration: number;
  billable: boolean;
}

export interface UpdateTimeEntryInput {
  clientId?: string;
  serviceId?: string;
  activityDate?: Date;
  memo?: string;
  rate?: number;
  duration?: number;
  billable?: boolean;
}

export interface TimeEntryFilters {
  employeeId?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  billable?: boolean;
}

/**
 * Create a new time entry
 * Validates: Requirements 1.1-1.8
 */
export async function createTimeEntry(userId: string, input: CreateTimeEntryInput) {
  await mockDb.initialize();
  
  // Validate inputs
  const rateValidation = validateRate(input.rate);
  if (!rateValidation.valid) {
    throw ApiError.validation({ rate: [rateValidation.error!] });
  }

  const durationValidation = validateDuration(input.duration);
  if (!durationValidation.valid) {
    throw ApiError.validation({ duration: [durationValidation.error!] });
  }

  const dateValidation = validateActivityDate(input.activityDate);
  if (!dateValidation.valid) {
    throw ApiError.validation({ activityDate: [dateValidation.error!] });
  }

  const amount = calculateAmount(input.rate, input.duration, input.billable);

  const entry = mockDb.createTimeEntry({
    employeeId: userId,
    clientId: input.clientId,
    serviceId: input.serviceId,
    activityDate: input.activityDate,
    memo: input.memo,
    rate: input.rate,
    duration: input.duration,
    billable: input.billable,
    amount,
    status: 'pending',
  });

  return entry;
}


/**
 * Update a time entry (within 24-hour window)
 * Validates: Requirements 3.1, 3.2
 */
export async function updateTimeEntry(
  userId: string,
  entryId: string,
  input: UpdateTimeEntryInput
) {
  await mockDb.initialize();
  const entry = mockDb.findTimeEntryById(entryId);

  if (!entry) {
    throw ApiError.notFound('Time entry not found');
  }

  if (!canUserModifyEntry(entry.employeeId, entry.createdAt, userId)) {
    if (!isEntryOwner(entry.employeeId, userId)) {
      throw ApiError.forbidden('You can only modify your own entries');
    }
    throw ApiError.modificationWindowExpired();
  }

  // Validate inputs if provided
  if (input.rate !== undefined) {
    const rateValidation = validateRate(input.rate);
    if (!rateValidation.valid) {
      throw ApiError.validation({ rate: [rateValidation.error!] });
    }
  }

  if (input.duration !== undefined) {
    const durationValidation = validateDuration(input.duration);
    if (!durationValidation.valid) {
      throw ApiError.validation({ duration: [durationValidation.error!] });
    }
  }

  if (input.activityDate !== undefined) {
    const dateValidation = validateActivityDate(input.activityDate);
    if (!dateValidation.valid) {
      throw ApiError.validation({ activityDate: [dateValidation.error!] });
    }
  }

  // Recalculate amount if rate, duration, or billable changed
  const newRate = input.rate ?? Number(entry.rate);
  const newDuration = input.duration ?? Number(entry.duration);
  const newBillable = input.billable ?? entry.billable;
  const amount = calculateAmount(newRate, newDuration, newBillable);

  const updated = mockDb.updateTimeEntry(entryId, {
    ...input,
    amount,
  });

  return updated;
}

/**
 * Delete a time entry (within 24-hour window)
 * Validates: Requirements 3.3, 3.4
 */
export async function deleteTimeEntry(userId: string, entryId: string) {
  await mockDb.initialize();
  const entry = mockDb.findTimeEntryById(entryId);

  if (!entry) {
    throw ApiError.notFound('Time entry not found');
  }

  if (!canUserModifyEntry(entry.employeeId, entry.createdAt, userId)) {
    if (!isEntryOwner(entry.employeeId, userId)) {
      throw ApiError.forbidden('You can only delete your own entries');
    }
    throw ApiError.modificationWindowExpired();
  }

  mockDb.deleteTimeEntry(entryId);
}

/**
 * Get time entries for a user with filters
 * Validates: Requirements 2.1-2.4
 */
export async function getTimeEntriesForUser(userId: string, filters: TimeEntryFilters = {}) {
  await mockDb.initialize();
  return mockDb.getTimeEntriesForUser(userId, filters);
}

/**
 * Get all time entries (admin)
 * Validates: Requirements 5.1, 5.2
 */
export async function getAllTimeEntries(filters: TimeEntryFilters = {}) {
  await mockDb.initialize();
  return mockDb.getAllTimeEntries(filters);
}
