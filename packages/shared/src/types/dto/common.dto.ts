/**
 * 공통 DTO 타입 정의
 */

/**
 * 기본 응답 DTO
 */
export interface BaseResponseDto {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  status: number | null;
}

/**
 * 기본 요청 DTO
 */
export interface BaseRequestDto {
  status?: number;
}

/**
 * 페이지네이션 요청 DTO
 */
export interface PaginationRequestDto {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 페이지네이션 응답 DTO
 */
export interface PaginationResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 정렬 키 업데이트 DTO
 */
export interface SortKeyUpdateDto {
  id: string;
  sort_key: number;
}

/**
 * 상태 업데이트 DTO
 */
export interface StatusUpdateDto {
  id: string;
  status: number;
}

/**
 * 검색 요청 DTO
 */
export interface SearchRequestDto extends PaginationRequestDto {
  keyword?: string;
  status?: number;
}

export interface BaseDto {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  status: number | null;
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponseDto<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    pagination?: PaginationDto;
  };
}

export interface SearchResponseDto<T> {
  items: T[];
  metadata: {
    pagination: PaginationDto;
  };
}

export interface ErrorResponseDto {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface SuccessResponseDto<T> {
  success: true;
  data: T;
  metadata?: {
    pagination?: PaginationDto;
  };
}

export type ApiResponse<T> = SuccessResponseDto<T> | ErrorResponseDto; 