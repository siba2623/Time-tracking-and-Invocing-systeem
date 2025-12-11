export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  AUTHORIZATION_DENIED = 'AUTHORIZATION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  MODIFICATION_WINDOW_EXPIRED = 'MODIFICATION_WINDOW_EXPIRED',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static validation(details: Record<string, string[]>) {
    return new ApiError(
      ErrorCode.VALIDATION_ERROR,
      'Invalid input data',
      400,
      details
    );
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(ErrorCode.AUTHENTICATION_REQUIRED, message, 401);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(ErrorCode.AUTHORIZATION_DENIED, message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(ErrorCode.RESOURCE_NOT_FOUND, message, 404);
  }

  static modificationWindowExpired() {
    return new ApiError(
      ErrorCode.MODIFICATION_WINDOW_EXPIRED,
      'Time entry can no longer be modified. Edit window (24 hours) has expired.',
      400
    );
  }
}
