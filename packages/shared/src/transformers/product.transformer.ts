import type { Product } from '../types/models';
import type {
  ProductResponseDto,
  ProductListDto,
  ProductDetailResponseDto
} from '../types/dto';
import { bigintToString, dateToString, transformIfExists, transformArray } from './common.transformer';
import { toDeviceResponseDto } from './device.transformer';

/**
 * Product 모델을 ProductResponseDto로 변환
 */
export function toProductResponseDto(product: Product): ProductResponseDto {
  return {
    id: bigintToString(product.id)!,
    created_at: dateToString(product.created_at),
    updated_at: dateToString(product.updated_at),
    status: product.status,
    owner_id: bigintToString(product.owner_id)!,
    media: product.media,
    info: product.info,
    device_id: bigintToString(product.device_id)!,
    available_quantity: product.available_quantity,
    origin_price: product.origin_price,
    sale_price: product.sale_price,
    discount_type: product.discount_type,
    discount_value: product.discount_value,
    components_ids: product.components_ids,
    version: product.version,
    description: product.description,
    company: product.company ? {
      id: bigintToString(product.company.id)!,
      name: product.company.name,
    } : undefined,
    device: product.device ? {
      id: bigintToString(product.device.id)!,
      version: product.device.version,
      description: product.device.description,
      manufacturer: product.device.manufacturer ? {
        id: product.device.manufacturer.id.toString(),
        name: product.device.manufacturer.name,
      } : undefined,
      deviceType: product.device.deviceType ? {
        id: product.device.deviceType.id.toString(),
        name: product.device.deviceType.name,
      } : undefined,
    } : undefined,
  };
}

/**
 * Product 모델을 ProductListDto로 변환
 */
export function toProductListDto(product: Product): ProductListDto {
  return {
    id: bigintToString(product.id)!,
    owner_id: bigintToString(product.owner_id)!,
    device_id: bigintToString(product.device_id)!,
    available_quantity: product.available_quantity,
    origin_price: product.origin_price,
    sale_price: product.sale_price,
    discount_type: product.discount_type,
    discount_value: product.discount_value,
    version: product.version,
    description: product.description,
    status: product.status,
    created_at: dateToString(product.created_at),
    updated_at: dateToString(product.updated_at),
  };
}

/**
 * Product 모델을 ProductDetailResponseDto로 변환 (컴포넌트 정보 포함)
 */
export function toProductDetailResponseDto(product: Product): ProductDetailResponseDto {
  const baseDto = toProductResponseDto(product);

  return {
    ...baseDto,
    components: transformArray(product.components, (component) => ({
      id: bigintToString(component.id)!,
      version: component.version,
      description: component.description,
      manufacturer: component.manufacturer ? {
        id: component.manufacturer.id.toString(),
        name: component.manufacturer.name,
      } : undefined,
      deviceType: component.deviceType ? {
        id: component.deviceType.id.toString(),
        name: component.deviceType.name,
      } : undefined,
    })),
  };
}

/**
 * Product 배열을 ProductListDto 배열로 변환
 */
export function toProductListDtoArray(products: Product[]): ProductListDto[] {
  return products.map(toProductListDto);
} 