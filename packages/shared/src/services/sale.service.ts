import type {
  SalesType,
  SaleItem,
  SaleItemViewHistory,
  SaleItemCart,
  SalesAdmin
} from '../types/models';
import type {
  CreateSalesTypeRequestDto,
  UpdateSalesTypeRequestDto,
  CreateSaleItemRequestDto,
  UpdateSaleItemRequestDto,
  CreateSaleItemViewHistoryRequestDto,
  UpdateSaleItemViewHistoryRequestDto,
  CreateSaleItemCartRequestDto,
  UpdateSaleItemCartRequestDto,
  CreateSalesAdminRequestDto,
  UpdateSalesAdminRequestDto,
  SalesAdminSearchRequestDto,
  SaleItemResponseDto,
  SaleItemListDto,
  SaleItemSearchRequestDto
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';
import { PrismaClient, Prisma } from '@prisma/client';
import { ServiceManager } from './service.manager';
import { saleTransformers, toSalesTypeResponseDto, transformIfExistsWithType } from '../transformers';
import { auctionItemService, productService } from './index';

/**
 * SalesType 서비스 클래스
 */
export class SalesTypeService extends BaseService<SalesType, CreateSalesTypeRequestDto, UpdateSalesTypeRequestDto> {
  protected modelName = 'salesType';

  constructor(protected prisma: PrismaClient) {
    super();
  }

  /**
   * 판매 유형 생성
   */
  async create(data: CreateSalesTypeRequestDto): Promise<SalesType> {
    const createData: Prisma.SalesTypeUncheckedCreateInput = {
      code: data.code ?? 'AUCTION',
      name: data.name,
      service_name: data.service_name,
      model: data.model,
      description: data.description,
      sort_key: data.sort_key ?? 1000,
      status: data.status ?? 1,
    };
    return await this.prisma.salesType.create({ data: createData });
  }

  /**
   * 판매 유형 여러 개 생성
   */
  async createMany(data: CreateSalesTypeRequestDto[]): Promise<{ count: number; data: SalesType[] }> {
    const createData: Prisma.SalesTypeUncheckedCreateInput[] = data.map(item => ({
      code: item.code ?? 'AUCTION',
      name: item.name,
      service_name: item.service_name,
      model: item.model,
      description: item.description,
      sort_key: item.sort_key ?? 1000,
      status: item.status ?? 1,
    }));
    const result = await this.prisma.salesType.createMany({ data: createData, skipDuplicates: true });
    const createdData = await this.prisma.salesType.findMany({ orderBy: { id: 'desc' }, take: result.count });
    return { count: result.count, data: createdData };
  }

  async findById(id: string | number): Promise<SalesType | null> {
    return await this.prisma.salesType.findUnique({
      where: { id: Number(id) },
    });
  }

  async findMany(options?: SearchOptions): Promise<SalesType[]> {
    const query = this.buildQuery(options);
    return await this.prisma.salesType.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<SalesType | null> {
    const query = this.buildQuery(options);
    return await this.prisma.salesType.findFirst(query);
  }

  async findUnique(where: Prisma.SalesTypeWhereUniqueInput): Promise<SalesType | null> {
    return await this.prisma.salesType.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<SalesType>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [data, total] = await Promise.all([
      this.prisma.salesType.findMany({ ...query, skip, take }),
      this.prisma.salesType.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateSalesTypeRequestDto): Promise<SalesType> {
    const updateData: Prisma.SalesTypeUncheckedUpdateInput = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.service_name !== undefined) updateData.service_name = data.service_name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sort_key !== undefined) updateData.sort_key = data.sort_key;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.salesType.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  async updateMany(where: Prisma.SalesTypeWhereInput, data: UpdateSalesTypeRequestDto): Promise<{ count: number }> {
    const updateData: Prisma.SalesTypeUncheckedUpdateInput = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.service_name !== undefined) updateData.service_name = data.service_name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sort_key !== undefined) updateData.sort_key = data.sort_key;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.salesType.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<SalesType> {
    return await this.prisma.salesType.delete({
      where: { id: Number(id) },
    });
  }

  async deleteMany(where: Prisma.SalesTypeWhereInput): Promise<{ count: number }> {
    return await this.prisma.salesType.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<SalesType> {
    return await this.prisma.salesType.update({
      where: { id: Number(id) },
      data: { status: 0 },
    });
  }

  async restore(id: string | number): Promise<SalesType> {
    return await this.prisma.salesType.update({
      where: { id: Number(id) },
      data: { status: 1 },
    });
  }

  async count(where?: Prisma.SalesTypeWhereInput): Promise<number> {
    return await this.prisma.salesType.count({ where });
  }

  async exists(where: Prisma.SalesTypeWhereInput): Promise<boolean> {
    const count = await this.prisma.salesType.count({ where });
    return count > 0;
  }
}

/**
 * SaleItem 서비스 클래스
 */
export class SaleItemService extends BaseService<SaleItem, CreateSaleItemRequestDto, UpdateSaleItemRequestDto> {
  protected modelName = 'saleItem';

  constructor(
    protected prisma: PrismaClient,
    private readonly serviceManager: ServiceManager
  ) {
    super();
  }

  /**
   * 판매 아이템 생성
   */
  async create(data: CreateSaleItemRequestDto): Promise<SaleItem> {
    // item_id가 없으면 sales_type에 따라 아이템 생성
    let itemId = data.item_id;
    if (!itemId) {
      const salesType = await this.prisma.salesType.findUnique({
        where: { id: data.sales_type }
      });

      if (!salesType) {
        throw new Error('존재하지 않는 판매 유형입니다.');
      }

      const service = this.serviceManager.getService(salesType.service_name);
      const item = await service.create({
        ...data,
        owner_id: data.owner_id,
      });
      itemId = item.id.toString();
    }

    const createData: Prisma.SaleItemUncheckedCreateInput = {
      owner_id: BigInt(data.owner_id),
      sales_type: data.sales_type,
      item_id: BigInt(itemId),
      status: data.status ?? 1,
    };

    return await this.prisma.saleItem.create({
      data: createData,
      include: {
        salesType: true,
      },
    });
  }

  async createMany(data: CreateSaleItemRequestDto[]): Promise<{ count: number; data: SaleItem[] }> {
    if (data.length === 0) {
      return { count: 0, data: [] };
    }

    const firstItem = data[0];
    if (!firstItem) {
      return { count: 0, data: [] };
    }

    const createdData = await this.prisma.saleItem.createMany({
      data: data.map(item => ({
        owner_id: BigInt(item.owner_id),
        sales_type: item.sales_type,
        item_id: BigInt(item.item_id),
        status: item.status ?? 1,
      })),
    });

    const result = await this.prisma.saleItem.findMany({
      where: {
        owner_id: BigInt(firstItem.owner_id),
        sales_type: firstItem.sales_type,
        item_id: BigInt(firstItem.item_id),
      },
      include: {
        salesType: true,
      },
    });

    return {
      count: createdData.count,
      data: result
    };
  }

  async findById(id: string | number): Promise<SaleItem | null> {
    return await this.prisma.saleItem.findFirst({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: {
        salesType: true,
      },
    });
  }

  async findByItemId(itemId: string | number): Promise<SaleItem | null> {
    return await this.prisma.saleItem.findFirst({
      where: { item_id: typeof itemId === 'string' ? BigInt(itemId) : BigInt(itemId) },
      include: {
        salesType: true,
      },
    });
  }

  async findByIdWithItem(id: string | number): Promise<SaleItemResponseDto | null> {
    const saleItem = await this.findById(id);
    if (!saleItem) {
      console.log('saleItem not found:', id);
      return null;
    }

    console.log('saleItem:', {
      id: saleItem.id.toString(),
      sales_type: saleItem.sales_type,
      item_id: saleItem.item_id.toString(),
      salesType: saleItem.salesType
    });

    const service = this.serviceManager.getService(saleItem.salesType?.service_name ?? 'auctionItemService');

    const item = await service.findById(saleItem.item_id.toString());
    console.log('item:', item);
    console.log('item-transform:', item ? transformIfExistsWithType(item, saleTransformers as any) : undefined);

    return {
      id: saleItem.id.toString(),
      owner_id: saleItem.owner_id.toString(),
      sales_type: saleItem.sales_type,
      item_id: saleItem.item_id.toString(),
      salesType: toSalesTypeResponseDto(saleItem.salesType!),
      // item: item ? transformIfExistsWithType(item, saleTransformers as any) : undefined,
      item: item,
      status: saleItem.status,
      created_at: saleItem.created_at?.toISOString() ?? null,
      updated_at: saleItem.updated_at?.toISOString() ?? null,
    };
  }

  async findMany(where: any = {}, include: any = {}): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where,
      include: {
        salesType: true,
        ...include,
      },
    });
  }

  async findFirst(options?: SearchOptions): Promise<SaleItem | null> {
    const query = this.buildQuery(options);
    return await this.prisma.saleItem.findFirst(query);
  }

  async findUnique(where: any): Promise<SaleItem | null> {
    return await this.prisma.saleItem.findUnique({
      where,
      include: {
        salesType: true,
      },
    });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<SaleItem>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    // Prisma Include를 사용하여 한 번에 모든 관련 데이터 조회
    const includeOptions = {
      salesType: true,
    };

    const [data, total] = await Promise.all([
      this.prisma.saleItem.findMany({
        ...query,
        skip,
        take,
        include: includeOptions,
      }),
      this.prisma.saleItem.count({ where: query.where }),
    ]);

    // 타입 단언으로 include 결과 처리
    const saleItemsWithSalesType = data as (typeof data[0] & { salesType: any })[];

    // Item ID들을 수집하여 배치 조회
    const serviceNames = Array.from(new Set(saleItemsWithSalesType.map(item => item.salesType?.service_name).filter(Boolean)));

    // 각 서비스별로 배치 조회
    const itemsMap = new Map();
    for (const serviceName of serviceNames) {
      if (!serviceName) continue;

      const service = this.serviceManager.getService(serviceName);
      const serviceItemIds = saleItemsWithSalesType
        .filter(item => item.salesType?.service_name === serviceName)
        .map(item => item.item_id.toString());

      // 개별 조회 (기존 방식, 하지만 서비스별로 그룹화하여 최적화)
      const items = await Promise.all(
        serviceItemIds.map(async (itemId) => {
          const item = await service.findById(itemId);
          return { id: itemId, data: item };
        })
      );
      items.forEach(item => itemsMap.set(item.id, item.data));
    }

    // 결과 조합
    const items = saleItemsWithSalesType.map(saleItem => ({
      ...saleItem,
      item: itemsMap.get(saleItem.item_id.toString()),
    }));

    return this.createPaginationResult(items as any, total, page, limit);
  }

  async findWithPaginationAndItems(options?: SearchOptions): Promise<PaginationResult<SaleItem>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    // Prisma Include를 사용하여 한 번에 모든 관련 데이터 조회
    const includeOptions = {
      salesType: {
        select: {
          id: true,
          name: true,
          service_name: true,
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.saleItem.findMany({
        ...query,
        skip,
        take,
        include: includeOptions,
      }),
      this.prisma.saleItem.count({ where: query.where }),
    ]);

    // 타입 단언으로 include 결과 처리
    const saleItemsWithSalesType = data as (typeof data[0] & { salesType: any })[];

    // Item ID들을 수집하여 배치 조회
    const serviceNames = Array.from(new Set(saleItemsWithSalesType.map(item => item.salesType?.service_name).filter(Boolean)));

    // 각 서비스별로 배치 조회
    const itemsMap = new Map();
    for (const serviceName of serviceNames) {
      if (!serviceName) continue;

      const service = this.serviceManager.getService(serviceName);
      const serviceItemIds = saleItemsWithSalesType
        .filter(item => item.salesType?.service_name === serviceName)
        .map(item => item.item_id.toString());

      // 개별 조회 (기존 방식, 하지만 서비스별로 그룹화하여 최적화)
      const items = await Promise.all(
        serviceItemIds.map(async (itemId) => {
          const item = await service.findById(itemId);
          return { id: itemId, data: item };
        })
      );
      items.forEach(item => itemsMap.set(item.id, item.data));
    }

    // 결과 조합
    const items = saleItemsWithSalesType.map(saleItem => ({
      ...saleItem,
      item: itemsMap.get(saleItem.item_id.toString()),
    }));

    return this.createPaginationResult(items as any, total, page, limit);
  }

  async update(id: string | number, data: UpdateSaleItemRequestDto): Promise<SaleItem> {
    const updateData: Prisma.SaleItemUncheckedUpdateInput = {};

    if (data.owner_id !== undefined) updateData.owner_id = BigInt(data.owner_id);
    if (data.sales_type !== undefined) updateData.sales_type = data.sales_type;
    if (data.item_id !== undefined) updateData.item_id = BigInt(data.item_id);
    if (data.status !== undefined) updateData.status = data.status;

    const result = await this.prisma.saleItem.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
      include: {
        salesType: true,
      },
    });

    return result;
  }

  async updateMany(where: any, data: UpdateSaleItemRequestDto): Promise<{ count: number }> {
    const updateData: Prisma.SaleItemUncheckedUpdateInput = {};

    if (data.owner_id !== undefined) updateData.owner_id = BigInt(data.owner_id);
    if (data.sales_type !== undefined) updateData.sales_type = data.sales_type;
    if (data.item_id !== undefined) updateData.item_id = BigInt(data.item_id);
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.saleItem.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<SaleItem> {
    return await this.prisma.saleItem.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: {
        salesType: true,
      },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.saleItem.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<SaleItem> {
    const result = await this.prisma.saleItem.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
      include: {
        salesType: true,
      },
    });
    return result;
  }

  async restore(id: string | number): Promise<SaleItem> {
    const result = await this.prisma.saleItem.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
      include: {
        salesType: true,
      },
    });
    return result;
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.saleItem.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.saleItem.count({ where });
    return count > 0;
  }

  async search(searchOptions: SaleItemSearchRequestDto): Promise<SaleItemListDto[]> {
    const { sales_type, status, ...rest } = searchOptions;

    const where: Prisma.SaleItemWhereInput = {
      ...(rest.owner_id && { owner_id: BigInt(rest.owner_id) }),
      ...(sales_type && { sales_type }),
      ...(status && { status }),
    };

    const saleItems = await this.prisma.saleItem.findMany({
      where,
      include: {
        salesType: true,
      },
    });

    const items = await Promise.all(
      saleItems.map(async (saleItem) => {
        const service = this.serviceManager.getService(saleItem.salesType.service_name ?? 'auctionItemService');
        const item = await service.findById(saleItem.item_id.toString());
        return {
          id: saleItem.id.toString(),
          owner_id: saleItem.owner_id.toString(),
          sales_type: saleItem.sales_type,
          item_id: saleItem.item_id.toString(),
          status: saleItem.status,
          created_at: saleItem.created_at?.toISOString() ?? null,
          updated_at: saleItem.updated_at?.toISOString() ?? null,
        };
      })
    );

    return items;
  }

  async findBySalesType(salesType: number): Promise<SaleItem[]> {
    return await this.findMany({ sales_type: salesType, status: 1 }, { salesType: true });
  }

  async findManyByOwnerId(ownerId: bigint, where: any = {}): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where: {
        owner_id: ownerId,
        ...where,
      },
      include: {
        salesType: true,
      },
    });
  }

  async findManyBySalesType(salesType: number, where: any = {}): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where: {
        sales_type: salesType,
        ...where,
      },
      include: {
        salesType: true,
      },
    });
  }

  async findManyByItemId(itemId: bigint, where: any = {}): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where: {
        item_id: itemId,
        ...where,
      },
      include: {
        salesType: true,
      },
    });
  }

  async findManyByStatus(status: number, where: any = {}): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where: {
        status,
        ...where,
      },
      include: {
        salesType: true,
      },
    });
  }

  async findManyByOwnerIdAndSalesType(ownerId: bigint, salesType: number, where: any = {}): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where: {
        owner_id: ownerId,
        sales_type: salesType,
        ...where,
      },
      include: {
        salesType: true,
      },
    });
  }

  async findManyByOwnerIdAndStatus(ownerId: bigint, status: number, where: any = {}): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where: {
        owner_id: ownerId,
        status,
        ...where,
      },
      include: {
        salesType: true,
      },
    });
  }

  async findManyBySalesTypeAndStatus(salesType: number, status: number, where: any = {}): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where: {
        sales_type: salesType,
        status,
        ...where,
      },
      include: {
        salesType: true,
      },
    });
  }

  async findManyByOwnerIdAndSalesTypeAndStatus(
    ownerId: bigint,
    salesType: number,
    status: number,
    where: any = {}
  ): Promise<SaleItem[]> {
    return await this.prisma.saleItem.findMany({
      where: {
        owner_id: ownerId,
        sales_type: salesType,
        status,
        ...where,
      },
      include: {
        salesType: true,
      },
    });
  }
}

