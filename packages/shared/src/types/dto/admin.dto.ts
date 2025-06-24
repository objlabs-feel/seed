import { BaseRequestDto, BaseResponseDto, SearchRequestDto, BaseDto } from './common.dto';

/**
 * 관리자 생성 요청 DTO
 */
export interface CreateAdminRequestDto extends BaseRequestDto {
  username: string;
  password: string;
  email: string;
  level: number;
}

/**
 * 관리자 업데이트 요청 DTO
 */
export interface UpdateAdminRequestDto extends BaseRequestDto {
  username?: string;
  password?: string;
  email?: string;
  level?: number;
  status?: number;
}

/**
 * 관리자 로그인 요청 DTO
 */
export interface AdminLoginRequestDto {
  username: string;
  password: string;
}

/**
 * 관리자 응답 DTO
 */
export interface AdminResponseDto extends BaseResponseDto {
  username: string;
  level: number;
}

/**
 * 관리자 목록 응답 DTO (비밀번호 제외)
 */
export interface AdminListDto extends BaseDto {
  id: number;
  username: string;
  level: number;
}

/**
 * 관리자 로그인 응답 DTO
 */
export interface AdminLoginResponseDto {
  admin: AdminResponseDto;
  token?: string;
}

/**
 * 관리자 검색 요청 DTO
 */
export interface AdminSearchRequestDto extends SearchRequestDto {
  username?: string;
  email?: string;
  level?: number;
  status?: number;
  page?: number;
  limit?: number;
}

/**
 * 시스템 환경 변수 생성 요청 DTO
 */
export interface CreateSystemEnvironmentRequestDto extends BaseRequestDto {
  parameters: object;
}

/**
 * 시스템 환경 변수 업데이트 요청 DTO
 */
export interface UpdateSystemEnvironmentRequestDto extends BaseRequestDto {
  parameters?: object;
}

export interface AdminDto extends BaseDto {
  username: string;
  email: string;
  level: number;
} 