import * as bcrypt from 'bcryptjs';
import type { Admin } from '../types/models';
import type {
  CreateAdminRequestDto,
  UpdateAdminRequestDto,
  AdminSearchRequestDto
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';

/**
 * Admin 서비스 클래스
 */
export class AdminService extends BaseService<Admin, CreateAdminRequestDto, UpdateAdminRequestDto> {
  protected modelName = 'admin';

  constructor(protected prisma: any) {
    super();
  }

  /**
   * 관리자 생성
   */
  async create(data: CreateAdminRequestDto): Promise<Admin> {
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    return await this.prisma.admin.create({
      data: {
        username: data.username,
        password: hashedPassword,
        level: data.level,
        status: data.status || 1,
      },
    });
  }

  /**
   * 관리자 로그인
   */
  async login(username: string, password: string): Promise<Admin | null> {
    const admin = await this.findByUsername(username);

    if (!admin) {
      throw new Error('존재하지 않는 관리자입니다.');
    }

    const isPasswordValid = bcrypt.compareSync(password, admin.password);

    if (!isPasswordValid) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    if (admin.status !== 1) {
      throw new Error('비활성화된 계정입니다.');
    }

    return admin;
  }

  /**
   * 여러 관리자 생성
   */
  async createMany(data: CreateAdminRequestDto[]): Promise<{ count: number; data: Admin[] }> {
    const result = await this.prisma.admin.createMany({
      data: data.map(item => ({
        username: item.username,
        password: bcrypt.hashSync(item.password, 10),
        level: item.level,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    // 생성된 데이터 조회
    const createdData = await this.prisma.admin.findMany({
      where: {
        username: { in: data.map(item => item.username) }
      },
      orderBy: { created_at: 'desc' },
      take: result.count,
    });

    return {
      count: result.count,
      data: createdData,
    };
  }

  /**
   * ID로 관리자 조회
   */
  async findById(id: string | number): Promise<Admin | null> {
    return await this.prisma.admin.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * 여러 관리자 조회
   */
  async findMany(options?: SearchOptions): Promise<Admin[]> {
    const query = this.buildQuery(options);
    return await this.prisma.admin.findMany(query);
  }

  /**
   * 첫 번째 관리자 조회
   */
  async findFirst(options?: SearchOptions): Promise<Admin | null> {
    const query = this.buildQuery(options);
    return await this.prisma.admin.findFirst(query);
  }

  /**
   * 고유 조건으로 관리자 조회
   */
  async findUnique(where: any): Promise<Admin | null> {
    return await this.prisma.admin.findUnique({ where });
  }

  /**
   * 페이지네이션과 함께 관리자 조회
   */
  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<Admin>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [data, total] = await Promise.all([
      this.prisma.admin.findMany({
        ...query,
        skip,
        take,
      }),
      this.prisma.admin.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  /**
   * 관리자 업데이트
   */
  async update(id: string | number, data: UpdateAdminRequestDto): Promise<Admin> {
    const updateData: any = {};

    if (data.username !== undefined) updateData.username = data.username;
    // Do not allow password update through this generic method for security.
    // Create a specific 'changePassword' method if needed.
    if (data.level !== undefined) updateData.level = data.level;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.admin.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  /**
   * 여러 관리자 업데이트
   */
  async updateMany(where: any, data: UpdateAdminRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.username !== undefined) updateData.username = data.username;
    // Do not allow password update through this generic method for security.
    if (data.level !== undefined) updateData.level = data.level;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.admin.updateMany({
      where,
      data: updateData,
    });
  }

  /**
   * 관리자 삭제
   */
  async delete(id: string | number): Promise<Admin> {
    return await this.prisma.admin.delete({
      where: { id: Number(id) },
    });
  }

  /**
   * 여러 관리자 삭제
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.admin.deleteMany({ where });
  }

  /**
   * 관리자 소프트 삭제 (status를 0으로 설정)
   */
  async softDelete(id: string | number): Promise<Admin> {
    return await this.prisma.admin.update({
      where: { id: Number(id) },
      data: { status: 0 },
    });
  }

  /**
   * 관리자 복원 (status를 1로 설정)
   */
  async restore(id: string | number): Promise<Admin> {
    return await this.prisma.admin.update({
      where: { id: Number(id) },
      data: { status: 1 },
    });
  }

  /**
   * 관리자 개수 조회
   */
  async count(where?: any): Promise<number> {
    return await this.prisma.admin.count({ where });
  }

  /**
   * 관리자 존재 확인
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.admin.count({ where });
    return count > 0;
  }

  /**
   * 사용자명으로 관리자 조회
   */
  async findByUsername(username: string): Promise<Admin | null> {
    return await this.prisma.admin.findUnique({
      where: { username },
    });
  }

  /**
   * 관리자 검색 (검색 조건 포함)
   */
  async search(searchOptions: AdminSearchRequestDto): Promise<PaginationResult<Admin>> {
    const { keyword, status, level, username, ...paginationOptions } = searchOptions;

    const where: any = {};

    // 상태 필터
    if (status !== undefined) {
      where.status = status;
    }

    // 레벨 필터
    if (level !== undefined) {
      where.level = level;
    }

    // 사용자명 필터
    if (username) {
      where.username = { contains: username };
    }

    // 키워드 검색 (사용자명에서 검색)
    if (keyword) {
      where.username = { contains: keyword };
    }

    return await this.findWithPagination({
      ...paginationOptions,
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 활성 관리자 조회
   */
  async findActiveAdmins(): Promise<Admin[]> {
    return await this.findMany({
      where: { status: 1 },
      orderBy: { level: 'desc' },
    });
  }

  /**
   * 레벨별 관리자 조회
   */
  async findByLevel(level: number): Promise<Admin[]> {
    return await this.findMany({
      where: { level, status: 1 },
      orderBy: { created_at: 'desc' },
    });
  }
} 