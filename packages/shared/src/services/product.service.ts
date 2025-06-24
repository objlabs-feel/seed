import type { Product } from '../types/models';
import type {
  CreateProductRequestDto,
  UpdateProductRequestDto,
  ProductSearchRequestDto
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';

/**
 * Product 서비스 클래스
 */
export class ProductService extends BaseService<Product, CreateProductRequestDto, UpdateProductRequestDto> {
  protected modelName = 'product';

  constructor(protected prisma: any) {
    super();
  }

  /**
   * 제품 생성
   */
  async create(data: CreateProductRequestDto): Promise<Product> {
    return await this.prisma.product.create({
      data: {
        owner_id: BigInt(data.owner_id),
        media: data.media,
        info: data.info,
        device_id: BigInt(data.device_id),
        available_quantity: data.available_quantity,
        origin_price: data.origin_price,
        sale_price: data.sale_price,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        components_ids: data.components_ids,
        version: data.version,
        description: data.description,
        status: data.status || 1,
      },
      include: {
        company: true,
        components: true,
        device: true,
      },
    });
  }

  async createMany(data: CreateProductRequestDto[]): Promise<{ count: number; data: Product[] }> {
    const result = await this.prisma.product.createMany({
      data: data.map(item => ({
        owner_id: BigInt(item.owner_id),
        media: item.media,
        info: item.info,
        device_id: BigInt(item.device_id),
        available_quantity: item.available_quantity,
        origin_price: item.origin_price,
        sale_price: item.sale_price,
        discount_type: item.discount_type,
        discount_value: item.discount_value,
        components_ids: item.components_ids,
        version: item.version,
        description: item.description,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.product.findMany({
      include: {
        company: true,
        components: true,
        device: true,
      },
      orderBy: { created_at: 'desc' },
      take: result.count,
    });

    return { count: result.count, data: createdData };
  }

  async findById(id: string | number): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: {
        company: true,
        components: true,
        device: true,
      },
    });
  }

  async findMany(options?: SearchOptions): Promise<Product[]> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        company: true,
        components: true,
        device: true,
      };
    }
    return await this.prisma.product.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<Product | null> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        company: true,
        components: true,
        device: true,
      };
    }
    return await this.prisma.product.findFirst(query);
  }

  async findUnique(where: any): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where,
      include: {
        company: true,
        components: true,
        device: true,
      },
    });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<Product>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    if (!query.include) {
      query.include = {
        company: true,
        components: true,
        device: true,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({ ...query, skip, take }),
      this.prisma.product.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateProductRequestDto): Promise<Product> {
    const updateData: any = {};

    if (data.owner_id !== undefined) updateData.owner_id = BigInt(data.owner_id);
    if (data.media !== undefined) updateData.media = data.media;
    if (data.info !== undefined) updateData.info = data.info;
    if (data.device_id !== undefined) updateData.device_id = BigInt(data.device_id);
    if (data.available_quantity !== undefined) updateData.available_quantity = data.available_quantity;
    if (data.origin_price !== undefined) updateData.origin_price = data.origin_price;
    if (data.sale_price !== undefined) updateData.sale_price = data.sale_price;
    if (data.discount_type !== undefined) updateData.discount_type = data.discount_type;
    if (data.discount_value !== undefined) updateData.discount_value = data.discount_value;
    if (data.components_ids !== undefined) updateData.components_ids = data.components_ids;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.product.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
      include: {
        company: true,
        components: true,
        device: true,
      },
    });
  }

  async updateMany(where: any, data: UpdateProductRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.owner_id !== undefined) updateData.owner_id = BigInt(data.owner_id);
    if (data.media !== undefined) updateData.media = data.media;
    if (data.info !== undefined) updateData.info = data.info;
    if (data.device_id !== undefined) updateData.device_id = BigInt(data.device_id);
    if (data.available_quantity !== undefined) updateData.available_quantity = data.available_quantity;
    if (data.origin_price !== undefined) updateData.origin_price = data.origin_price;
    if (data.sale_price !== undefined) updateData.sale_price = data.sale_price;
    if (data.discount_type !== undefined) updateData.discount_type = data.discount_type;
    if (data.discount_value !== undefined) updateData.discount_value = data.discount_value;
    if (data.components_ids !== undefined) updateData.components_ids = data.components_ids;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.product.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<Product> {
    return await this.prisma.product.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.product.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<Product> {
    return await this.prisma.product.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
      include: {
        company: true,
        components: true,
        device: true,
      },
    });
  }

  async restore(id: string | number): Promise<Product> {
    return await this.prisma.product.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
      include: {
        company: true,
        components: true,
        device: true,
      },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.product.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.product.count({ where });
    return count > 0;
  }

  /**
   * 제품 검색
   */
  async search(searchOptions: ProductSearchRequestDto): Promise<PaginationResult<Product>> {
    const { keyword, status, owner_id, device_id, min_price, max_price, ...paginationOptions } = searchOptions;

    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }

    if (owner_id) {
      where.owner_id = BigInt(owner_id);
    }

    if (device_id) {
      where.device_id = BigInt(device_id);
    }

    if (min_price !== undefined || max_price !== undefined) {
      where.sale_price = {};
      if (min_price !== undefined) {
        where.sale_price.gte = min_price;
      }
      if (max_price !== undefined) {
        where.sale_price.lte = max_price;
      }
    }

    if (keyword) {
      where.OR = [
        { description: { contains: keyword } },
        { device: { description: { contains: keyword } } },
        { company: { name: { contains: keyword } } },
      ];
    }

    return await this.findWithPagination({
      ...paginationOptions,
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 소유자별 제품 조회
   */
  async findByOwnerId(ownerId: string): Promise<Product[]> {
    return await this.findMany({
      where: { owner_id: BigInt(ownerId), status: 1 },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 가격 범위로 제품 조회
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return await this.findMany({
      where: {
        sale_price: { gte: minPrice, lte: maxPrice },
        status: 1
      },
      orderBy: { sale_price: 'asc' },
    });
  }

  /**
   * 재고가 있는 제품 조회
   */
  async findAvailableProducts(): Promise<Product[]> {
    return await this.findMany({
      where: {
        available_quantity: { gt: 0 },
        status: 1
      },
      orderBy: { created_at: 'desc' },
    });
  }
} 