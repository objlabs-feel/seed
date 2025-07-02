import type {
  AuctionItem,
  AuctionItemHistory,
  Department,
  DeviceType,
} from '../types/models';
import type {
  CreateAuctionItemRequestDto,
  UpdateAuctionItemRequestDto,
  CreateAuctionItemHistoryRequestDto,
  AuctionSearchRequestDto,
  CreateUsedDeviceRequestDto,
  UpdateUsedDeviceRequestDto,
} from '../types/dto';
import { BaseService, type SearchOptions, type PaginationResult } from './base.service';
import { Prisma } from '@prisma/client';
import { getServices, notificationService, ServiceManager } from './service.manager';
import { UsedDeviceService } from './usedDevice.service';

/**
 * AuctionItem 서비스 클래스
 */
export class AuctionItemService extends BaseService<AuctionItem, CreateAuctionItemRequestDto, UpdateAuctionItemRequestDto> {
  protected modelName = 'auctionItem';

  constructor(protected prisma: any) {
    super();
  }

  // 이미 UsedDevice가 있는 경우 경매 상품 생성
  async create(data: CreateAuctionItemRequestDto): Promise<AuctionItem> {
    if (data.device_id === undefined || data.device_id === null) {
      return await this.createWithNewDevice(data);
    }
    return await this.prisma.auctionItem.create({
      data: {
        device_id: BigInt(data.device_id),
        auction_code: data.auction_code,
        quantity: data.quantity || 0,
        status: data.status || 0,
        start_timestamp: data.start_timestamp ? new Date(data.start_timestamp) : undefined,
        auction_timeout: data.auction_timeout ? new Date(data.auction_timeout) : undefined,
        visit_date: data.visit_date ? new Date(data.visit_date) : undefined,
        visit_time: data.visit_time,
      },
      include: {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }
      },
    });
  }

  // UsedDevice가 없는 경우 경매 상품 생성
  async createWithNewDevice(
    data: CreateAuctionItemRequestDto,
  ): Promise<AuctionItem> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayCount = await this.prisma.auctionItem.count({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const [department, deviceType] = await Promise.all([
      this.prisma.department.findUnique({
        where: { id: Number(data.department_id) },
      }),
      this.prisma.deviceType.findUnique({
        where: { id: Number(data.device_type_id) },
      }),
    ]);

    if (!department || !deviceType) {
      throw new Error('진료과 또는 기기 유형 정보를 찾을 수 없습니다.');
    }

    const year = today.getFullYear().toString().slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const sequence = String(todayCount + 1).padStart(2, '0');
    const auction_code = `${department.code}${deviceType.code}${year}${month}${day}${sequence}`;

    const company = await getServices().companyService.create({
      ...data
    });

    console.log('company_id', company.id);
    console.log('data.department_id', data.department_id);
    console.log('data.device_type_id', data.device_type_id);
    console.log('data.manufacturer_id', data.manufacturer_id);
    console.log('data.manufacture_date', data.manufacture_date);
    console.log('data.description', data.description);

    return this.prisma.$transaction(async (tx: any) => {
      const usedDevice = await tx.usedDevice.create({
        data: {
          company_id: company.id,
          department_id: Number(data.department_id),
          device_type_id: Number(data.device_type_id),
          manufacturer_id: data.manufacturer_id ? Number(data.manufacturer_id) : null,
          manufacture_date: data.manufacture_date
            ? new Date(data.manufacture_date)
            : undefined,
          description: data.description,
        },
      });

      const auctionItem = await tx.auctionItem.create({
        data: {
          device_id: usedDevice.id,
          auction_code,
          status: 0,
          expired_count: 0,
        },
        include: {
          device: true,
        },
      });

      return auctionItem;
    });
  }

  async createMany(data: CreateAuctionItemRequestDto[]): Promise<{ count: number; data: AuctionItem[] }> {
    const result = await this.prisma.auctionItem.createMany({
      data: data.map(item => ({
        device_id: item.device_id ? BigInt(item.device_id) : null,
        auction_code: item.auction_code,
        quantity: item.quantity || 0,
        status: item.status || 0,
        start_timestamp: item.start_timestamp ? new Date(item.start_timestamp) : undefined,
        auction_timeout: item.auction_timeout ? new Date(item.auction_timeout) : undefined,
        visit_date: item.visit_date ? new Date(item.visit_date) : undefined,
        visit_time: item.visit_time,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.auctionItem.findMany({
      include: {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: result.count,
    });

    return { count: result.count, data: createdData };
  }

  async findById(id: string | number): Promise<AuctionItem | null> {
    return await this.prisma.auctionItem.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        },
        auction_item_history: {
          orderBy: { created_at: 'desc' },
        }
      },
    });
  }

  async findMany(options?: SearchOptions): Promise<AuctionItem[]> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }        
      };
    }
    return await this.prisma.auctionItem.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<AuctionItem | null> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }
      };
    }
    return await this.prisma.auctionItem.findFirst(query);
  }

  async findUnique(where: any): Promise<AuctionItem | null> {
    return await this.prisma.auctionItem.findUnique({
      where,
      include: {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }
      },
    });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<AuctionItem>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    if (!query.include) {
      query.include = {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.auctionItem.findMany({ ...query, skip, take }),
      this.prisma.auctionItem.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: UpdateAuctionItemRequestDto): Promise<AuctionItem> {
    const updateData: any = {};

    if (data.device_id !== undefined) updateData.device_id = BigInt(data.device_id);
    if (data.auction_code !== undefined) updateData.auction_code = data.auction_code;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.accept_id !== undefined) updateData.accept_id = data.accept_id ? BigInt(data.accept_id) : null;
    if (data.seller_steps !== undefined) updateData.seller_steps = data.seller_steps;
    if (data.buyer_steps !== undefined) updateData.buyer_steps = data.buyer_steps;
    if (data.seller_timeout !== undefined) updateData.seller_timeout = data.seller_timeout ? new Date(data.seller_timeout) : null;
    if (data.buyer_timeout !== undefined) updateData.buyer_timeout = data.buyer_timeout ? new Date(data.buyer_timeout) : null;
    if (data.start_timestamp !== undefined) updateData.start_timestamp = data.start_timestamp ? new Date(data.start_timestamp) : null;
    if (data.expired_count !== undefined) updateData.expired_count = data.expired_count;
    if (data.auction_timeout !== undefined) updateData.auction_timeout = data.auction_timeout ? new Date(data.auction_timeout) : null;
    if (data.visit_date !== undefined) updateData.visit_date = data.visit_date ? new Date(data.visit_date) : null;
    if (data.visit_time !== undefined) updateData.visit_time = data.visit_time;

    return await this.prisma.auctionItem.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
      include: {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }
      },
    });
  }

  async updateAuctionWithDevice(
    id: bigint,
    auctionData: UpdateAuctionItemRequestDto,
    deviceData?: Partial<UpdateUsedDeviceRequestDto>
  ): Promise<AuctionItem> {
    return this.prisma.$transaction(async (tx: any) => {
      const auctionItem = await tx.auctionItem.findUnique({
        where: { id },
        include: { device: true },
      });

      if (!auctionItem) {
        throw new Error('존재하지 않는 경매 상품입니다.');
      }

      // 2. usedDevice (device) 선택적 수정
      if (deviceData && auctionItem.device) {
        const deviceUpdateData: Partial<UpdateUsedDeviceRequestDto> = {};
        if (deviceData.company_id !== undefined) deviceUpdateData.company_id = deviceData.company_id;
        if (deviceData.department_id !== undefined) deviceUpdateData.department_id = deviceData.department_id;
        if (deviceData.device_type_id !== undefined) deviceUpdateData.device_type_id = deviceData.device_type_id;
        if (deviceData.manufacturer_id !== undefined) deviceUpdateData.manufacturer_id = deviceData.manufacturer_id;
        if (deviceData.manufacture_date !== undefined) deviceUpdateData.manufacture_date = deviceData.manufacture_date;
        if (deviceData.images !== undefined) deviceUpdateData.images = deviceData.images;
        if (deviceData.description !== undefined) deviceUpdateData.description = deviceData.description;

        if (Object.keys(deviceUpdateData).length > 0) {
          await tx.usedDevice.update({
            where: { id: auctionItem.device.id },
            data: deviceUpdateData,
          });
        }
      }

      // 3. auction_item 선택적 수정
      const auctionUpdateData: Partial<UpdateAuctionItemRequestDto> = {};
      if (auctionData.auction_code !== undefined) auctionUpdateData.auction_code = auctionData.auction_code;
      if (auctionData.status !== undefined) auctionUpdateData.status = auctionData.status;
      if (auctionData.start_timestamp !== undefined) auctionUpdateData.start_timestamp = auctionData.start_timestamp;
      if (auctionData.expired_count !== undefined) auctionUpdateData.expired_count = auctionData.expired_count;

      const updatedAuctionItem = await tx.auctionItem.update({
        where: { id },
        data: auctionUpdateData,
        include: {
          device: {
            include: {
              department: true,
              deviceType: true,
              manufacturer: true,
              company: true,
            },
          },
        },
      });

      return updatedAuctionItem;
    });
  }

  async updateMany(where: any, data: UpdateAuctionItemRequestDto): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.device_id !== undefined) updateData.device_id = BigInt(data.device_id);
    if (data.auction_code !== undefined) updateData.auction_code = data.auction_code;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.accept_id !== undefined) updateData.accept_id = data.accept_id ? BigInt(data.accept_id) : null;
    if (data.seller_steps !== undefined) updateData.seller_steps = data.seller_steps;
    if (data.buyer_steps !== undefined) updateData.buyer_steps = data.buyer_steps;
    if (data.expired_count !== undefined) updateData.expired_count = data.expired_count;

    return await this.prisma.auctionItem.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<AuctionItem> {
    return await this.prisma.auctionItem.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.auctionItem.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<AuctionItem> {
    return await this.prisma.auctionItem.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
      include: {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }
      },
    });
  }

  async restore(id: string | number): Promise<AuctionItem> {
    return await this.prisma.auctionItem.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
      include: {
        device: {
          include: {
            company: true,
            department: true,
            deviceType: true,
            manufacturer: true,
          }
        }
      },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.auctionItem.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.auctionItem.count({ where });
    return count > 0;
  }

  /**
   * 입금확인 처리
   * 경매 상품의 입금을 확인하고 buyer_steps를 3으로 업데이트
   */
  async confirm(id: string | number): Promise<AuctionItem> {
    const auctionItem = await this.prisma.auctionItem.update({
      where: {
        id: typeof id === 'string' ? BigInt(id) : BigInt(id)
      },
      data: {
        status: 2,
        buyer_steps: 3,
        seller_steps: 3
      },
      include: {
        device: {
          include: {
            company: {
              include: {
                profile: true,
              }
            },
            department: true,
            deviceType: true,
            manufacturer: true
          }
        },
        auction_item_history: {
          orderBy: { value: 'desc' }
        }
      }
    });

    return auctionItem;
  }

  /**
   * 경매 검색
   */
  async search(searchOptions: AuctionSearchRequestDto): Promise<PaginationResult<AuctionItem>> {
    const {
      device_id,
      auction_code,
      status,
      start_date,
      end_date,
      company_id,
      device_type_id,
      manufacturer_id,
      ...paginationOptions
    } = searchOptions;

    const where: any = {};

    if (device_id) {
      where.device_id = BigInt(device_id);
    }

    if (auction_code) {
      where.auction_code = { contains: auction_code };
    }

    if (status !== undefined) {
      where.status = status;
    }

    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.lte = new Date(end_date + 'T23:59:59');
      }
    }

    if (company_id || device_type_id || manufacturer_id) {
      where.device = {};
      if (company_id) {
        where.device.company_id = BigInt(company_id);
      }
      if (device_type_id) {
        where.device.device_type_id = device_type_id;
      }
      if (manufacturer_id) {
        where.device.manufacturer_id = manufacturer_id;
      }
    }

    return await this.findWithPagination({
      ...paginationOptions,
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 진행중인 경매만 조회
   */
  async findActiveAuctions(): Promise<AuctionItem[]> {
    return await this.findMany({
      where: { status: { in: [0, 1] } }, // 진행중 상태들
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 경매 코드로 조회
   */
  async findByAuctionCode(auctionCode: string): Promise<AuctionItem | null> {
    return await this.findUnique({ auction_code: auctionCode });
  }

  /**
   * 스케줄러: 만료된 경매 처리
   */
  async processExpiredAuctions(): Promise<{ updatedCount: number }> {
    const DAY_30 = 1000 * 60 * 60 * 24 * 30;
    const DAY_1 = 1000 * 60 * 60 * 24;
    const currentTime = new Date();

    const expiredAuctions = await this.prisma.auctionItem.findMany({
      where: {
        start_timestamp: {
          lte: currentTime,
          gte: new Date(currentTime.getTime() - DAY_30),
        },
        expired_count: { lt: 3 },
        status: 0,
        accept_id: null,
      },
    });

    for (const auction of expiredAuctions) {
      const startTimestamp = auction.start_timestamp || new Date();
      let updateData: Partial<UpdateAuctionItemRequestDto> = {};

      switch (auction.expired_count) {
        case 1:
          updateData = {
            start_timestamp: new Date(startTimestamp.getTime() + DAY_30).toISOString(),
            expired_count: 2,
          };
          break;
        case 2:
          updateData = {
            expired_count: 3,
            status: 3,
          };
          break;
        default:
          updateData = {
            start_timestamp: new Date(startTimestamp.getTime() + DAY_1).toISOString(),
            expired_count: 1,
          };
          break;
      }
      await this.update(auction.id, updateData);
    }
    return { updatedCount: expiredAuctions.length };
  }

  /**
   * 스케줄러: 구매자가 확정하지 않아 유찰된 경매 처리
   */
  async revertUnconfirmedAuctions(): Promise<{ updatedCount: number }> {
    const DAY_1 = 1000 * 60 * 60 * 24;
    const currentTime = new Date();

    const expiredAuctions = await this.prisma.auctionItem.findMany({
      where: {
        buyer_timeout: {
          lte: currentTime,
          gte: new Date(currentTime.getTime() - DAY_1),
        },
        buyer_steps: { lte: 2 },
        seller_steps: 2,
        status: 1,
        accept_id: { not: null },
      },
    });

    const updateData: Partial<UpdateAuctionItemRequestDto> = {
      buyer_steps: 1,
      seller_steps: 1,
      accept_id: null,
      status: 0,
    };

    const idsToUpdate = expiredAuctions.map((a: AuctionItem) => a.id);
    if (idsToUpdate.length > 0) {
      await this.updateMany({ id: { in: idsToUpdate } }, updateData);
    }

    return { updatedCount: expiredAuctions.length };
  }
}

/**
 * AuctionItemHistory 서비스 클래스
 */
export class AuctionItemHistoryService extends BaseService<AuctionItemHistory, CreateAuctionItemHistoryRequestDto, any> {
  protected modelName = 'auctionItemHistory';

  constructor(protected prisma: any) {
    super();
  }

  async create(data: CreateAuctionItemHistoryRequestDto): Promise<AuctionItemHistory> {
    return await this.prisma.auctionItemHistory.create({
      data: {
        auction_item_id: BigInt(data.auction_item_id),
        user_id: BigInt(data.user_id),
        value: data.value,
        status: data.status || 1,
      },
      include: {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      },
    });
  }

  async createMany(data: CreateAuctionItemHistoryRequestDto[]): Promise<{ count: number; data: AuctionItemHistory[] }> {
    const result = await this.prisma.auctionItemHistory.createMany({
      data: data.map(item => ({
        auction_item_id: BigInt(item.auction_item_id),
        user_id: BigInt(item.user_id),
        value: item.value,
        status: item.status || 1,
      })),
      skipDuplicates: true,
    });

    const createdData = await this.prisma.auctionItemHistory.findMany({
      include: {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: result.count,
    });

    return { count: result.count, data: createdData };
  }

  async findById(id: string | number): Promise<AuctionItemHistory | null> {
    return await this.prisma.auctionItemHistory.findUnique({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      include: {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      },
    });
  }

  async findMany(options?: SearchOptions): Promise<AuctionItemHistory[]> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      };
    }
    return await this.prisma.auctionItemHistory.findMany(query);
  }

  async findFirst(options?: SearchOptions): Promise<AuctionItemHistory | null> {
    const query = this.buildQuery(options);
    if (!query.include) {
      query.include = {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      };
    }
    return await this.prisma.auctionItemHistory.findFirst(query);
  }

  async findUnique(where: any): Promise<AuctionItemHistory | null> {
    return await this.prisma.auctionItemHistory.findUnique({
      where,
      include: {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      },
    });
  }

  async findWithPagination(options?: SearchOptions): Promise<PaginationResult<AuctionItemHistory>> {
    const { page, limit, skip, take } = this.getDefaultPagination(options);
    const query = this.buildQuery(options);

    if (!query.include) {
      query.include = {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.auctionItemHistory.findMany({ ...query, skip, take }),
      this.prisma.auctionItemHistory.count({ where: query.where }),
    ]);

    return this.createPaginationResult(data, total, page, limit);
  }

  async update(id: string | number, data: any): Promise<AuctionItemHistory> {
    const updateData: any = {};

    if (data.auction_item_id !== undefined) updateData.auction_item_id = BigInt(data.auction_item_id);
    if (data.user_id !== undefined) updateData.user_id = BigInt(data.user_id);
    if (data.value !== undefined) updateData.value = data.value;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.auctionItemHistory.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: updateData,
      include: {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      },
    });
  }

  async updateMany(where: any, data: any): Promise<{ count: number }> {
    const updateData: any = {};

    if (data.auction_item_id !== undefined) updateData.auction_item_id = BigInt(data.auction_item_id);
    if (data.user_id !== undefined) updateData.user_id = BigInt(data.user_id);
    if (data.value !== undefined) updateData.value = data.value;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.auctionItemHistory.updateMany({ where, data: updateData });
  }

  async delete(id: string | number): Promise<AuctionItemHistory> {
    return await this.prisma.auctionItemHistory.delete({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.prisma.auctionItemHistory.deleteMany({ where });
  }

  async softDelete(id: string | number): Promise<AuctionItemHistory> {
    return await this.prisma.auctionItemHistory.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 0 },
      include: {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      },
    });
  }

  async restore(id: string | number): Promise<AuctionItemHistory> {
    return await this.prisma.auctionItemHistory.update({
      where: { id: typeof id === 'string' ? BigInt(id) : BigInt(id) },
      data: { status: 1 },
      include: {
        auction_item: {
          include: {
            device: {
              include: {
                company: true,
                department: true,
                deviceType: true,
                manufacturer: true,
              }
            }
          }
        }
      },
    });
  }

  async count(where?: any): Promise<number> {
    return await this.prisma.auctionItemHistory.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.prisma.auctionItemHistory.count({ where });
    return count > 0;
  }

  /**
   * 특정 경매의 입찰 이력 조회
   */
  async findByAuctionId(auctionItemId: string): Promise<AuctionItemHistory[]> {
    return await this.findMany({
      where: { auction_item_id: BigInt(auctionItemId) },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 특정 사용자의 입찰 이력 조회
   */
  async findByUserId(userId: string, options?: {
    onlyActiveAuctions?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<AuctionItemHistory[]> {
    const where: any = { user_id: BigInt(userId) };

    // 진행중인 경매만 조회
    if (options?.onlyActiveAuctions) {
      where.auction_item = {
        status: { in: [0, 1] }
      };
    }

    // 날짜 범위 필터링
    if (options?.startDate || options?.endDate) {
      where.created_at = {};
      if (options.startDate) {
        where.created_at.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        where.created_at.lte = new Date(options.endDate + 'T23:59:59');
      }
    }

    return await this.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * 특정 경매의 최고 입찰가 조회
   */
  async getHighestBid(auctionItemId: string): Promise<AuctionItemHistory | null> {
    return await this.findFirst({
      where: {
        auction_item_id: BigInt(auctionItemId),
        status: 1
      },
      orderBy: { value: 'desc' },
    });
  }

  /**
   * 특정 경매의 입찰 통계
   */
  async getAuctionBidStatistics(auctionItemId: string): Promise<{
    bidCount: number;
    highestBid: number | null;
    averageBid: number | null;
    uniqueBidders: number;
  }> {
    const histories = await this.findByAuctionId(auctionItemId);

    const bidCount = histories.length;
    const values = histories.map(h => h.value || 0).filter(v => v > 0);
    const highestBid = values.length > 0 ? Math.max(...values) : null;
    const averageBid = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    const uniqueBidders = new Set(histories.map(h => h.user_id.toString())).size;

    return {
      bidCount,
      highestBid,
      averageBid,
      uniqueBidders,
    };
  }

  /**
   * 경매에 대한 입찰을 생성합니다.
   * 트랜잭션 내에서 실행되어야 합니다.
   * @param data - 입찰 생성 데이터
   * @returns 생성된 입찰, 경매 아이템, 최고 입찰자 정보
   */
  async createBid({ auctionId, userId, value }: { auctionId: number, userId: number, value: number }) {
    return this.prisma.$transaction(async (tx: any) => {
      // 1. 경매 아이템 조회 (락 설정)
      const auctionItem = await tx.auctionItem.findUnique({
        where: { id: auctionId },
        include: { device: true }, // 'usedDevice' -> 'device' 로 수정
      });

      if (!auctionItem) {
        throw new Error('경매 정보를 찾을 수 없습니다.');
      }
      if (auctionItem.status !== 0) { // 0: ACTIVE
        throw new Error('진행중인 경매가 아닙니다.');
      }

      // 2. 최고 입찰가 확인
      const highestBid = await tx.auctionItemHistory.findFirst({
        where: { auction_item_id: auctionId },
        orderBy: { value: 'desc' },
      });

      if (highestBid && value <= highestBid.value) {
        throw new Error('최고 입찰가보다 높은 금액을 입력해야 합니다.');
      }

      // 4. 사용자 프로필 조회
      // 'user_id' 필드는 Profile 모델에 존재하지 않음. user 관계를 통해 조회
      const userProfile = await tx.profile.findFirst({ where: { user: { id: userId } } });

      if (!userProfile) {
        throw new Error('프로필을 찾을 수 없습니다.');
      }

      const info = {
        user: { id: userId, name: userProfile.name },
        device: auctionItem.device,
      };

      // 5. 경매 기록 생성
      // 'info' 필드는 AuctionItemHistory 모델에 존재하지 않으므로 제거
      const newHistory = await tx.auctionItemHistory.create({
        data: {
          auction_item_id: auctionId,
          user_id: userId,
          value: value,
          status: 1,
        },
      });

      // 6. 경매 아이템 업데이트 (현재 최고가 등)
      await tx.auctionItem.update({
        where: { id: auctionId },
        data: {
          status: 1,
          accept_id: highestBid ? highestBid.user_id : null,
          seller_steps: 1,
          buyer_steps: 1,
          seller_timeout: new Date(Date.now() + 300000),
          buyer_timeout: new Date(Date.now() + 300000),
        },
      });

      return {
        bid: newHistory,
        auctionItem,
        highestBidder: { profile: userProfile, company: auctionItem.device.company },
      };
    });
  }
}