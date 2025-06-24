import type { Admin } from '../types/models';
import type {
  AdminResponseDto,
  AdminListDto,
  AdminLoginResponseDto
} from '../types/dto';
import { transformBaseFields, omitSensitiveFields, dateToString } from './common.transformer';

/**
 * Admin 모델을 AdminResponseDto로 변환 (비밀번호 제외)
 */
export function toAdminResponseDto(admin: Admin): AdminResponseDto {
  return {
    id: Number(admin.id).toString(),
    created_at: dateToString(admin.created_at),
    updated_at: null, // Admin 모델에는 updated_at 필드가 없음
    status: admin.status,
    username: admin.username,
    level: admin.level,
  };
}

/**
 * Admin 모델을 AdminListDto로 변환
 */
export function toAdminListDto(admin: Admin): AdminListDto {
  return {
    id: Number(admin.id),
    username: admin.username,
    level: admin.level,
    created_at: dateToString(admin.created_at),
    updated_at: dateToString(admin.updated_at),
    status: admin.status,
  };
}

/**
 * Admin 모델을 AdminLoginResponseDto로 변환
 */
export function toAdminLoginResponseDto(
  admin: Admin,
  token?: string
): AdminLoginResponseDto {
  return {
    admin: toAdminResponseDto(admin),
    token,
  };
}

/**
 * Admin 배열을 AdminListDto 배열로 변환
 */
export function toAdminListDtoArray(admins: Admin[]): AdminListDto[] {
  return admins.map(toAdminListDto);
}

/**
 * Admin 모델에서 민감한 정보 제거
 */
export function sanitizeAdmin(admin: Admin): Omit<Admin, 'password'> {
  return omitSensitiveFields(admin, 'password');
} 