import type {
  SalesType,
  SaleItem,
  SaleItemViewHistory,
  SaleItemCart,
  SalesAdmin
} from '../types/models';
import { AuctionStatus } from '../types/models';
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
    let item: any = null;
    if (!itemId) {
      const salesType = await this.prisma.salesType.findUnique({
        where: { id: data.sales_type }
      });

      if (!salesType) {
        throw new Error('존재하지 않는 판매 유형입니다.');
      }

      console.log('saleItem:', data);

      const service = this.serviceManager.getService(salesType.service_name);
      item = await service.create({
        ...data,
        status: 1,        
      });
      itemId = item.id.toString();
    }

    const createData: Prisma.SaleItemUncheckedCreateInput = {
      owner_id: BigInt(data.owner_id),
      sales_type: data.sales_type,
      item_id: BigInt(itemId),
      status: 1,
    };

    const result = await this.prisma.saleItem.create({
      data: createData,
      include: {
        salesType: true,
      },
    });

    return { ...result, item: item };
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

  /**
   * 판매 아이템 페이지네이션 조회 (성능 최적화)
   * item 검색 조건이 있으면 Raw Query 사용, 없으면 기존 방식 사용
   */
  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<SaleItem>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    // item 검색 조건이 있는지 확인
    const hasItemSearchConditions = options?.where?.item &&
      (options.where.item.OR ||
        options.where.item.department_id !== undefined ||
        options.where.item.device_type_id !== undefined ||
        options.where.item.manufacturer_id !== undefined ||
        options.where.item.status !== undefined);

    return await this.findWithPaginationWithRawQuery(options);
  }

  /**
   * 일반적인 페이지네이션 조회 (item.status 필터링 없음)
   */
  private async findWithPaginationStandard(options?: SearchOptions): Promise<PaginationResult<SaleItem>> {
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

  /**
   * Raw Query를 사용한 성능 최적화된 페이지네이션 조회
   * saleItem과 item(auctionItem, product)을 join해서 한 번의 쿼리로 모든 데이터 조회
   */
  private async findWithPaginationWithRawQuery(options?: SearchOptions): Promise<PaginationResult<SaleItem>> {
    const { page, limit } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);
    const statusCond = options?.where?.item?.status;
    const itemSearchCond = options?.where?.item;

    // WHERE 조건 구성
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // saleItem 조건들
    if (query.where) {
      if (query.where.sales_type !== undefined) {
        whereConditions.push(`si.sales_type = $${paramIndex++}`);
        params.push(query.where.sales_type);
      }
      if (query.where.status !== undefined) {
        whereConditions.push(`si.status = $${paramIndex++}`);
        params.push(query.where.status);
      }
      if (query.where.owner_id !== undefined) {
        whereConditions.push(`si.owner_id = $${paramIndex++}`);
        params.push(query.where.owner_id);
      }
    }

    // item 검색 조건들
    if (itemSearchCond) {
      // keyword 검색 (name, description)
      if (itemSearchCond.OR) {
        const orConditions: string[] = [];
        itemSearchCond.OR.forEach((orCond: any) => {
          if (orCond.name?.contains) {
            orConditions.push(`(ai.name ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex++})`);
            params.push(`%${orCond.name.contains}%`);
          }
          if (orCond.description?.contains) {
            orConditions.push(`(ud.description ILIKE $${paramIndex} OR d.description ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex++})`);
            params.push(`%${orCond.description.contains}%`);
          }
        });
        if (orConditions.length > 0) {
          whereConditions.push(`(${orConditions.join(' OR ')})`);
        }
      }

      // 단일 필드 검색
      if (itemSearchCond.department_id !== undefined) {
        whereConditions.push(`ud.department_id in ($${paramIndex++})`);
        params.push(itemSearchCond.department_id);
      }
      if (itemSearchCond.device_type_id !== undefined) {
        whereConditions.push(`(ud.device_type_id in ($${paramIndex}) OR d.device_type in ($${paramIndex++}))`);
        params.push(itemSearchCond.device_type_id);
      }
      if (itemSearchCond.manufacturer_id !== undefined) {
        whereConditions.push(`(ud.manufacturer_id in ($${paramIndex}) OR d.manufacturer_id in ($${paramIndex++}))`);
        params.push(itemSearchCond.manufacturer_id);
      }
      // company.area 검색
      if (itemSearchCond.area !== undefined) {
        whereConditions.push(`c.area = $${paramIndex++}`);
        params.push(itemSearchCond.area);
      }

      // item.status 필터링 (AUCTION 타입일 때만)
      if (statusCond && query.where?.sales_type === 1) {
        if (typeof statusCond === 'object') {
          if (statusCond.gt !== undefined) {
            whereConditions.push(`ai.status > $${paramIndex++}`);
            params.push(statusCond.gt);
          }
          if (statusCond.lt !== undefined) {
            whereConditions.push(`ai.status < $${paramIndex++}`);
            params.push(statusCond.lt);
          }
          if (statusCond.gte !== undefined) {
            whereConditions.push(`ai.status >= $${paramIndex++}`);
            params.push(statusCond.gte);
          }
          if (statusCond.lte !== undefined) {
            whereConditions.push(`ai.status <= $${paramIndex++}`);
            params.push(statusCond.lte);
          }
          if (statusCond.eq !== undefined) {
            whereConditions.push(`ai.status = $${paramIndex++}`);
            params.push(statusCond.eq);
          }
        } else {
          whereConditions.push(`ai.status = $${paramIndex++}`);
          params.push(statusCond);
        }
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // ORDER BY 조건
    const orderByClause = query.orderBy ?
      Object.entries(query.orderBy).map(([key, value]) => `si.${key} ${value}`).join(', ') :
      'si.updated_at DESC';

    // Raw Query 실행 - 단순한 버전
    const rawQuery = `
      SELECT 
        si.id,
        si.owner_id,
        si.sales_type,
        si.item_id,
        si.status,
        si.created_at,
        si.updated_at,
        st.code as sales_type_code,
        st.name as sales_type_name,
        st.service_name,
        st.model,
        -- auctionItem 관련 컬럼들
        ai.id as auction_item_id,
        ai.auction_code,
        ai.quantity as auction_quantity,
        ai.status as auction_status,
        ai.accept_id,
        ai.seller_steps,
        ai.buyer_steps,
        ai.seller_timeout,
        ai.buyer_timeout,
        ai.start_timestamp,
        ai.expired_count,
        ai.auction_timeout,
        ai.visit_date,
        ai.visit_time,
        -- product 관련 컬럼들
        p.id as product_id,
        p.available_quantity,
        p.origin_price,
        p.sale_price,
        p.discount_type,
        p.discount_value,
        p.description as product_description,
        -- usedDevice 관련 컬럼들 (auctionItem에서만 사용)
        ud.id as used_device_id,
        ud.company_id,
        ud.department_id,
        ud.device_type_id,
        ud.manufacturer_id,
        ud.manufacture_date,
        ud.images,
        ud.description as used_device_description,
        -- device 관련 컬럼들 (product에서만 사용)
        d.id as device_id,
        d.manufacturer_id as device_manufacturer_id,
        d.device_type as device_device_type,
        d.media,
        d.info,
        d.version,
        d.description as device_description,
        -- company 관련 컬럼들
        c.id as company_id,
        c.name as company_name,
        c.area as company_area,
        c.owner_id as company_owner_id,
        c.created_at as company_created_at,
        c.updated_at as company_updated_at,
        d2.name as department_name,
        dt.name as device_type_name,
        m.name as manufacturer_name        
      FROM sale_item si
      JOIN sales_type st ON si.sales_type = st.id
      LEFT JOIN auction_item ai ON si.item_id = ai.id AND st.service_name = 'auctionItemService'
      LEFT JOIN product p ON si.item_id = p.id AND st.service_name = 'productService'
      LEFT JOIN used_device ud ON ai.device_id = ud.id
      LEFT JOIN device d ON (p.device_id = d.id)
      LEFT JOIN company c ON ud.company_id = c.id
      LEFT JOIN department d2 ON ud.department_id = d2.id
      LEFT JOIN device_type dt ON ud.device_type_id = dt.id
      LEFT JOIN manufacturer m ON ud.manufacturer_id = m.id
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM sale_item si
      JOIN sales_type st ON si.sales_type = st.id
      LEFT JOIN auction_item ai ON si.item_id = ai.id AND st.service_name = 'auctionItemService'
      LEFT JOIN product p ON si.item_id = p.id AND st.service_name = 'productService'
      LEFT JOIN used_device ud ON ai.device_id = ud.id
      LEFT JOIN device d ON (p.device_id = d.id)
      LEFT JOIN company c ON ud.company_id = c.id
      LEFT JOIN department d2 ON ud.department_id = d2.id
      LEFT JOIN device_type dt ON ud.device_type_id = dt.id
      LEFT JOIN manufacturer m ON ud.manufacturer_id = m.id
      ${whereClause}
    `;

    console.log(params);

    // 쿼리 실행
    const [data, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe(rawQuery, ...params, limit, (page - 1) * limit) as Promise<SaleItem[]>,
      this.prisma.$queryRawUnsafe(countQuery, ...params)
    ]);

    const total = Number((countResult as any)[0]?.total || 0);

    // 결과 변환 - 최대한 단순하게
    const transformedData = (data as any[]).map(row => ({
      id: row.id,
      owner_id: row.owner_id,
      sales_type: row.sales_type,
      item_id: row.item_id,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      salesType: {
        id: row.sales_type,
        code: row.sales_type_code,
        name: row.sales_type_name,
        service_name: row.service_name,
        model: row.model
      },
      item: row.service_name === 'auctionItemService' && row.auction_item_id ? {
        id: row.auction_item_id,
        device_id: row.used_device_id,
        auction_code: row.auction_code,
        quantity: row.auction_quantity,
        status: row.auction_status,
        accept_id: row.accept_id,
        seller_steps: row.seller_steps,
        buyer_steps: row.buyer_steps,
        seller_timeout: row.seller_timeout,
        buyer_timeout: row.buyer_timeout,
        start_timestamp: row.start_timestamp,
        expired_count: row.expired_count,
        auction_timeout: row.auction_timeout,
        visit_date: row.visit_date,
        visit_time: row.visit_time,
        device: row.used_device_id ? {
          id: row.used_device_id,
          company_id: row.company_id,
          department_id: row.department_id,
          device_type_id: row.device_type_id,
          manufacturer_id: row.manufacturer_id,
          manufacture_date: row.manufacture_date,
          images: row.images,
          description: row.used_device_description,
          company: row.company_id ? {
            id: row.company_id,
            name: row.company_name,
            area: row.company_area,
            owner_id: row.company_owner_id,
            created_at: row.company_created_at,
            updated_at: row.company_updated_at
          } : null,
          department: row.department_id ? {
            id: row.department_id,
            name: row.department_name,
          } : null,
          deviceType: row.device_type_id ? {
            id: row.device_type_id,
            name: row.device_type_name,
          } : null,
          manufacturer: row.manufacturer_id ? {
            id: row.manufacturer_id,
            name: row.manufacturer_name,
          } : null
        } : null
      } : row.service_name === 'productService' && row.product_id ? {
        id: row.product_id,
        owner_id: row.owner_id,
        device_id: row.device_id,
        available_quantity: row.available_quantity,
        origin_price: row.origin_price,
        sale_price: row.sale_price,
        discount_type: row.discount_type,
        discount_value: row.discount_value,
        description: row.product_description,
        device: row.device_id ? {
          id: row.device_id,
          manufacturer_id: row.device_manufacturer_id,
          device_type: row.device_device_type,
          media: row.media,
          info: row.info,
          version: row.version,
          description: row.device_description,
          company: row.company_id ? {
            id: row.company_id,
            name: row.company_name,
            area: row.company_area,
            owner_id: row.company_owner_id,
            created_at: row.company_created_at,
            updated_at: row.company_updated_at
          } : null,
          department: row.department_id ? {
            id: row.department_id,
            name: row.department_name,
          } : null,
          deviceType: row.device_type_id ? {
            id: row.device_type_id,
            name: row.device_type_name,
          } : null,
          manufacturer: row.manufacturer_id ? {
            id: row.manufacturer_id,
            name: row.manufacturer_name,
          } : null
        } : null
      } : null
    }));

    return this.createPaginationResult(transformedData as SaleItem[], total, page, limit);
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