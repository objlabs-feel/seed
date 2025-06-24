import { adminService } from '@repo/shared/services';
import { toAdminResponseDto } from '@repo/shared/transformers';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { jwtVerify } from 'jose';

export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<{ token: string }>(request);
  const { token } = body;

  if (!token) {
    throw createValidationError('MISSING_REQUIRED', 'Token is required');
  }

  try {
    // JWT 토큰 검증
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'fallback-secret')
    );

    const { adminId } = payload as { adminId: string };

    // 관리자 존재 여부 확인
    const admin = await adminService.findById(adminId);

    if (!admin) {
      throw createAuthError('INVALID_TOKEN', 'Invalid token or admin not found');
    }

    const adminDto = toAdminResponseDto(admin);

    return {
      success: true,
      data: {
        admin: adminDto
      }
    };
  } catch (error) {
    console.error('Token verification error:', error);
    if (error instanceof Error && error.message.includes('JWT')) {
      throw createAuthError('INVALID_TOKEN', 'Invalid or expired token');
    }
    throw createSystemError('INTERNAL_ERROR', 'Failed to verify token');
  }
});