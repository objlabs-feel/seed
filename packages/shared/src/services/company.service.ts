import type { Company } from '../types/models';
import type {
  CreateCompanyRequestDto,
  UpdateCompanyRequestDto,
  CompanySearchRequestDto
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';

/**
 * Company 서비스 클래스
 */
export class CompanyService extends BaseService<Company, CreateCompanyRequestDto, UpdateCompanyRequestDto> {
  protected modelName = 'company';

  constructor(protected prisma: any) {
    super();
  }

  /**
   * 회사 생성
   */
  async create(data: CreateCompanyRequestDto): Promise<Company> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        id: data.owner_id ? BigInt(data.owner_id) : null,
      },
      include: {
        company: true,
      },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }
    console.log('profile', profile);

    let company = null;
    if (profile.company === null || profile.company === undefined) {
      console.log('create company', data);
      const result = await this.prisma.$transaction(async (tx: any) => {
        const company = await tx.company.create({
          data: {
            owner_id: data.owner_id ? BigInt(data.owner_id) : null,
            area: data.area,
            status: data.status || 1,
          },
          include: {
            owner: {
              include: {
                profile: true,
              },
            },
          },
        });

        await tx.profile.update({
          where: { id: profile.id },
          data: {
            company_id: company.id,
          },
        });

        return company;
      });
      company = result;
    } else {
      company = profile.company;
    }

    return company;
  }

  /**
   * 여러 회사 생성
   * >>>> 회사를 동시에 여러개 생성할일은 없으므로 실제로 사용 안함 <<<<
   */
  async createMany(data: CreateCompanyRequestDto[]): Promise<{ count: number; data: Company[] }> {
    const result = await this.prisma.company.createMany({
      data: data.map(item => ({
        name: item.name,
        business_no: item.business_no,
        business_tel: item.business_tel,
        license_img: item.license_img,
        owner_id: item.owner_id ? BigInt(item.owner_id) : null,
        related_members: item.related_members,
        institute_members: item.institute_members,
        company_type: item.company_type,
        business_mobile: item.business_mobile,
        secret_info: item.secret_info,
        zipcode: item.zipcode,
        address: item.address,
        address_detail: item.address_detail,
        area: item.area,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.company.findMany({
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
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
   * ID로 회사 조회
   */
  async findById(id: string | number): Promise<Company | null> {
    return await this.prisma.company.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
        profiles: true,
      },
    });
  }

  /**
   * 여러 회사 조회
   */
  async findMany(options?: SearchOptions): Promise<Company[]> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        owner: {
          include: {
            profile: true,
          },
        },
      };
    }
    return await this.prisma.company.findMany(query);
  }

  /**
   * 첫 번째 회사 조회
   */
  async findFirst(options?: SearchOptions): Promise<Company | null> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        owner: {
          include: {
            profile: true,
          },
        },
      };
    }
    return await this.prisma.company.findFirst(query);
  }

  /**
   * 고유 조건으로 회사 조회
   */
  async findUnique(where: any): Promise<Company | null> {
    return await this.prisma.company.findUnique({
      where,
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * 페이지네이션과 함께 회사 조회
   */
  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<Company>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    if (!query.include) {
      query.include = {
        owner: {
          include: {
            profile: true,
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        ...query,
        skip,
        take,
      }),
      this.prisma.company.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  /**
   * 회사 업데이트
   */
  async update(id: string | number, data: UpdateCompanyRequestDto): Promise<Company> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.business_no !== undefined) updateData.business_no = data.business_no;
    if (data.business_tel !== undefined) updateData.business_tel = data.business_tel;
    if (data.license_img !== undefined) updateData.license_img = data.license_img;
    if (data.owner_id !== undefined) updateData.owner_id = data.owner_id ? BigInt(data.owner_id) : null;
    if (data.related_members !== undefined) updateData.related_members = data.related_members;
    if (data.institute_members !== undefined) updateData.institute_members = data.institute_members;
    if (data.company_type !== undefined) updateData.company_type = data.company_type;
    if (data.business_mobile !== undefined) updateData.business_mobile = data.business_mobile;
    if (data.secret_info !== undefined) updateData.secret_info = data.secret_info;
    if (data.zipcode !== undefined) updateData.zipcode = data.zipcode;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.address_detail !== undefined) updateData.address_detail = data.address_detail;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.company.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * 여러 회사 업데이트
   */
  async updateMany(where: any, data: UpdateCompanyRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.business_no !== undefined) updateData.business_no = data.business_no;
    if (data.business_tel !== undefined) updateData.business_tel = data.business_tel;
    if (data.license_img !== undefined) updateData.license_img = data.license_img;
    if (data.owner_id !== undefined) updateData.owner_id = data.owner_id ? BigInt(data.owner_id) : null;
    if (data.related_members !== undefined) updateData.related_members = data.related_members;
    if (data.institute_members !== undefined) updateData.institute_members = data.institute_members;
    if (data.company_type !== undefined) updateData.company_type = data.company_type;
    if (data.business_mobile !== undefined) updateData.business_mobile = data.business_mobile;
    if (data.secret_info !== undefined) updateData.secret_info = data.secret_info;
    if (data.zipcode !== undefined) updateData.zipcode = data.zipcode;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.address_detail !== undefined) updateData.address_detail = data.address_detail;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.company.updateMany({
      where,
      data: updateData,
    });
  }

  /**
   * 회사 삭제
   */
  async delete(id: string | number): Promise<Company> {
    return await this.prisma.company.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  /**
   * 여러 회사 삭제
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.company.deleteMany({ where });
  }

  /**
   * 회사 소프트 삭제
   */
  async softDelete(id: string | number): Promise<Company> {
    return await this.prisma.company.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * 회사 복원
   */
  async restore(id: string | number): Promise<Company> {
    return await this.prisma.company.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * 회사 개수 조회
   */
  async count(where?: any): Promise<number> {
    return await this.prisma.company.count({ where });
  }

  /**
   * 회사 존재 확인
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.company.count({ where });
    return count > 0;
  }

  /**
   * 사업자번호로 회사 조회
   */
  async findByBusinessNo(businessNo: string): Promise<Company | null> {
    return await this.prisma.company.findFirst({
      where: { business_no: businessNo },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * 소유자로 회사 조회
   */
  async findByOwnerId(ownerId: string): Promise<Company[]> {
    return await this.prisma.company.findMany({
      where: { owner_id: BigInt(ownerId) },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * 회사 검색
   */
  async search(searchOptions: CompanySearchRequestDto): Promise<PaginationResult<Company>> {
    const { page, limit, skip, take } = this.getDefaultPagination(searchOptions);

    const where: any = {
      status: searchOptions.status,
    };

    if (searchOptions.name) {
      where.name = { contains: searchOptions.name };
    }
    if (searchOptions.business_no) {
      where.business_no = { contains: searchOptions.business_no };
    }
    if (searchOptions.company_type !== undefined) {
      where.company_type = searchOptions.company_type;
    }
    if (searchOptions.profile_name) {
      where.profiles = {
        some: {
          name: {
            contains: searchOptions.profile_name,
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        ...searchOptions,
        where,
        skip,
        take,
      }),
      this.prisma.company.count({ where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  /**
   * 회사 타입별 조회
   */
  async findByType(companyType: number): Promise<Company[]> {
    return await this.findMany({
      where: { company_type: companyType, status: 1 },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 지역별 회사 조회
   */
  async findByArea(area: string): Promise<Company[]> {
    return await this.findMany({
      where: {
        area: { contains: area },
        status: 1
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 활성 회사 조회
   */
  async findActiveCompanies(): Promise<Company[]> {
    return await this.findMany({
      where: { status: 1 },
      orderBy: { created_at: 'desc' },
    });
  }
} 