/**
 * SaleItemViewHistory 서비스 클래스
 */
export class SaleItemViewHistoryService extends BaseService<SaleItemViewHistory, CreateSaleItemViewHistoryRequestDto, UpdateSaleItemViewHistoryRequestDto> {
  protected modelName = 'saleItemViewHistory';
  private readonly serviceManager: ServiceManager;

  constructor(protected prisma: PrismaClient, serviceManager: ServiceManager) {
    super();
    this.serviceManager = serviceManager;
  }

  async create(data: CreateSaleItemViewHistoryRequestDto): Promise<SaleItemViewHistory> {
    const existingHistory = await this.findFirst({ where: { owner_id: BigInt(data.owner_id), item_id: BigInt(data.item_id) } });
    if (existingHistory) {
      return existingHistory;
    }

    const createData: Prisma.SaleItemViewHistoryUncheckedCreateInput = {
      owner_id: BigInt(data.owner_id),
      item_id: BigInt(data.item_id),
      status: data.status ?? 1,
    };

    return await this.prisma.saleItemViewHistory.create({
      data: createData,
    });
  }

  async createMany(data: CreateSaleItemViewHistoryRequestDto[]): Promise<{ count: number; data: SaleItemViewHistory[] }> {
    if (data.length === 0) {
      return { count: 0, data: [] };
    }

    const firstItem = data[0];
    if (!firstItem) {
      return { count: 0, data: [] };
    }

    const createdData = await this.prisma.saleItemViewHistory.createMany({
      data: data.map(item => ({
        owner_id: BigInt(item.owner_id),
        item_id: BigInt(item.item_id),
        status: item.status ?? 1,
      })),
    });

    const result = await this.prisma.saleItemViewHistory.findMany({
      where: {
        owner_id: BigInt(firstItem.owner_id),
        item_id: BigInt(firstItem.item_id),
      },
    });

    return {
      count: createdData.count,
      data: result
    };
  }

