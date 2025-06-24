import { adminService } from '@repo/shared/services';
import { toAdminResponseDto } from '@repo/shared/transformers';
import { createApiResponse, parseApiRequest, withApiHandler } from '@/libs/api-utils';
import { createValidationError, createSystemError, createAuthError } from '@/libs/errors';
import type { ApiResponse } from '@/types/api';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// JWT 토큰 생성 함수
async function generateToken(adminPayload: object): Promise<string> {
  const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'fallback-secret');
  // The payload must be a plain object.
  const plainPayload = JSON.parse(JSON.stringify(adminPayload));
  return await new SignJWT(plainPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);
}

export const POST = withApiHandler(async (request: Request): Promise<ApiResponse> => {
  const { body } = await parseApiRequest<{ username: string; password: string }>(request);
  const { username, password } = body;

  if (!username || !password) {
    throw createValidationError('MISSING_REQUIRED', 'Username and password are required');
  }

  try {
    const admin = await adminService.login(username, password);

    if (!admin) {
      throw createAuthError('INVALID_CREDENTIALS', 'Invalid username or password');
    }

    const adminDto = toAdminResponseDto(admin);
    const token = await generateToken(adminDto);

    // Set the cookie for browser-based navigation (the real app)
    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    return {
      success: true,
      data: {
        token,
        admin: adminDto,
      }
    };
  } catch (error) {
    console.error('Admin login error:', error);
    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      throw createAuthError('INVALID_CREDENTIALS', 'Invalid username or password');
    }
    throw createSystemError('INTERNAL_ERROR', 'Failed to process login');
  }
});