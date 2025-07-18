import type { UsedDevice } from '../types/models';
import type {
  CreateUsedDeviceRequestDto,
  UpdateUsedDeviceRequestDto,
  UsedDeviceSearchRequestDto
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';
import { Prisma } from '@prisma/client';

/**
 * UsedDevice 서비스 클래스
 */
export class UsedDeviceService extends BaseService<UsedDevice, CreateUsedDeviceRequestDto, UpdateUsedDeviceRequestDto> {
  protected modelName = 'usedDevice';

  constructor(protected prisma: any) {
    super();
  }

  private toPrismaData(data: CreateUsedDeviceRequestDto | UpdateUsedDeviceRequestDto): any {
    const prismaData: any = { ...data };
    if (prismaData.company_id) prismaData.company_id = BigInt(prismaData.company_id);
    return prismaData;
  }

  async create(data: CreateUsedDeviceRequestDto): Promise<UsedDevice> {
    return this.prisma.usedDevice.create({ data: this.toPrismaData(data) });
  }

  async createMany(data: CreateUsedDeviceRequestDto[]): Promise<{ count: number; data: UsedDevice[] }> {
    const result = await this.prisma.usedDevice.createMany({
      data: data.map(this.toPrismaData),
      skipDuplicates: true,
    });
    return { count: result.count, data: [] }; // createMany는 생성된 객체를 반환하지 않음
  }

  async findById(id: string | number): Promise<UsedDevice | null> {
    return this.prisma.usedDevice.findUnique({
      where: { id: BigInt(id) },
      include: { company: true, department: true, deviceType: true, manufacturer: true },
    });
  }

  async findMany(options?: SearchOptions): Promise<UsedDevice[]> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = { company: true, department: true, deviceType: true, manufacturer: true };
    }
    return this.prisma.usedDevice.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<UsedDevice | null> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = { company: true, department: true, deviceType: true, manufacturer: true };
    }
    return this.prisma.usedDevice.findFirst(query);
  }

  async findUnique(where: Prisma.UsedDeviceWhereUniqueInput): Promise<UsedDevice | null> {
    return this.prisma.usedDevice.findUnique({
      where,
      include: { company: true, department: true, deviceType: true, manufacturer: true },
    });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<UsedDevice>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = { company: true, department: true, deviceType: true, manufacturer: true };
    }
    const [data, total] = await Promise.all([
      this.prisma.usedDevice.findMany({ ...query, skip, take }),
      this.prisma.usedDevice.count({ where: query.where }),
    ]);
    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateUsedDeviceRequestDto): Promise<UsedDevice> {
    return this.prisma.usedDevice.update({
      where: { id: BigInt(id) },
      data: this.toPrismaData(data),
      include: { company: true, department: true, deviceType: true, manufacturer: true },
    });
  }

  async updateMany(where: Prisma.UsedDeviceWhereInput, data: UpdateUsedDeviceRequestDto): Promise<{ count: number }> {
    return this.prisma.usedDevice.updateMany({ where, data: this.toPrismaData(data) });
  }

  async delete(id: string | number): Promise<UsedDevice> {
    return this.prisma.usedDevice.delete({ where: { id: BigInt(id) } });
  }

  async deleteMany(where: Prisma.UsedDeviceWhereInput): Promise<{ count: number }> {
    return this.prisma.usedDevice.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<UsedDevice> {
    return this.prisma.usedDevice.update({
      where: { id: BigInt(id) },
      data: { status: 0 },
      include: { company: true, department: true, deviceType: true, manufacturer: true },
    });
  }

  async restore(id: string | number): Promise<UsedDevice> {
    return this.prisma.usedDevice.update({
      where: { id: BigInt(id) },
      data: { status: 1 },
      include: { company: true, department: true, deviceType: true, manufacturer: true },
    });
  }

  async count(where?: Prisma.UsedDeviceWhereInput): Promise<number> {
    return this.prisma.usedDevice.count({ where });
  }

  async exists(where: Prisma.UsedDeviceWhereInput): Promise<boolean> {
    return (await this.prisma.usedDevice.count({ where })) > 0;
  }

  async search(searchOptions: UsedDeviceSearchRequestDto): Promise<PaginationResult<UsedDevice>> {
    const { page = 1, limit = 10, company_id, department_id, device_type_id, manufacturer_id, status } = searchOptions;
    const skip = (page - 1) * limit;

    const where: Prisma.UsedDeviceWhereInput = {
      status: status ?? undefined,
      company_id: company_id ? BigInt(company_id) : undefined,
      department_id: department_id ?? undefined,
      device_type_id: device_type_id ?? undefined,
      manufacturer_id: manufacturer_id ?? undefined,
    };

    const [data, total] = await Promise.all([
      this.prisma.usedDevice.findMany({
        where,
        include: {
          department: true,
          deviceType: true,
          manufacturer: true,
          company: {
            select: { id: true, name: true, area: true },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.usedDevice.count({ where }),
    ]);

    console.log(data);

    return this.createPaginationResult(data, total, page, limit);
  }
} 