  async findById(id: string | number): Promise<SaleItemViewHistory | null> {
    return await this.prisma.saleItemViewHistory.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async findMany(options?: SearchOptions): Promise<SaleItemViewHistory[]> {
    const query = this.buildQuery(options);
    return await this.prisma.saleItemViewHistory.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<SaleItemViewHistory | null> {
    const query = this.buildQuery(options);
    return await this.prisma.saleItemViewHistory.findFirst(query);
  }

  async findUnique(where: any): Promise<SaleItemViewHistory | null> {
    return await this.prisma.saleItemViewHistory.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<SaleItemViewHistory>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [items, total] = await Promise.all([
      this.prisma.saleItemViewHistory.findMany({ ...query, skip, take }),
      this.prisma.saleItemViewHistory.count({ where: query.where })
    ]);

    const data = await Promise.all(
      items.map(async (saleItemViewHistory: SaleItemViewHistory) => {
        const service = this.serviceManager.getService(saleItemViewHistory.saleItem?.salesType?.service_name ?? 'auctionItemService');
        const item = await service.findById(saleItemViewHistory.item_id.toString());
        return {
          ...saleItemViewHistory,
          saleItem: {
            ...saleItemViewHistory.saleItem,
            item: item,
          },
        };
      })
    );

    return this.createPaginationResult(data as unknown as SaleItemViewHistory[], total, page, limit);
  }

  async update(id: string | number, data: UpdateSaleItemViewHistoryRequestDto): Promise<SaleItemViewHistory> {
    const updateData: Prisma.SaleItemViewHistoryUncheckedUpdateInput = {};

    if (data.owner_id !== undefined) updateData.owner_id = BigInt(data.owner_id);
    if (data.item_id !== undefined) updateData.item_id = BigInt(data.item_id);
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.saleItemViewHistory.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
    });
  }

