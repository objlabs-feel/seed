import type { Device, DeviceType, Department, Manufacturer, DepartmentToDeviceType } from '../types/models';
import type {
  CreateDeviceRequestDto,
  UpdateDeviceRequestDto,
  DeviceSearchRequestDto,
  CreateDeviceTypeRequestDto,
  UpdateDeviceTypeRequestDto,
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
  CreateManufacturerRequestDto,
  UpdateManufacturerRequestDto,
  CreateDepartmentToDeviceTypeRequestDto,
  UpdateDepartmentToDeviceTypeRequestDto
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';

/**
 * DeviceType 서비스 클래스
 */
export class DeviceTypeService extends BaseService<DeviceType, CreateDeviceTypeRequestDto, UpdateDeviceTypeRequestDto> {
  protected modelName = 'deviceType';

  constructor(protected prisma: any) {
    super();
  }

  async create(data: CreateDeviceTypeRequestDto): Promise<DeviceType> {
    return await this.prisma.deviceType.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        img: data.img,
        sort_key: data.sort_key,
        status: data.status || 1,
      },
    });
  }

  async createMany(data: CreateDeviceTypeRequestDto[]): Promise<{ count: number; data: DeviceType[] }> {
    const result = await this.prisma.deviceType.createMany({
      data: data.map(item => ({
        code: item.code,
        name: item.name,
        description: item.description,
        img: item.img,
        sort_key: item.sort_key,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.deviceType.findMany({
      orderBy: { id: 'desc' },
      take: result.count,
    });

    return { count: result.count, data: createdData };
  }

  async findById(id: string | number): Promise<DeviceType | null> {
    return await this.prisma.deviceType.findUnique({
      where: { id: Number(id) },
    });
  }

  async findMany(options?: SearchOptions): Promise<DeviceType[]> {
    const query = this.buildQuery(options);
    return await this.prisma.deviceType.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<DeviceType | null> {
    const query = this.buildQuery(options);
    return await this.prisma.deviceType.findFirst(query);
  }

  async findUnique(where: any): Promise<DeviceType | null> {
    return await this.prisma.deviceType.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<DeviceType>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [data, total] = await Promise.all([
      this.prisma.deviceType.findMany({ ...query, skip, take }),
      this.prisma.deviceType.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateDeviceTypeRequestDto): Promise<DeviceType> {
    const updateData: any = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.img !== undefined) updateData.img = data.img;
    if (data.sort_key !== undefined) updateData.sort_key = data.sort_key;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.deviceType.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  async updateMany(where: any, data: UpdateDeviceTypeRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.img !== undefined) updateData.img = data.img;
    if (data.sort_key !== undefined) updateData.sort_key = data.sort_key;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.deviceType.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<DeviceType> {
    return await this.prisma.deviceType.delete({
      where: { id: Number(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.deviceType.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<DeviceType> {
    return await this.prisma.deviceType.update({
      where: { id: Number(id) },
      data: { status: 0 },
    });
  }

  async restore(id: string | number): Promise<DeviceType> {
    return await this.prisma.deviceType.update({
      where: { id: Number(id) },
      data: { status: 1 },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.deviceType.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.deviceType.count({ where });
    return count > 0;
  }

  /**
   * 정렬 순서로 기기 타입 조회
   */
  async findBySortOrder(): Promise<DeviceType[]> {
    return await this.findMany({
      where: { status: 1 },
      orderBy: { sort_key: 'asc' },
    });
  }

  async deleteDepartmentToDeviceTypeMany(where: any): Promise<{ count: number }> {
    return await this.prisma.departmentToDeviceType.deleteMany({ where });
  }

  async createDepartmentToDeviceTypeMany(data: any[]): Promise<{ count: number }> {
    return await this.prisma.departmentToDeviceType.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async countDepartmentToDeviceType(where?: any): Promise<number> {
    return await this.prisma.departmentToDeviceType.count({ where });
  }
}

/**
 * Department 서비스 클래스
 */
export class DepartmentService extends BaseService<Department, CreateDepartmentRequestDto, UpdateDepartmentRequestDto> {
  protected modelName = 'department';

  constructor(protected prisma: any) {
    super();
  }

  async create(data: CreateDepartmentRequestDto): Promise<Department> {
    return await this.prisma.department.create({
      data: {
        code: data.code,
        name: data.name,
        img: data.img,
        description: data.description,
        sort_key: data.sort_key,
        status: data.status || 1,
      },
    });
  }

  async createMany(data: CreateDepartmentRequestDto[]): Promise<{ count: number; data: Department[] }> {
    const result = await this.prisma.department.createMany({
      data: data.map(item => ({
        code: item.code,
        name: item.name,
        img: item.img,
        description: item.description,
        sort_key: item.sort_key,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.department.findMany({
      orderBy: { id: 'desc' },
      take: result.count,
    });

    return { count: result.count, data: createdData };
  }

  async findById(id: string | number): Promise<Department | null> {
    return await this.prisma.department.findUnique({
      where: { id: Number(id) },
    });
  }

  async findMany(options?: SearchOptions): Promise<Department[]> {
    const query = this.buildQuery(options);
    return await this.prisma.department.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<Department | null> {
    const query = this.buildQuery(options);
    return await this.prisma.department.findFirst(query);
  }

  async findUnique(where: any): Promise<Department | null> {
    return await this.prisma.department.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<Department>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({ ...query, skip, take }),
      this.prisma.department.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateDepartmentRequestDto): Promise<Department> {
    const updateData: any = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.img !== undefined) updateData.img = data.img;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sort_key !== undefined) updateData.sort_key = data.sort_key;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.department.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  async updateMany(where: any, data: UpdateDepartmentRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.img !== undefined) updateData.img = data.img;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sort_key !== undefined) updateData.sort_key = data.sort_key;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.department.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<Department> {
    return await this.prisma.department.delete({
      where: { id: Number(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.department.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<Department> {
    return await this.prisma.department.update({
      where: { id: Number(id) },
      data: { status: 0 },
    });
  }

  async restore(id: string | number): Promise<Department> {
    return await this.prisma.department.update({
      where: { id: Number(id) },
      data: { status: 1 },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.department.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.department.count({ where });
    return count > 0;
  }

  /**
   * 정렬 순서로 부서 조회
   */
  async findBySortOrder(): Promise<Department[]> {
    return await this.findMany({
      where: { status: 1 },
      orderBy: { sort_key: 'asc' },
    });
  }
}

/**
 * Manufacturer 서비스 클래스
 */
export class ManufacturerService extends BaseService<Manufacturer, CreateManufacturerRequestDto, UpdateManufacturerRequestDto> {
  protected modelName = 'manufacturer';

  constructor(protected prisma: any) {
    super();
  }

  async create(data: CreateManufacturerRequestDto): Promise<Manufacturer> {
    return await this.prisma.manufacturer.create({
      data: {
        name: data.name,
        device_types: data.device_types,
        img: data.img,
        description: data.description,
        status: data.status || 1,
      },
    });
  }

  async createMany(data: CreateManufacturerRequestDto[]): Promise<{ count: number; data: Manufacturer[] }> {
    const result = await this.prisma.manufacturer.createMany({
      data: data.map(item => ({
        name: item.name,
        device_types: item.device_types,
        img: item.img,
        description: item.description,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.manufacturer.findMany({
      orderBy: { id: 'desc' },
      take: result.count,
    });

    return { count: result.count, data: createdData };
  }

  async findById(id: string | number): Promise<Manufacturer | null> {
    return await this.prisma.manufacturer.findUnique({
      where: { id: Number(id) },
    });
  }

  async findMany(options?: SearchOptions): Promise<Manufacturer[]> {
    const query = this.buildQuery(options);
    return await this.prisma.manufacturer.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<Manufacturer | null> {
    const query = this.buildQuery(options);
    return await this.prisma.manufacturer.findFirst(query);
  }

  async findUnique(where: any): Promise<Manufacturer | null> {
    return await this.prisma.manufacturer.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<Manufacturer>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [data, total] = await Promise.all([
      this.prisma.manufacturer.findMany({ ...query, skip, take }),
      this.prisma.manufacturer.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateManufacturerRequestDto): Promise<Manufacturer> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.device_types !== undefined) updateData.device_types = data.device_types;
    if (data.img !== undefined) updateData.img = data.img;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.manufacturer.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  async updateMany(where: any, data: UpdateManufacturerRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.device_types !== undefined) updateData.device_types = data.device_types;
    if (data.img !== undefined) updateData.img = data.img;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.manufacturer.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<Manufacturer> {
    return await this.prisma.manufacturer.delete({
      where: { id: Number(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.manufacturer.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<Manufacturer> {
    return await this.prisma.manufacturer.update({
      where: { id: Number(id) },
      data: { status: 0 },
    });
  }

  async restore(id: string | number): Promise<Manufacturer> {
    return await this.prisma.manufacturer.update({
      where: { id: Number(id) },
      data: { status: 1 },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.manufacturer.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.manufacturer.count({ where });
    return count > 0;
  }
}

/**
 * Device 서비스 클래스
 */
export class DeviceService extends BaseService<Device, CreateDeviceRequestDto, UpdateDeviceRequestDto> {
  protected modelName = 'device';

  constructor(protected prisma: any) {
    super();
  }

  async create(data: CreateDeviceRequestDto): Promise<Device> {
    return await this.prisma.device.create({
      data: {
        manufacturer_id: data.manufacturer_id ? Number(data.manufacturer_id) : null,
        device_type: data.device_type,
        media: data.media,
        info: data.info,
        version: data.version,
        description: data.description,
        status: data.status || 1,
      },
      include: {
        manufacturer: true,
        deviceType: true,
      },
    });
  }

  async createMany(data: CreateDeviceRequestDto[]): Promise<{ count: number; data: Device[] }> {
    const result = await this.prisma.device.createMany({
      data: data.map(item => ({
        manufacturer_id: item.manufacturer_id ? Number(item.manufacturer_id) : null,
        device_type: item.device_type,
        media: item.media,
        info: item.info,
        version: item.version,
        description: item.description,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.device.findMany({
      include: {
        manufacturer: true,
        deviceType: true,
      },
      orderBy: { created_at: 'desc' },
      take: result.count,
    });

    return { count: result.count, data: createdData };
  }

  async findById(id: string | number): Promise<Device | null> {
    return await this.prisma.device.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: {
        manufacturer: true,
        deviceType: true,
      },
    });
  }

  async findMany(options?: SearchOptions): Promise<Device[]> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        manufacturer: true,
        deviceType: true,
      };
    }
    return await this.prisma.device.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<Device | null> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        manufacturer: true,
        deviceType: true,
      };
    }
    return await this.prisma.device.findFirst(query);
  }

  async findUnique(where: any): Promise<Device | null> {
    return await this.prisma.device.findUnique({
      where,
      include: {
        manufacturer: true,
        deviceType: true,
      },
    });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<Device>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    if (!query.include) {
      query.include = {
        manufacturer: true,
        deviceType: true,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.device.findMany({ ...query, skip, take }),
      this.prisma.device.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateDeviceRequestDto): Promise<Device> {
    const updateData: any = {};

    if (data.manufacturer_id !== undefined) updateData.manufacturer_id = data.manufacturer_id ? Number(data.manufacturer_id) : null;
    if (data.device_type !== undefined) updateData.device_type = data.device_type;
    if (data.media !== undefined) updateData.media = data.media;
    if (data.info !== undefined) updateData.info = data.info;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.device.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
      include: {
        manufacturer: true,
        deviceType: true,
      },
    });
  }

  async updateMany(where: any, data: UpdateDeviceRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.manufacturer_id !== undefined) updateData.manufacturer_id = data.manufacturer_id ? Number(data.manufacturer_id) : null;
    if (data.device_type !== undefined) updateData.device_type = data.device_type;
    if (data.media !== undefined) updateData.media = data.media;
    if (data.info !== undefined) updateData.info = data.info;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.device.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<Device> {
    return await this.prisma.device.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.device.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<Device> {
    return await this.prisma.device.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
      include: {
        manufacturer: true,
        deviceType: true,
      },
    });
  }

  async restore(id: string | number): Promise<Device> {
    return await this.prisma.device.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
      include: {
        manufacturer: true,
        deviceType: true,
      },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.device.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.device.count({ where });
    return count > 0;
  }

  /**
   * 기기 검색
   */
  async search(searchOptions: DeviceSearchRequestDto): Promise<PaginationResult<Device>> {
    const { keyword, status, manufacturer_id, device_type, version, ...paginationOptions } = searchOptions;

    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }

    if (manufacturer_id) {
      where.manufacturer_id = Number(manufacturer_id);
    }

    if (device_type !== undefined) {
      where.device_type = device_type;
    }

    if (version !== undefined) {
      where.version = version;
    }

    if (keyword) {
      where.OR = [
        { description: { contains: keyword } },
        { manufacturer: { name: { contains: keyword } } },
        { deviceType: { name: { contains: keyword } } },
      ];
    }

    return await this.findWithPagination({
      ...paginationOptions,
      where,
      orderBy: { created_at: 'desc' },
    });
  }
} 