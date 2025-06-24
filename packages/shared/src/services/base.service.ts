/**
 * 기본 서비스 클래스
 * 모든 CRUD 서비스가 상속받는 공통 기능을 제공합니다.
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: any;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchOptions extends PaginationOptions {
  where?: any;
  include?: any;
  select?: any;
}

/**
 * 기본 CRUD 서비스 인터페이스
 */
export interface BaseServiceInterface<T, CreateData, UpdateData> {
  // 생성
  create(data: CreateData): Promise<T>;
  createMany(data: CreateData[]): Promise<{ count: number; data: T[] }>;

  // 조회
  findById(id: string | number): Promise<T | null>;
  findMany(options?: SearchOptions): Promise<T[]>;
  findFirst(options?: SearchOptions): Promise<T | null>;
  findUnique(where: any): Promise<T | null>;

  // 페이지네이션 조회
  findWithPagination(options?: SearchOptions): Promise<PaginationResult<T>>;

  // 업데이트
  update(id: string | number, data: UpdateData): Promise<T>;
  updateMany(where: any, data: UpdateData): Promise<{ count: number }>;

  // 삭제
  delete(id: string | number): Promise<T>;
  deleteMany(where: any): Promise<{ count: number }>;

  // 소프트 삭제 (status 업데이트)
  softDelete(id: string | number): Promise<T>;
  restore(id: string | number): Promise<T>;

  // 개수 조회
  count(where?: any): Promise<number>;

  // 존재 확인
  exists(where: any): Promise<boolean>;
}

/**
 * 기본 서비스 추상 클래스
 */
export abstract class BaseService<T, CreateData, UpdateData>
  implements BaseServiceInterface<T, CreateData, UpdateData> {

  protected abstract modelName: string;
  protected abstract prisma: any; // PrismaClient 인스턴스

  /**
   * 기본 페이지네이션 설정
   */
  protected getDefaultPagination(options?: PaginationOptions) {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 10));
    const skip = (page - 1) * limit;
    const include = options?.include || {};

    return {
      page,
      limit,
      skip,
      take: limit,
      include,
    };
  }

  /**
   * 페이지네이션 결과 생성
   */
  protected createPaginationResult<R>(
    data: R[],
    total: number,
    page: number,
    limit: number
  ): PaginationResult<R> {
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 검색 옵션을 Prisma 쿼리로 변환
   */
  protected buildQuery(options?: SearchOptions) {
    const query: any = {};

    if (options?.where) {
      query.where = options.where;
    }

    if (options?.include) {
      query.include = options.include;
    }

    if (options?.select) {
      query.select = options.select;
    }

    if (options?.orderBy) {
      query.orderBy = options.orderBy;
    }

    return query;
  }

  // 추상 메서드들 - 각 서비스에서 구현해야 함
  abstract create(data: CreateData): Promise<T>;
  abstract createMany(data: CreateData[]): Promise<{ count: number; data: T[] }>;
  abstract findById(id: string | number): Promise<T | null>;
  abstract findMany(options?: SearchOptions): Promise<T[]>;
  abstract findFirst(options?: SearchOptions): Promise<T | null>;
  abstract findUnique(where: any): Promise<T | null>;
  abstract findWithPagination(options?: SearchOptions): Promise<PaginationResult<T>>;
  abstract update(id: string | number, data: UpdateData): Promise<T>;
  abstract updateMany(where: any, data: UpdateData): Promise<{ count: number }>;
  abstract delete(id: string | number): Promise<T>;
  abstract deleteMany(where: any): Promise<{ count: number }>;
  abstract softDelete(id: string | number): Promise<T>;
  abstract restore(id: string | number): Promise<T>;
  abstract count(where?: any): Promise<number>;
  abstract exists(where: any): Promise<boolean>;
} 