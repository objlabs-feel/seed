import type { User, Profile } from '../types/models';
import type {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserSearchRequestDto,
  CreateProfileRequestDto,
  UpdateProfileRequestDto,
  ProfileSearchRequestDto
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';
import { Prisma } from '@prisma/client';

/**
 * User 서비스 클래스
 */
export class UserService extends BaseService<User, CreateUserRequestDto, UpdateUserRequestDto> {
  protected modelName = 'user';

  constructor(protected prisma: any) {
    super();
  }

  /**
   * 사용자 생성 (프로필 포함)
   */
  async create(data: CreateUserRequestDto): Promise<User> {
    return await this.prisma.$transaction(async (tx: any) => {
      let profileId: bigint | undefined;

      // 프로필 정보가 있는 경우 프로필 생성
      if (data.name || data.email || data.mobile) {
        const profile = await tx.profile.create({
          data: {
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            profile_type: data.profile_type || 0,
            company_id: data.company_id ? BigInt(data.company_id) : undefined,
            status: 1,
          },
        });
        profileId = profile.id;
      }

      // 사용자 생성
      const newUser = await tx.user.create({
        data: {
          device_token: data.device_token || '',
          profile_id: profileId,
          status: data.status || 1,
        },
        include: {
          profile: true, // 생성된 사용자 정보에 프로필을 포함하여 반환
        },
      });

      return newUser;
    });
  }

  /**
   * 여러 사용자 생성
   */
  async createMany(data: CreateUserRequestDto[]): Promise<{ count: number; data: User[] }> {
    const result = await this.prisma.user.createMany({
      data: data.map(item => ({
        device_token: item.device_token,
        profile_id: item.profile_id ? BigInt(item.profile_id) : null,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.user.findMany({
      where: {
        device_token: { in: data.map(item => item.device_token) }
      },
      include: { profile: true },
      orderBy: { created_at: 'desc' },
      take: result.count,
    });

    return {
      count: result.count,
      data: createdData,
    };
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: string | number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: {
        profile: {
          include: {
            company: true,
          }
        }
      },
    });
  }

  /**
   * 여러 사용자 조회
   */
  async findMany(options?: SearchOptions): Promise<User[]> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = { profile: true };
    }
    return await this.prisma.user.findMany(query);
  }

  /**
   * 첫 번째 사용자 조회
   */
  async findFirst(options?: SearchOptions): Promise<User | null> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = { profile: true };
    }
    return await this.prisma.user.findFirst(query);
  }

  /**
   * 고유 조건으로 사용자 조회
   */
  async findUnique(where: any): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where,
      include: { profile: true },
    });
  }

  /**
   * 검색 옵션을 Prisma 쿼리로 변환 (UserService 전용)
   */
  protected buildQuery(options?: SearchOptions) {
    const query: any = {};

    // 기본 where 조건
    if (options?.where) {
      query.where = { ...options.where };
    }

    // Profile 관련 필터 처리
    const profileFilters: any = {};
    if (options?.where?.profile_name) {
      profileFilters.name = { contains: options.where.profile_name };
    }
    if (options?.where?.email) {
      profileFilters.email = { contains: options.where.email };
    }
    if (options?.where?.mobile) {
      profileFilters.mobile = { contains: options.where.mobile };
    }

    // Profile 필터가 있으면 where 조건에 추가
    if (Object.keys(profileFilters).length > 0) {
      if (!query.where) query.where = {};
      query.where.profile = profileFilters;
    }

    // Profile 관련 필터 제거 (User 테이블에 없는 필드들)
    if (query.where) {
      delete query.where.profile_name;
      delete query.where.email;
      delete query.where.mobile;
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

  /**
   * 페이지네이션과 함께 사용자 조회
   */
  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<User>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    if (!query.include) {
      query.include = { profile: true };
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        ...query,
        skip,
        take,
      }),
      this.prisma.user.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  /**
   * 사용자 업데이트 (프로필 포함)
   */
  async update(id: string | number, data: UpdateUserRequestDto & { profile?: UpdateProfileRequestDto }): Promise<User> {
    return await this.prisma.$transaction(async (tx: any) => {
      const userId = typeof id === 'string' ? BigInt(id) : BigInt(id);

      // 프로필 정보가 있는 경우 프로필 업데이트
      if (data.profile && data.profile_id) {
        await tx.profile.update({
          where: { id: BigInt(data.profile_id) },
          data: data.profile,
        });
      }

      const { profile, ...userData } = data;

      const updateData: any = {};
      if (userData.device_token !== undefined) updateData.device_token = userData.device_token;
      if (userData.profile_id !== undefined) updateData.profile_id = userData.profile_id ? BigInt(userData.profile_id) : null;
      if (userData.status !== undefined) updateData.status = userData.status;

      // 사용자 업데이트
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          profile: true,
        },
      });

      return updatedUser;
    });
  }

  /**
   * 여러 사용자 업데이트
   */
  async updateMany(where: any, data: UpdateUserRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.device_token !== undefined) updateData.device_token = data.device_token;
    if (data.profile_id !== undefined) updateData.profile_id = data.profile_id ? BigInt(data.profile_id) : null;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.user.updateMany({
      where,
      data: updateData,
    });
  }

  /**
   * 사용자 삭제
   */
  async delete(id: string | number): Promise<User> {
    return await this.prisma.user.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  /**
   * 여러 사용자 삭제
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.user.deleteMany({ where });
  }

  /**
   * 사용자 소프트 삭제
   */
  async softDelete(id: string | number): Promise<User> {
    return await this.prisma.user.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
      include: { profile: true },
    });
  }

  /**
   * 사용자 복원
   */
  async restore(id: string | number): Promise<User> {
    return await this.prisma.user.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
      include: { profile: true },
    });
  }

  /**
   * 사용자 개수 조회
   */
  async count(where?: any): Promise<number> {
    const query = this.buildQuery({ where });
    return await this.prisma.user.count({ where: query.where });
  }

  /**
   * 사용자 존재 확인
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.user.count({ where });
    return count > 0;
  }

  /**
   * 디바이스 토큰으로 사용자 조회
   */
  async findByDeviceToken(deviceToken: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { device_token: deviceToken },
      include: { profile: true },
    });
  }

  /**
   * 디바이스 토큰과 사용자 ID로 사용자 조회
   */
  async findByDeviceTokenAndId(deviceToken: string, userId: bigint): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        AND: [
          { device_token: deviceToken },
          { id: userId }
        ]
      },
      include: { profile: true },
    });
  }

  /**
   * 사용자 검색
   */
  async search(searchOptions: UserSearchRequestDto): Promise<PaginationResult<User>> {
    const { keyword, status, profile_type, company_id, ...paginationOptions } = searchOptions;

    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }

    if (profile_type !== undefined || company_id) {
      where.profile = {};
      if (profile_type !== undefined) {
        where.profile.profile_type = profile_type;
      }
      if (company_id) {
        where.profile.company_id = BigInt(company_id);
      }
    }

    if (keyword) {
      where.OR = [
        { device_token: { contains: keyword } },
        { profile: { name: { contains: keyword } } },
        { profile: { email: { contains: keyword } } },
        { profile: { mobile: { contains: keyword } } },
      ];
    }

    return await this.findWithPagination({
      ...paginationOptions,
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 체크인 처리: device_token으로 사용자를 찾거나, 없으면 user와 profile을 함께 생성
   */
  async checkIn(deviceToken: string): Promise<User> {
    // 1. device_token으로 기존 사용자 조회
    const existingUser = await this.findByDeviceToken(deviceToken);
    if (existingUser) {
      return existingUser;
    }

    // 2. 사용자가 없으면 user를 생성하면서 profile도 함께 생성 (Nested Write)
    const newUser = await this.prisma.user.create({
      data: {
        device_token: deviceToken,
        status: 1,
        profile: {
          create: {}, // 빈 Profile 생성
        },
      },
      include: {
        profile: true, // 생성된 User와 함께 Profile 정보도 포함하여 반환
      },
    });

    return newUser;
  }
}

/**
 * Profile 서비스 클래스
 */
export class ProfileService extends BaseService<Profile, CreateProfileRequestDto, UpdateProfileRequestDto> {
  protected modelName = 'profile';

  constructor(protected prisma: any) {
    super();
  }

  /**
   * 프로필 생성
   */
  async create(data: CreateProfileRequestDto): Promise<Profile> {
    return await this.prisma.profile.create({
      data: {
        company_id: data.company_id ? BigInt(data.company_id) : null,
        profile_type: data.profile_type,
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        status: data.status || 1,
      },
      include: {
        company: true,
      },
    });
  }

  /**
   * 여러 프로필 생성
   */
  async createMany(data: CreateProfileRequestDto[]): Promise<{ count: number; data: Profile[] }> {
    const result = await this.prisma.profile.createMany({
      data: data.map(item => ({
        company_id: item.company_id ? BigInt(item.company_id) : null,
        profile_type: item.profile_type,
        name: item.name,
        mobile: item.mobile,
        email: item.email,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.profile.findMany({
      include: { company: true },
      orderBy: { created_at: 'desc' },
      take: result.count,
    });

    return {
      count: result.count,
      data: createdData,
    };
  }

  /**
   * ID로 프로필 조회
   */
  async findById(id: string | number): Promise<Profile | null> {
    return await this.prisma.profile.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: { company: true },
    });
  }

  /**
   * 여러 프로필 조회
   */
  async findMany(options?: SearchOptions): Promise<Profile[]> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = { company: true };
    }
    return await this.prisma.profile.findMany(query);
  }

  /**
   * 첫 번째 프로필 조회
   */
  async findFirst(options?: SearchOptions): Promise<Profile | null> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = { company: true };
    }
    return await this.prisma.profile.findFirst(query);
  }

  /**
   * 고유 조건으로 프로필 조회
   */
  async findUnique(where: any): Promise<Profile | null> {
    return await this.prisma.profile.findUnique({
      where,
      include: { company: true },
    });
  }

  /**
   * 페이지네이션과 함께 프로필 조회
   */
  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<Profile>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    if (!query.include) {
      query.include = { company: true };
    }

    const [data, total] = await Promise.all([
      this.prisma.profile.findMany({
        ...query,
        skip,
        take,
      }),
      this.prisma.profile.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  /**
   * 프로필 업데이트
   */
  async update(id: string | number, data: UpdateProfileRequestDto): Promise<Profile> {
    const updateData: any = {};

    if (data.company_id !== undefined) updateData.company_id = data.company_id ? BigInt(data.company_id) : null;
    if (data.profile_type !== undefined) updateData.profile_type = data.profile_type;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.profile.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
      include: { company: true },
    });
  }

  /**
   * 여러 프로필 업데이트
   */
  async updateMany(where: any, data: UpdateProfileRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.company_id !== undefined) updateData.company_id = data.company_id ? BigInt(data.company_id) : null;
    if (data.profile_type !== undefined) updateData.profile_type = data.profile_type;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.profile.updateMany({
      where,
      data: updateData,
    });
  }

  /**
   * 프로필 삭제
   */
  async delete(id: string | number): Promise<Profile> {
    return await this.prisma.profile.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  /**
   * 여러 프로필 삭제
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.profile.deleteMany({ where });
  }

  /**
   * 프로필 소프트 삭제
   */
  async softDelete(id: string | number): Promise<Profile> {
    return await this.prisma.profile.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
      include: { company: true },
    });
  }

  /**
   * 프로필 복원
   */
  async restore(id: string | number): Promise<Profile> {
    return await this.prisma.profile.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
      include: { company: true },
    });
  }

  /**
   * 프로필 개수 조회
   */
  async count(where?: any): Promise<number> {
    return await this.prisma.profile.count({ where });
  }

  /**
   * 프로필 존재 확인
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.profile.count({ where });
    return count > 0;
  }

  /**
   * 이메일로 프로필 조회
   */
  async findByEmail(email: string): Promise<Profile | null> {
    return await this.prisma.profile.findFirst({
      where: { email },
      include: { company: true },
    });
  }

  /**
   * 전화번호로 프로필 조회
   */
  async findByMobile(mobile: string): Promise<Profile | null> {
    return await this.prisma.profile.findFirst({
      where: { mobile },
      include: { company: true },
    });
  }

  /**
   * 프로필 검색
   */
  async search(searchOptions: ProfileSearchRequestDto): Promise<PaginationResult<Profile>> {
    const { keyword, status, name, email, mobile, profile_type, company_id, ...paginationOptions } = searchOptions;

    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }

    if (profile_type !== undefined) {
      where.profile_type = profile_type;
    }

    if (company_id) {
      where.company_id = BigInt(company_id);
    }

    if (name) {
      where.name = { contains: name };
    }

    if (email) {
      where.email = { contains: email };
    }

    if (mobile) {
      where.mobile = { contains: mobile };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { email: { contains: keyword } },
        { mobile: { contains: keyword } },
      ];
    }

    return await this.findWithPagination({
      ...paginationOptions,
      where,
      orderBy: { created_at: 'desc' },
    });
  }
} 