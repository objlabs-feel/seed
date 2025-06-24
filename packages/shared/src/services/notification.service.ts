import type {
  NotificationInfo,
  NotificationMessage,
} from '../types/models';
import type {
  CreateNotificationInfoRequestDto,
  UpdateNotificationInfoRequestDto,
  CreateNotificationMessageRequestDto,
  UpdateNotificationMessageRequestDto,
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';
import { Prisma, type PrismaClient } from '@prisma/client';

interface UpsertPermissionData {
  userId: bigint;
  permission_status: number;
  device_token: string;
  device_type: string;
  device_os: string;
}

interface UpdateSettingsData {
  userId: bigint;
  device_token: string;
  device_type: string;
  device_os: string;
  noti_set: Prisma.JsonObject;
}

/**
 * NotificationInfo 서비스 클래스
 */
export class NotificationService extends BaseService<
  NotificationInfo,
  CreateNotificationInfoRequestDto,
  UpdateNotificationInfoRequestDto
> {
  protected modelName = 'notificationInfo';

  constructor(protected prisma: PrismaClient) {
    super();
  }

  // --- BaseService 추상 메서드 구현 ---

  async create(data: CreateNotificationInfoRequestDto): Promise<NotificationInfo> {
    return this.prisma.notificationInfo.create({ data: this.toPrismaData(data) });
  }

  async createMany(data: CreateNotificationInfoRequestDto[]): Promise<{ count: number; data: NotificationInfo[] }> {
    const result = await this.prisma.notificationInfo.createMany({
      data: data.map(this.toPrismaData),
      skipDuplicates: true,
    });
    // createMany는 생성된 객체를 반환하지 않으므로, 별도 조회가 필요하다면 추가 구현
    return { count: result.count, data: [] };
  }

  async findById(id: string | number): Promise<NotificationInfo | null> {
    // NotificationInfo는 복합 기본 키를 사용하므로 이 메서드는 부적합합니다.
    // 필요 시 복합 키를 인자로 받는 새로운 메서드를 구현해야 합니다.
    throw new Error('findById is not applicable for NotificationInfo due to composite key. Use findUnique instead.');
  }

  async findMany(options?: SearchOptions): Promise<NotificationInfo[]> {
    const query = this.buildQuery(options);
    return this.prisma.notificationInfo.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<NotificationInfo | null> {
    const query = this.buildQuery(options);
    return this.prisma.notificationInfo.findFirst(query);
  }

  async findUnique(where: Prisma.NotificationInfoWhereUniqueInput): Promise<NotificationInfo | null> {
    return this.prisma.notificationInfo.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<NotificationInfo>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    const [data, total] = await Promise.all([
      this.prisma.notificationInfo.findMany({ ...query, skip, take }),
      this.prisma.notificationInfo.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateNotificationInfoRequestDto): Promise<NotificationInfo> {
    // NotificationInfo는 복합 기본 키를 사용하므로 이 메서드는 부적합합니다.
    throw new Error('update is not applicable for NotificationInfo due to composite key. Use update with where clause.');
  }

  async updateMany(where: Prisma.NotificationInfoWhereInput, data: UpdateNotificationInfoRequestDto): Promise<{ count: number }> {
    return this.prisma.notificationInfo.updateMany({ where, data: this.toPrismaData(data) });
  }

  async delete(id: string | number): Promise<NotificationInfo> {
    throw new Error('delete is not applicable for NotificationInfo due to composite key.');
  }

  async deleteMany(where: Prisma.NotificationInfoWhereInput): Promise<{ count: number }> {
    return this.prisma.notificationInfo.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<NotificationInfo> {
    throw new Error('softDelete is not applicable for NotificationInfo due to composite key.');
  }

  async restore(id: string | number): Promise<NotificationInfo> {
    throw new Error('restore is not applicable for NotificationInfo due to composite key.');
  }

  async count(where?: Prisma.NotificationInfoWhereInput): Promise<number> {
    return this.prisma.notificationInfo.count({ where });
  }

  async exists(where: Prisma.NotificationInfoWhereInput): Promise<boolean> {
    const count = await this.prisma.notificationInfo.count({ where });
    return count > 0;
  }

  // --- 커스텀 메서드 ---

  async registerDevice(data: CreateNotificationInfoRequestDto): Promise<NotificationInfo> {
    const prismaData = this.toPrismaData(data);
    const { user_id, device_type, device_os, device_token, permission_status } = prismaData;

    return this.prisma.notificationInfo.upsert({
      where: {
        user_id_device_type_device_os_device_token: {
          user_id,
          device_type,
          device_os,
          device_token,
        },
      },
      update: {
        permission_status,
        updated_at: new Date(),
      },
      create: {
        user_id,
        device_type,
        device_os,
        device_token,
        permission_status,
        noti_notice: 1,
        noti_event: 1,
        noti_sms: 1,
        noti_email: 1,
        noti_auction: 1,
        noti_favorite: 1,
        noti_set: { topics: ['all'] },
      },
    });
  }

  async updateSettings(data: UpdateNotificationInfoRequestDto): Promise<NotificationInfo> {
    const prismaData = this.toPrismaData(data);
    const { user_id, device_type, device_os, device_token, noti_set } = prismaData;

    // 토픽이 비어있으면 'all'을 기본값으로 설정
    if (noti_set && Array.isArray(noti_set.topics) && noti_set.topics.length === 0) {
      noti_set.topics = ['all'];
    }

    return this.prisma.notificationInfo.upsert({
      where: {
        user_id_device_type_device_os_device_token: {
          user_id,
          device_type,
          device_os,
          device_token,
        },
      },
      update: {
        permission_status: 1, // 설정을 변경한다는 것은 권한을 허용한 것으로 간주
        noti_set,
        updated_at: new Date(),
      },
      create: {
        user_id,
        device_type,
        device_os,
        device_token,
        permission_status: 1,
        noti_notice: 1,
        noti_event: 1,
        noti_sms: 1,
        noti_email: 1,
        noti_auction: 1,
        noti_favorite: 1,
        noti_set: noti_set || { topics: ['all'] },
      },
    });
  }

  async upsert(args: Prisma.NotificationInfoUpsertArgs): Promise<NotificationInfo> {
    return this.prisma.notificationInfo.upsert(args);
  }

  private toPrismaData(data: CreateNotificationInfoRequestDto | UpdateNotificationInfoRequestDto): any {
    const prismaData: any = { ...data };
    if (prismaData.user_id) {
      prismaData.user_id = BigInt(prismaData.user_id);
    }
    // device_type, device_os는 route단에서 string으로 넘어올 수 있으므로 number로 변환
    if (typeof prismaData.device_type === 'string') {
      prismaData.device_type = parseInt(prismaData.device_type, 10);
    }
    if (typeof prismaData.device_os === 'string') {
      prismaData.device_os = parseInt(prismaData.device_os, 10);
    }
    return prismaData;
  }
}

/**
 * NotificationMessage 서비스 클래스
 */
export class NotificationMessageService extends BaseService<
  NotificationMessage,
  CreateNotificationMessageRequestDto,
  UpdateNotificationMessageRequestDto
> {
  protected modelName = 'notificationMessage';

  constructor(protected prisma: PrismaClient) {
    super();
  }

  private toPrismaData(data: any): any {
    const prismaData = { ...data };
    if (prismaData.user_id) prismaData.user_id = BigInt(prismaData.user_id);
    if (prismaData.group_id) prismaData.group_id = BigInt(prismaData.group_id);
    return prismaData;
  }

  async create(data: CreateNotificationMessageRequestDto): Promise<NotificationMessage> {
    return this.prisma.notificationMessage.create({ data: this.toPrismaData(data) });
  }

  async createMany(data: CreateNotificationMessageRequestDto[]): Promise<{ count: number; data: NotificationMessage[] }> {
    const result = await this.prisma.notificationMessage.createMany({
      data: data.map(d => this.toPrismaData(d)),
      skipDuplicates: true,
    });
    return { count: result.count, data: [] };
  }

  async findById(id: string | number): Promise<NotificationMessage | null> {
    return this.prisma.notificationMessage.findUnique({ where: { id: BigInt(id) } });
  }

  async findMany(options?: SearchOptions): Promise<NotificationMessage[]> {
    const query = this.buildQuery(options);
    return this.prisma.notificationMessage.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<NotificationMessage | null> {
    const query = this.buildQuery(options);
    return this.prisma.notificationMessage.findFirst(query);
  }

  async findUnique(where: Prisma.NotificationMessageWhereUniqueInput): Promise<NotificationMessage | null> {
    return this.prisma.notificationMessage.findUnique({ where });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<NotificationMessage>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);
    const [data, total] = await Promise.all([
      this.prisma.notificationMessage.findMany({ ...query, skip, take }),
      this.prisma.notificationMessage.count({ where: query.where }),
    ]);
    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateNotificationMessageRequestDto): Promise<NotificationMessage> {
    return this.prisma.notificationMessage.update({ where: { id: BigInt(id) }, data: this.toPrismaData(data) });
  }

  async updateMany(where: Prisma.NotificationMessageWhereInput, data: UpdateNotificationMessageRequestDto): Promise<{ count: number }> {
    return this.prisma.notificationMessage.updateMany({ where, data: this.toPrismaData(data) });
  }

  async delete(id: string | number): Promise<NotificationMessage> {
    return this.prisma.notificationMessage.delete({ where: { id: BigInt(id) } });
  }

  async deleteMany(where: Prisma.NotificationMessageWhereInput): Promise<{ count: number }> {
    return this.prisma.notificationMessage.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<NotificationMessage> {
    return this.prisma.notificationMessage.update({ where: { id: BigInt(id) }, data: { status: 0 } });
  }

  async restore(id: string | number): Promise<NotificationMessage> {
    return this.prisma.notificationMessage.update({ where: { id: BigInt(id) }, data: { status: 1 } });
  }

  async count(where?: Prisma.NotificationMessageWhereInput): Promise<number> {
    return this.prisma.notificationMessage.count({ where });
  }

  async exists(where: Prisma.NotificationMessageWhereInput): Promise<boolean> {
    const count = await this.prisma.notificationMessage.count({ where });
    return count > 0;
  }

  // --- 커스텀 메서드 ---

  async findByUserId(userId: string, options?: SearchOptions): Promise<NotificationMessage[]> {
    const query = this.buildQuery(options);
    query.where = { ...query.where, user_id: BigInt(userId) };
    return this.prisma.notificationMessage.findMany(query);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notificationMessage.count({
      where: {
        user_id: BigInt(userId),
        read_at: null,
      },
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    return this.prisma.notificationMessage.updateMany({
      where: {
        user_id: BigInt(userId),
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });
  }

  async markOneAsRead(id: string | bigint): Promise<NotificationMessage> {
    return this.prisma.notificationMessage.update({
      where: { id: BigInt(id) },
      data: { read_at: new Date() },
    });
  }
} 