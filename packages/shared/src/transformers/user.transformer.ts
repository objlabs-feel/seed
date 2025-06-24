import type { User, Profile } from '../types/models';
import type {
  UserResponseDto,
  UserListDto,
  ProfileResponseDto,
  ProfileListDto
} from '../types/dto';
import { bigintToString, dateToString, transformIfExists } from './common.transformer';
import { toCompanyResponseDto } from './company.transformer';

/**
 * Profile 모델을 ProfileResponseDto로 변환
 */
export function toProfileResponseDto(profile: Profile): ProfileResponseDto {
  return {
    id: bigintToString(profile.id)!,
    created_at: dateToString(profile.created_at),
    updated_at: dateToString(profile.updated_at),
    status: profile.status,
    company_id: bigintToString(profile.company_id),
    profile_type: profile.profile_type,
    name: profile.name,
    mobile: profile.mobile,
    email: profile.email,
    company: profile.company ? toCompanyResponseDto(profile.company) : null,
  };
}

/**
 * Profile 모델을 ProfileListDto로 변환
 */
export function toProfileListDto(profile: Profile): ProfileListDto {
  return {
    id: bigintToString(profile.id)!,
    company_id: bigintToString(profile.company_id),
    profile_type: profile.profile_type,
    name: profile.name,
    mobile: profile.mobile,
    email: profile.email,
    status: profile.status ?? 1,
    created_at: dateToString(profile.created_at),
    updated_at: dateToString(profile.updated_at),
    user_id: bigintToString(profile.user?.id) || '',
    company: profile.company ? toCompanyResponseDto(profile.company) : null,
  };
}

/**
 * User 모델을 UserResponseDto로 변환
 */
export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: bigintToString(user.id)!,
    created_at: dateToString(user.created_at),
    updated_at: dateToString(user.updated_at),
    status: user.status,
    device_token: user.device_token,
    profile_id: bigintToString(user.profile_id),
    profile: transformIfExists(user.profile, toProfileResponseDto),
  };
}

/**
 * User 모델을 UserListDto로 변환
 */
export function toUserListDto(user: User): UserListDto {
  return {
    id: bigintToString(user.id)!,
    device_token: user.device_token,
    profile_id: bigintToString(user.profile_id),
    status: user.status ?? 1,
    created_at: dateToString(user.created_at),
    updated_at: dateToString(user.updated_at),
    email: user.profile?.email || '',
    profile: user.profile ? toProfileListDto(user.profile) : null,
  };
}

/**
 * User 배열을 UserListDto 배열로 변환
 */
export function toUserListDtoArray(users: User[]): UserListDto[] {
  return users.map(toUserListDto);
}

/**
 * Profile 배열을 ProfileListDto 배열로 변환
 */
export function toProfileListDtoArray(profiles: Profile[]): ProfileListDto[] {
  return profiles.map(toProfileListDto);
} 