// 에러 코드 타입
export const ErrorCodes = {
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    TOKEN_EXPIRED: 'AUTH_002',
    INVALID_TOKEN: 'AUTH_003',
    UNAUTHORIZED: 'AUTH_004',
  },
  VALIDATION: {
    INVALID_INPUT: 'VAL_001',
    MISSING_REQUIRED: 'VAL_002',
    INVALID_FORMAT: 'VAL_003',
  },
  SYSTEM: {
    INTERNAL_ERROR: 'SYS_001',
    SERVICE_UNAVAILABLE: 'SYS_002',
    DATABASE_ERROR: 'SYS_003',
  },
  BUSINESS: {
    NOT_FOUND: 'BUS_001',
    ALREADY_EXISTS: 'BUS_002',
    INVALID_STATE: 'BUS_003',
  },
} as const;

// 에러 코드 타입
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes][keyof typeof ErrorCodes[keyof typeof ErrorCodes]];

// API 에러 클래스
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
    };
  }
}

// 에러 생성 유틸리티 함수들
export const createAuthError = (code: keyof typeof ErrorCodes.AUTH, message: string) => {
  return new ApiError(ErrorCodes.AUTH[code] as ErrorCode, message, 401);
};

export const createValidationError = (code: keyof typeof ErrorCodes.VALIDATION, message: string) => {
  return new ApiError(ErrorCodes.VALIDATION[code] as ErrorCode, message, 400);
};

export const createSystemError = (code: keyof typeof ErrorCodes.SYSTEM, message: string) => {
  return new ApiError(ErrorCodes.SYSTEM[code] as ErrorCode, message, 500);
};

export const createBusinessError = (code: keyof typeof ErrorCodes.BUSINESS, message: string) => {
  return new ApiError(ErrorCodes.BUSINESS[code] as ErrorCode, message, 400);
}; 