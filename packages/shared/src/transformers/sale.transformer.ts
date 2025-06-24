import type {
  SalesType,
  SaleItem,
  SaleItemViewHistory,
  SaleItemCart,
  SalesAdmin,
  AuctionItem,
  Product
} from '../types/models';
import type {
  SalesTypeResponseDto,
  SalesTypeListDto,
  SaleItemResponseDto,
  SaleItemListDto,
  SaleItemViewHistoryResponseDto,
  SaleItemCartResponseDto,
  SalesAdminResponseDto,
  SalesAdminListDto,
  SalesAdminLoginResponseDto
} from '../types/dto';
import { bigintToString, dateToString, transformIfExists, omitSensitiveFields, transformIfExistsWithType } from './common.transformer';
import { toAuctionItemResponseDto } from './auction.transformer';
import { toProductResponseDto } from './product.transformer';

export const saleTransformers = {
  Product: toProductResponseDto,
  AuctionItem: toAuctionItemResponseDto,
} as const;

/**
 * SalesType 모델을 SalesTypeResponseDto로 변환
 */
export function toSalesTypeResponseDto(salesType: SalesType): SalesTypeResponseDto {
  return {
    id: salesType.id.toString(),
    created_at: dateToString(salesType.created_at),
    updated_at: dateToString(salesType.updated_at),
    status: salesType.status ?? 1,
    code: salesType.code ?? '',
    name: salesType.name ?? '',
    service_name: salesType.service_name,
    model: salesType.model ?? '',
    description: salesType.description ?? '',
    sort_key: salesType.sort_key,
  };
}

/**
 * SalesType 모델을 SalesTypeListDto로 변환
 */
export function toSalesTypeListDto(salesType: SalesType): SalesTypeListDto {
  return {
    id: Number(salesType.id),
    code: salesType.code ?? '',
    name: salesType.name ?? '',
    service_name: salesType.service_name,
    model: salesType.model ?? '',
    description: salesType.description ?? '',
    sort_key: salesType.sort_key,
    status: salesType.status ?? 1,
  };
}

/**
 * SaleItem 모델을 SaleItemResponseDto로 변환
 */
export function toSaleItemResponseDto(saleItem: SaleItem): SaleItemResponseDto {
  return {
    id: bigintToString(saleItem.id)!,
    created_at: dateToString(saleItem.created_at),
    updated_at: dateToString(saleItem.updated_at),
    status: saleItem.status ?? null,
    owner_id: bigintToString(saleItem.owner_id)!,
    sales_type: saleItem.sales_type,
    item_id: bigintToString(saleItem.item_id)!,
    salesType: transformIfExists(saleItem.salesType, toSalesTypeResponseDto),
    item: saleItem.item ? transformIfExistsWithType(saleItem.item, saleTransformers as any) : undefined,
  };
}

function isAuctionItem(item: any): item is AuctionItem {
  return 'auction_code' in item;
}

/**
 * SaleItem 모델을 SaleItemListDto로 변환
 */
export function toSaleItemListDto(saleItem: SaleItem): SaleItemListDto {
  return {
    id: bigintToString(saleItem.id)!,
    owner_id: bigintToString(saleItem.owner_id)!,
    sales_type: saleItem.sales_type,
    item_id: bigintToString(saleItem.item_id)!,
    item: saleItem.item ? (isAuctionItem(saleItem.item) ? toAuctionItemResponseDto(saleItem.item) : toProductResponseDto(saleItem.item)) : undefined,
    salesType: transformIfExists(saleItem.salesType, toSalesTypeResponseDto),
    status: saleItem.status,
    created_at: dateToString(saleItem.created_at),
    updated_at: dateToString(saleItem.updated_at),
  };
}

/**
 * SaleItemViewHistory 모델을 SaleItemViewHistoryResponseDto로 변환
 */
export function toSaleItemViewHistoryResponseDto(
  viewHistory: SaleItemViewHistory
): SaleItemViewHistoryResponseDto {
  return {
    id: bigintToString(viewHistory.id)!,
    created_at: dateToString(viewHistory.created_at),
    updated_at: dateToString(viewHistory.updated_at),
    status: viewHistory.status,
    owner_id: bigintToString(viewHistory.owner_id)!,
    item_id: bigintToString(viewHistory.item_id)!,
  };
}

/**
 * SaleItemCart 모델을 SaleItemCartResponseDto로 변환
 */
export function toSaleItemCartResponseDto(cart: SaleItemCart): SaleItemCartResponseDto {
  return {
    id: bigintToString(cart.id)!,
    created_at: dateToString(cart.created_at),
    updated_at: dateToString(cart.updated_at),
    status: cart.status,
    owner_id: bigintToString(cart.owner_id)!,
    item_id: bigintToString(cart.item_id)!,
    saleItem: cart.saleItem ? {
      id: bigintToString(cart.saleItem.id)!,
      owner_id: bigintToString(cart.saleItem.owner_id)!,
      sales_type: cart.saleItem.sales_type,
      item_id: bigintToString(cart.saleItem.item_id)!,
    } : undefined,
  };
}

/**
 * SalesAdmin 모델을 SalesAdminResponseDto로 변환 (비밀번호 제외)
 */
export function toSalesAdminResponseDto(salesAdmin: SalesAdmin): SalesAdminResponseDto {
  return {
    id: bigintToString(salesAdmin.id)!,
    created_at: dateToString(salesAdmin.created_at),
    updated_at: null, // SalesAdmin 모델에는 updated_at 필드가 없음
    status: salesAdmin.status,
    username: salesAdmin.username,
    email: salesAdmin.email,
    level: salesAdmin.level,
  };
}

/**
 * SalesAdmin 모델을 SalesAdminListDto로 변환
 */
export function toSalesAdminListDto(salesAdmin: SalesAdmin): SalesAdminListDto {
  return {
    id: bigintToString(salesAdmin.id)!,
    username: salesAdmin.username,
    email: salesAdmin.email,
    level: salesAdmin.level,
    status: salesAdmin.status ?? 1,
    created_at: dateToString(salesAdmin.created_at),
    updated_at: dateToString(salesAdmin.updated_at),
  };
}

/**
 * SalesAdmin 모델을 SalesAdminLoginResponseDto로 변환
 */
export function toSalesAdminLoginResponseDto(
  salesAdmin: SalesAdmin,
  token?: string
): SalesAdminLoginResponseDto {
  return {
    admin: toSalesAdminResponseDto(salesAdmin),
    token,
  };
}

/**
 * 배열 변환 함수들
 */
export function toSalesTypeListDtoArray(salesTypes: SalesType[]): SalesTypeListDto[] {
  return salesTypes.map(toSalesTypeListDto);
}

export function toSaleItemListDtoArray(saleItems: SaleItem[]): SaleItemListDto[] {
  return saleItems.map(toSaleItemListDto);
}

export function toSalesAdminListDtoArray(salesAdmins: SalesAdmin[]): SalesAdminListDto[] {
  return salesAdmins.map(toSalesAdminListDto);
}

/**
 * SalesAdmin 모델에서 민감한 정보 제거
 */
export function sanitizeSalesAdmin(salesAdmin: SalesAdmin): Omit<SalesAdmin, 'password'> {
  return omitSensitiveFields(salesAdmin, 'password');
} 