  async updateMany(where: any, data: UpdateSaleItemViewHistoryRequestDto): Promise<{ count: number }> {
    const updateData: Prisma.SaleItemViewHistoryUncheckedUpdateInput = {};

    if (data.owner_id !== undefined) updateData.owner_id = BigInt(data.owner_id);
    if (data.item_id !== undefined) updateData.item_id = BigInt(data.item_id);
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.saleItemViewHistory.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<SaleItemViewHistory> {
    return await this.prisma.saleItemViewHistory.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.saleItemViewHistory.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<SaleItemViewHistory> {
    return await this.prisma.saleItemViewHistory.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
    });
  }

  async restore(id: string | number): Promise<SaleItemViewHistory> {
    return await this.prisma.saleItemViewHistory.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.saleItemViewHistory.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.saleItemViewHistory.count({ where });
    return count > 0;
  }

  async findByOwnerId(ownerId: string): Promise<SaleItemViewHistory[]> {
    return await this.prisma.saleItemViewHistory.findMany({
      where: {
        owner_id: BigInt(ownerId),
        status: 1,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}

/**
 * SaleItemCart 서비스 클래스
 */
export class SaleItemCartService extends BaseService<SaleItemCart, CreateSaleItemCartRequestDto, UpdateSaleItemCartRequestDto> {
  protected modelName = 'saleItemCart';

  constructor(protected prisma: PrismaClient) {
    super();
  }

  async create(data: CreateSaleItemCartRequestDto): Promise<SaleItemCart> {
    const createData: Prisma.SaleItemCartUncheckedCreateInput = {
      owner_id: BigInt(data.owner_id),
      item_id: BigInt(data.item_id),
      status: data.status ?? 1,
    };

    return await this.prisma.saleItemCart.create({
      data: createData,
    });
  }

  async createMany(data: CreateSaleItemCartRequestDto[]): Promise<{ count: number; data: SaleItemCart[] }> {
    if (data.length === 0) {
      return { count: 0, data: [] };
    }

    const firstItem = data[0];
    if (!firstItem) {
      return { count: 0, data: [] };
    }

    const createdData = await this.prisma.saleItemCart.createMany({
      data: data.map(item => ({
        owner_id: BigInt(item.owner_id),
        item_id: BigInt(item.item_id),
        status: item.status ?? 1,
      })),
    });

    const result = await this.prisma.saleItemCart.findMany({
      where: {
        owner_id: BigInt(firstItem.owner_id),
        item_id: BigInt(firstItem.item_id),
      },
    });

    return {
      count: createdData.count,
      data: result
    };
  }

  async findById(id: string | number): Promise<SaleItemCart | null> {
    return await this.prisma.saleItemCart.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async findMany(options?: SearchOptions): Promise<SaleItemCart[]> {
    const query = this.buildQuery(options);
    return await this.prisma.saleItemCart.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<SaleItemCart | null> {
    const query = this.buildQuery(options);
    return await this.prisma.saleItemCart.findFirst(query);
  }

  async findUnique(where: any): Promise<SaleItemCart | null> {
    return await this.prisma.saleItemCart.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<SaleItemCart>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [data, total] = await Promise.all([
      this.prisma.saleItemCart.findMany({ ...query, skip, take }),
      this.prisma.saleItemCart.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateSaleItemCartRequestDto): Promise<SaleItemCart> {
    const updateData: Prisma.SaleItemCartUncheckedUpdateInput = {};

    if (data.owner_id !== undefined) updateData.owner_id = BigInt(data.owner_id);
    if (data.item_id !== undefined) updateData.item_id = BigInt(data.item_id);
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.saleItemCart.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
    });
  }

  async updateMany(where: any, data: UpdateSaleItemCartRequestDto): Promise<{ count: number }> {
    const updateData: Prisma.SaleItemCartUncheckedUpdateInput = {};

    if (data.owner_id !== undefined) updateData.owner_id = BigInt(data.owner_id);
    if (data.item_id !== undefined) updateData.item_id = BigInt(data.item_id);
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.saleItemCart.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<SaleItemCart> {
    return await this.prisma.saleItemCart.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.saleItemCart.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<SaleItemCart> {
    return await this.prisma.saleItemCart.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
    });
  }

  async restore(id: string | number): Promise<SaleItemCart> {
    return await this.prisma.saleItemCart.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.saleItemCart.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.saleItemCart.count({ where });
    return count > 0;
  }

  async findCartByOwnerId(ownerId: string): Promise<SaleItemCart[]> {
    return await this.prisma.saleItemCart.findMany({
      where: {
        owner_id: BigInt(ownerId),
        status: 1,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getCartItemCount(ownerId: string): Promise<number> {
    return await this.prisma.saleItemCart.count({
      where: {
        owner_id: BigInt(ownerId),
        status: 1,
      },
    });
  }
}

/**
 * SalesAdmin 서비스 클래스
 */
export class SalesAdminService extends BaseService<SalesAdmin, CreateSalesAdminRequestDto, UpdateSalesAdminRequestDto> {
  protected modelName = 'salesAdmin';

  constructor(protected prisma: PrismaClient) {
    super();
  }

  async create(data: CreateSalesAdminRequestDto): Promise<SalesAdmin> {
    const createData: Prisma.SalesAdminUncheckedCreateInput = {
      username: data.username,
      password: data.password,
      email: data.email,
      status: data.status ?? 1,
    };

    return await this.prisma.salesAdmin.create({
      data: createData,
    });
  }

  async createMany(data: CreateSalesAdminRequestDto[]): Promise<{ count: number; data: SalesAdmin[] }> {
    if (data.length === 0) {
      return { count: 0, data: [] };
    }

    const firstItem = data[0];
    if (!firstItem) {
      return { count: 0, data: [] };
    }

    const createdData = await this.prisma.salesAdmin.createMany({
      data: data.map(item => ({
        username: item.username,
        password: item.password,
        email: item.email,
        status: item.status ?? 1,
      })),
    });

    const result = await this.prisma.salesAdmin.findMany({
      where: {
        username: firstItem.username,
        email: firstItem.email,
      },
    });

    return {
      count: createdData.count,
      data: result
    };
  }

  async findById(id: string | number): Promise<SalesAdmin | null> {
    return await this.prisma.salesAdmin.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async findMany(options?: SearchOptions): Promise<SalesAdmin[]> {
    const query = this.buildQuery(options);
    return await this.prisma.salesAdmin.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<SalesAdmin | null> {
    const query = this.buildQuery(options);
    return await this.prisma.salesAdmin.findFirst(query);
  }

  async findUnique(where: any): Promise<SalesAdmin | null> {
    return await this.prisma.salesAdmin.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<SalesAdmin>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [data, total] = await Promise.all([
      this.prisma.salesAdmin.findMany({ ...query, skip, take }),
      this.prisma.salesAdmin.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateSalesAdminRequestDto): Promise<SalesAdmin> {
    const updateData: Prisma.SalesAdminUncheckedUpdateInput = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.salesAdmin.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
    });
  }

  async updateMany(where: any, data: UpdateSalesAdminRequestDto): Promise<{ count: number }> {
    const updateData: Prisma.SalesAdminUncheckedUpdateInput = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.salesAdmin.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<SalesAdmin> {
    return await this.prisma.salesAdmin.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.salesAdmin.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<SalesAdmin> {
    return await this.prisma.salesAdmin.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
    });
  }

  async restore(id: string | number): Promise<SalesAdmin> {
    return await this.prisma.salesAdmin.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.salesAdmin.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.salesAdmin.count({ where });
    return count > 0;
  }

  async findByUsername(username: string): Promise<SalesAdmin | null> {
    return await this.prisma.salesAdmin.findFirst({
      where: {
        username,
        status: 1,
      },
    });
  }

  async findByEmail(email: string): Promise<SalesAdmin | null> {
    return await this.prisma.salesAdmin.findFirst({
      where: {
        email,
        status: 1,
      },
    });
  }

  async search(searchOptions: SalesAdminSearchRequestDto): Promise<PaginationResult<SalesAdmin>> {
    const { page = 1, limit = 10, ...filters } = searchOptions;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesAdminWhereInput = {
      ...(filters.username && { username: { contains: filters.username } }),
      ...(filters.email && { email: { contains: filters.email } }),
      ...(filters.status !== undefined && { status: filters.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.salesAdmin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.salesAdmin.count({ where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }
} 