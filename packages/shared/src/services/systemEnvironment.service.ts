import { SystemEnvironment, Prisma } from '@prisma/client';
import { BaseService, SearchOptions, PaginationResult } from './base.service';
import type { CreateSystemEnvironmentRequestDto, UpdateSystemEnvironmentRequestDto } from '../types/dto';

export class SystemEnvironmentService extends BaseService<
  SystemEnvironment,
  CreateSystemEnvironmentRequestDto,
  UpdateSystemEnvironmentRequestDto
> {
  protected modelName: 'systemEnvironment' = 'systemEnvironment';

  constructor(protected prisma: any) {
    super();
  }

  // SystemEnvironment는 항상 단일 레코드를 유지해야 하므로,
  // 일반적인 CRUD와는 다른 특별한 로직이 필요합니다.
  // BaseService의 메서드들을 이 모델의 특성에 맞게 오버라이드합니다.

  async getOrCreate(): Promise<SystemEnvironment> {
    let env = await this.prisma.systemEnvironment.findFirst();
    if (!env) {
      env = await this.prisma.systemEnvironment.create({
        data: { parameters: {} },
      });
    }
    return env;
  }

  async updateParameters(parameters: Prisma.JsonObject): Promise<SystemEnvironment> {
    const env = await this.getOrCreate();
    return this.prisma.systemEnvironment.update({
      where: { id: env.id },
      data: { parameters },
    });
  }

  // --- BaseService 추상 메서드 구현 ---
  // 이 모델의 특성상 대부분의 메서드는 에러를 던지거나 제한적으로 동작해야 합니다.

  async create(data: CreateSystemEnvironmentRequestDto): Promise<SystemEnvironment> {
    const count = await this.prisma.systemEnvironment.count();
    if (count > 0) {
      throw new Error('SystemEnvironment는 하나만 존재할 수 있습니다. `update`를 사용하세요.');
    }
    return this.prisma.systemEnvironment.create({ data });
  }

  async findById(id: number): Promise<SystemEnvironment | null> {
    return this.prisma.systemEnvironment.findUnique({ where: { id } });
  }

  async findFirst(options?: SearchOptions): Promise<SystemEnvironment | null> {
    const query = this.buildQuery(options);
    return this.prisma.systemEnvironment.findFirst(query);
  }

  async update(id: number, data: UpdateSystemEnvironmentRequestDto): Promise<SystemEnvironment> {
    return this.prisma.systemEnvironment.update({ where: { id }, data });
  }

  // 아래 메서드들은 이 서비스의 컨텍스트에서는 의미가 없거나 위험할 수 있습니다.
  async createMany(data: CreateSystemEnvironmentRequestDto[]): Promise<{ count: number; data: SystemEnvironment[] }> {
    throw new Error("Not implemented for SystemEnvironment");
  }
  async findMany(options?: SearchOptions): Promise<SystemEnvironment[]> {
    const query = this.buildQuery(options);
    return this.prisma.systemEnvironment.findMany(query);
  }
  async findUnique(where: Prisma.SystemEnvironmentWhereUniqueInput): Promise<SystemEnvironment | null> {
    return this.prisma.systemEnvironment.findUnique({ where });
  }
  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<SystemEnvironment>> {
    throw new Error("Not implemented for SystemEnvironment");
  }
  async updateMany(where: Prisma.SystemEnvironmentWhereInput, data: UpdateSystemEnvironmentRequestDto): Promise<{ count: number }> {
    throw new Error("Not implemented for SystemEnvironment");
  }
  async delete(id: number): Promise<SystemEnvironment> {
    throw new Error("Cannot delete SystemEnvironment");
  }
  async deleteMany(where: Prisma.SystemEnvironmentWhereInput): Promise<{ count: number }> {
    throw new Error("Not implemented for SystemEnvironment");
  }
  async softDelete(id: number): Promise<SystemEnvironment> {
    throw new Error("Not implemented for SystemEnvironment");
  }
  async restore(id: number): Promise<SystemEnvironment> {
    throw new Error("Not implemented for SystemEnvironment");
  }
  async count(where?: Prisma.SystemEnvironmentWhereInput): Promise<number> {
    return this.prisma.systemEnvironment.count({ where });
  }
  async exists(where: Prisma.SystemEnvironmentWhereInput): Promise<boolean> {
    const count = await this.prisma.systemEnvironment.count({ where });
    return count > 0;
  }

  async getParameters(): Promise<any> {
    const env = await this.findFirst();
    return env ? env.parameters : {};
  }
}