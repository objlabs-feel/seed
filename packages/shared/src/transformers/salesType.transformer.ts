import { SalesType } from '../types/models';
import { SalesTypeResponseDto } from '../types/dto';
import { transformBaseFields } from './common.transformer';

/**
 * SalesType 모델을 SalesTypeResponseDto로 변환합니다.
 * @param {SalesType} salesType - 변환할 SalesType 모델 객체
 * @returns {SalesTypeResponseDto} 변환된 DTO 객체
 */
export function transformSalesTypeToDto(salesType: SalesType): SalesTypeResponseDto {
  const salesTypeDto: SalesTypeResponseDto = {
    ...transformBaseFields(salesType),
    code: salesType.code,
    name: salesType.name,
    service_name: salesType.service_name,
    model: salesType.model,
    description: salesType.description,
    sort_key: salesType.sort_key,
  };
  return salesTypeDto;
}

/**
 * SalesType 모델 배열을 SalesTypeResponseDto 배열로 변환합니다.
 * @param {SalesType[]} salesTypes - 변환할 SalesType 모델 배열
 * @returns {SalesTypeResponseDto[]} 변환된 DTO 객체 배열
 */
export function transformSalesTypesToDtos(salesTypes: SalesType[]): SalesTypeResponseDto[] {
  return salesTypes.map(transformSalesTypeToDto);
} 