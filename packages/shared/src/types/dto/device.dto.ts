import { BaseRequestDto, BaseResponseDto, SearchRequestDto } from './common.dto';

/**
 * 기기 타입 생성 요청 DTO
 */
export interface CreateDeviceTypeRequestDto extends BaseRequestDto {
  code?: string;
  name: string;
  description?: string;
  img?: string;
  sort_key: number;
}

/**
 * 기기 타입 업데이트 요청 DTO
 */
export interface UpdateDeviceTypeRequestDto extends BaseRequestDto {
  code?: string;
  name?: string;
  description?: string;
  img?: string;
  sort_key?: number;
}

/**
 * 기기 타입 응답 DTO
 */
export interface DeviceTypeResponseDto extends BaseResponseDto {
  code?: string | null;
  name: string;
  description?: string | null;
  img?: string | null;
  sort_key: number;
}

/**
 * 기기 타입 목록 DTO
 */
export interface DeviceTypeListDto {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  img?: string | null;
  sort_key: number;
  status: number;
}

/**
 * 부서 생성 요청 DTO
 */
export interface CreateDepartmentRequestDto extends BaseRequestDto {
  code?: string;
  name?: string;
  img?: string;
  description?: string;
  sort_key: number;
}

/**
 * 부서 업데이트 요청 DTO
 */
export interface UpdateDepartmentRequestDto extends BaseRequestDto {
  code?: string;
  name?: string;
  img?: string;
  description?: string;
  sort_key?: number;
}

/**
 * 부서 응답 DTO
 */
export interface DepartmentResponseDto extends BaseResponseDto {
  code?: string | null;
  name?: string | null;
  img?: string | null;
  description?: string | null;
  sort_key: number;
}

/**
 * 부서 목록 DTO
 */
export interface DepartmentListDto {
  id: string;
  code?: string | null;
  name?: string | null;
  img?: string | null;
  description?: string | null;
  sort_key: number;
  status: number;
  deviceTypes?: DeviceTypeResponseDto[];
}

/**
 * 제조사 생성 요청 DTO
 */
export interface CreateManufacturerRequestDto extends BaseRequestDto {
  name?: string;
  device_types?: any;
  img?: string;
  description?: string;
}

/**
 * 제조사 업데이트 요청 DTO
 */
export interface UpdateManufacturerRequestDto extends BaseRequestDto {
  name?: string;
  device_types?: any;
  img?: string;
  description?: string;
}

/**
 * 제조사 응답 DTO
 */
export interface ManufacturerResponseDto extends BaseResponseDto {
  name?: string | null;
  device_types?: any | null;
  img?: string | null;
  description?: string | null;
}

/**
 * 제조사 목록 DTO
 */
export interface ManufacturerListDto {
  id: string;
  name?: string | null;
  device_types?: any | null;
  img?: string | null;
  description?: string | null;
  status: number;
}

/**
 * 기기 생성 요청 DTO
 */
export interface CreateDeviceRequestDto extends BaseRequestDto {
  manufacturer_id?: string;
  device_type?: number;
  media?: any;
  info?: any;
  version: number;
  description?: string;
}

/**
 * 기기 업데이트 요청 DTO
 */
export interface UpdateDeviceRequestDto extends Partial<CreateDeviceRequestDto> { }

/**
 * 기기 응답 DTO
 */
export interface DeviceResponseDto extends BaseResponseDto {
  manufacturer_id?: string | null;
  device_type?: number | null;
  media?: any | null;
  info?: any | null;
  version: number;
  description?: string | null;
  manufacturer?: ManufacturerResponseDto;
  deviceType?: DeviceTypeResponseDto;
}

/**
 * 기기 목록 DTO
 */
export interface DeviceListDto {
  id: string;
  manufacturer_id?: string | null;
  device_type?: number | null;
  version: number;
  description?: string | null;
  status: number;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * 중고 기기 생성 요청 DTO
 */
export interface CreateUsedDeviceRequestDto extends BaseRequestDto {
  company_id: string;
  department_id: number;
  device_type_id: number;
  manufacturer_id: number;
  manufacture_date?: string;
  images?: any;
  description?: string;
}

/**
 * 중고 기기 업데이트 요청 DTO
 */
export interface UpdateUsedDeviceRequestDto extends BaseRequestDto {
  company_id?: string;
  department_id?: number;
  device_type_id?: number;
  manufacturer_id?: number;
  manufacture_date?: string;
  images?: any;
  description?: string;
}

/**
 * 중고 기기 응답 DTO
 */
export interface UsedDeviceResponseDto extends BaseResponseDto {
  company_id?: string | null;
  department_id?: number | null;
  device_type_id?: number | null;
  manufacturer_id?: number | null;
  manufacture_date?: string | null;
  images?: any | null;
  description?: string | null;
  company?: {
    id: string;
    name?: string | null;
  };
  department?: DepartmentResponseDto;
  deviceType?: DeviceTypeResponseDto;
  manufacturer?: ManufacturerResponseDto;
}

/**
 * 중고 기기 목록 DTO
 */
export interface UsedDeviceListDto {
  id: string;
  company_id?: string | null;
  department_id?: number | null;
  device_type_id?: number | null;
  manufacturer_id?: number | null;
  manufacture_date?: string | null;
  description?: string | null;
  status: number;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * 부서-기기타입 연결 생성 요청 DTO
 */
export interface CreateDepartmentToDeviceTypeRequestDto {
  department_id: number;
  device_type_id: number;
  sort_key: number;
  status: number;
}

/**
 * 부서-기기타입 연결 업데이트 요청 DTO
 */
export interface UpdateDepartmentToDeviceTypeRequestDto {
  sort_key?: number;
  status?: number;
}

/**
 * 부서-기기타입 연결 응답 DTO
 */
export interface DepartmentToDeviceTypeResponseDto {
  department_id: number;
  device_type_id: number;
  sort_key: number;
  status: number;
  created_at: string;
  updated_at: string;
  department?: DepartmentResponseDto;
  deviceType?: DeviceTypeResponseDto;
}

/**
 * 기기 검색 요청 DTO
 */
export interface DeviceSearchRequestDto extends SearchRequestDto {
  manufacturer_id?: string;
  device_type?: number;
  version?: number;
}

/**
 * 중고 기기 검색 요청 DTO
 */
export interface UsedDeviceSearchRequestDto extends SearchRequestDto {
  company_id?: string;
  department_id?: number;
  device_type_id?: number;
  manufacturer_id?: number;
} 