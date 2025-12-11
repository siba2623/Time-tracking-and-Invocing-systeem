/**
 * Validation utility functions for time tracking system
 * Validates: Requirements 1.2, 1.5, 7.2, 14.1, 14.2, 14.3
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates rate input - must be a positive numeric value
 * Validates: Requirements 14.1
 */
export function validateRate(rate: unknown): ValidationResult {
  if (typeof rate !== 'number' || isNaN(rate)) {
    return { valid: false, error: 'Rate must be a numeric value' };
  }
  if (rate <= 0) {
    return { valid: false, error: 'Rate must be a positive number' };
  }
  return { valid: true };
}

/**
 * Validates duration input - must be positive and not exceed 24 hours
 * Validates: Requirements 1.5, 14.2
 */
export function validateDuration(duration: unknown): ValidationResult {
  if (typeof duration !== 'number' || isNaN(duration)) {
    return { valid: false, error: 'Duration must be a numeric value' };
  }
  if (duration <= 0) {
    return { valid: false, error: 'Duration must be a positive number' };
  }
  if (duration > 24) {
    return { valid: false, error: 'Duration cannot exceed 24 hours' };
  }
  return { valid: true };
}

/**
 * Validates date input - must be a valid date not more than 30 days in the past
 * Validates: Requirements 1.2, 14.3
 */
export function validateActivityDate(
  date: unknown,
  referenceDate: Date = new Date()
): ValidationResult {
  if (!(date instanceof Date) && typeof date !== 'string') {
    return { valid: false, error: 'Date must be a valid date value' };
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Date must be a valid calendar date' };
  }

  // Calculate 30 days ago from reference date (start of day)
  const thirtyDaysAgo = new Date(referenceDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Normalize the input date to start of day for comparison
  const normalizedDate = new Date(dateObj);
  normalizedDate.setHours(0, 0, 0, 0);

  if (normalizedDate < thirtyDaysAgo) {
    return { valid: false, error: 'Date cannot be more than 30 days in the past' };
  }

  // Don't allow future dates
  const today = new Date(referenceDate);
  today.setHours(23, 59, 59, 999);

  if (normalizedDate > today) {
    return { valid: false, error: 'Date cannot be in the future' };
  }

  return { valid: true };
}

/**
 * Validates allocation percentage - must be between 0 and 100 inclusive
 * Validates: Requirements 7.2
 */
export function validateAllocationPercentage(percentage: unknown): ValidationResult {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return { valid: false, error: 'Allocation percentage must be a numeric value' };
  }
  if (percentage < 0 || percentage > 100) {
    return { valid: false, error: 'Allocation percentage must be between 0 and 100' };
  }
  return { valid: true };
}


/**
 * Form validation error aggregator
 * Validates: Requirements 14.4
 */
export interface FormValidationErrors {
  [field: string]: string[];
}

export interface FormValidationResult {
  valid: boolean;
  errors: FormValidationErrors;
}

/**
 * Aggregates validation errors from multiple field validations
 * Returns field-specific error messages for each invalid field
 * Validates: Requirements 14.4
 */
export function aggregateValidationErrors(
  validations: { field: string; result: ValidationResult }[]
): FormValidationResult {
  const errors: FormValidationErrors = {};
  let valid = true;

  for (const { field, result } of validations) {
    if (!result.valid && result.error) {
      valid = false;
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(result.error);
    }
  }

  return { valid, errors };
}

/**
 * Validates a time entry form and returns field-specific errors
 * Validates: Requirements 14.4
 */
export function validateTimeEntryForm(data: {
  rate?: unknown;
  duration?: unknown;
  activityDate?: unknown;
}): FormValidationResult {
  const validations: { field: string; result: ValidationResult }[] = [];

  if (data.rate !== undefined) {
    validations.push({ field: 'rate', result: validateRate(data.rate) });
  }

  if (data.duration !== undefined) {
    validations.push({ field: 'duration', result: validateDuration(data.duration) });
  }

  if (data.activityDate !== undefined) {
    validations.push({ field: 'activityDate', result: validateActivityDate(data.activityDate) });
  }

  return aggregateValidationErrors(validations);
}

/**
 * Generates field-specific error messages for display
 * Validates: Requirements 14.4
 */
export function generateFieldErrorMessages(errors: FormValidationErrors): string[] {
  const messages: string[] = [];
  
  for (const [field, fieldErrors] of Object.entries(errors)) {
    for (const error of fieldErrors) {
      messages.push(`${field}: ${error}`);
    }
  }
  
  return messages;
}
