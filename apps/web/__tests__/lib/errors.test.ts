import { ApiError, createAuthError, createValidationError, createSystemError, createBusinessError } from '@/libs/errors';

describe('Error Utils', () => {
  describe('ApiError', () => {
    it('should create an API error with default status', () => {
      const error = new ApiError('SYS_001', 'Internal server error');
      expect(error.code).toBe('SYS_001');
      expect(error.message).toBe('Internal server error');
      expect(error.status).toBe(500);
    });

    it('should create an API error with custom status', () => {
      const error = new ApiError('AUTH_001', 'Invalid credentials', 401);
      expect(error.code).toBe('AUTH_001');
      expect(error.message).toBe('Invalid credentials');
      expect(error.status).toBe(401);
    });

    it('should convert error to JSON', () => {
      const error = new ApiError('SYS_001', 'Internal server error', 500);
      const json = error.toJSON();
      expect(json).toEqual({
        code: 'SYS_001',
        message: 'Internal server error',
        status: 500,
      });
    });
  });

  describe('createAuthError', () => {
    it('should create an auth error', () => {
      const error = createAuthError('UNAUTHORIZED', 'Authentication failed');
      expect(error).toBeInstanceOf(ApiError);
      expect(error.code).toBe('AUTH_004');
      expect(error.message).toBe('Authentication failed');
      expect(error.status).toBe(401);
    });
  });

  describe('createValidationError', () => {
    it('should create a validation error', () => {
      const error = createValidationError('INVALID_INPUT', 'Invalid input data');
      expect(error).toBeInstanceOf(ApiError);
      expect(error.code).toBe('VAL_001');
      expect(error.message).toBe('Invalid input data');
      expect(error.status).toBe(400);
    });
  });

  describe('createSystemError', () => {
    it('should create a system error', () => {
      const error = createSystemError('INTERNAL_ERROR', 'Internal server error');
      expect(error).toBeInstanceOf(ApiError);
      expect(error.code).toBe('SYS_001');
      expect(error.message).toBe('Internal server error');
      expect(error.status).toBe(500);
    });
  });

  describe('createBusinessError', () => {
    it('should create a business error', () => {
      const error = createBusinessError('NOT_FOUND', 'Resource not found');
      expect(error).toBeInstanceOf(ApiError);
      expect(error.code).toBe('BUS_001');
      expect(error.message).toBe('Resource not found');
      expect(error.status).toBe(400);
    });
  });
}); 