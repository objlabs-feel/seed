import type { PrismaClient } from '@prisma/client';
import { createPrismaClient, setupGracefulShutdown } from '../libs/prisma';
import { AdminService } from './admin.service';
import { UserService, ProfileService } from './user.service';
import { CompanyService } from './company.service';
import { ProductService } from './product.service';
import { DeviceTypeService, DepartmentService, ManufacturerService, DeviceService } from './device.service';
import { SaleItemService, SalesAdminService, SaleItemViewHistoryService, SaleItemCartService, SalesTypeService } from './sale.service';
import { AuctionItemService, AuctionItemHistoryService } from './auction.service';
import { SystemEnvironmentService } from './systemEnvironment.service';
import { NotificationService, NotificationMessageService } from './notification.service';
import { UsedDeviceService } from './usedDevice.service';
import { BaseService } from './base.service';

/**
 * 서비스 매니저 클래스
 * 모든 서비스 인스턴스를 중앙에서 관리합니다.
 * 이 클래스의 인스턴스는 service.manager.ts의 getServiceManager()를 통해
 * 싱글턴으로 생성 및 관리되어야 합니다.
 */
export class ServiceManager {
  private prisma: PrismaClient;
  private services: Map<string, BaseService<any, any, any>> = new Map();

  // 서비스 인스턴스들 (싱글톤으로 관리)
  private _adminService?: AdminService;
  private _userService?: UserService;
  private _profileService?: ProfileService;
  private _companyService?: CompanyService;
  private _productService?: ProductService;
  private _deviceTypeService?: DeviceTypeService;
  private _departmentService?: DepartmentService;
  private _manufacturerService?: ManufacturerService;
  private _deviceService?: DeviceService;
  private _saleItemService?: SaleItemService;
  private _salesAdminService?: SalesAdminService;
  private _saleItemViewHistoryService?: SaleItemViewHistoryService;
  private _saleItemCartService?: SaleItemCartService;
  private _auctionItemService?: AuctionItemService;
  private _auctionItemHistoryService?: AuctionItemHistoryService;
  private _systemEnvironmentService?: SystemEnvironmentService;
  private _salesTypeService?: SalesTypeService;
  private _notificationService?: NotificationService;
  private _notificationMessageService?: NotificationMessageService;
  private _usedDeviceService?: UsedDeviceService;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * AdminService 인스턴스 반환 (지연 초기화)
   */
  public get adminService(): AdminService {
    if (!this._adminService) {
      this._adminService = new AdminService(this.prisma);
    }
    return this._adminService;
  }

  /**
   * UserService 인스턴스 반환 (지연 초기화)
   */
  public get userService(): UserService {
    if (!this._userService) {
      this._userService = new UserService(this.prisma);
    }
    return this._userService;
  }

  /**
   * ProfileService 인스턴스 반환 (지연 초기화)
   */
  public get profileService(): ProfileService {
    if (!this._profileService) {
      this._profileService = new ProfileService(this.prisma);
    }
    return this._profileService;
  }

  /**
   * CompanyService 인스턴스 반환 (지연 초기화)
   */
  public get companyService(): CompanyService {
    if (!this._companyService) {
      this._companyService = new CompanyService(this.prisma);
    }
    return this._companyService;
  }

  /**
   * ProductService 인스턴스 반환 (지연 초기화)
   */
  public get productService(): ProductService {
    if (!this._productService) {
      this._productService = new ProductService(this.prisma);
    }
    return this._productService;
  }

  /**
   * DeviceTypeService 인스턴스 반환 (지연 초기화)
   */
  public get deviceTypeService(): DeviceTypeService {
    if (!this._deviceTypeService) {
      this._deviceTypeService = new DeviceTypeService(this.prisma);
    }
    return this._deviceTypeService;
  }

  /**
   * DepartmentService 인스턴스 반환 (지연 초기화)
   */
  public get departmentService(): DepartmentService {
    if (!this._departmentService) {
      this._departmentService = new DepartmentService(this.prisma);
    }
    return this._departmentService;
  }

  /**
   * ManufacturerService 인스턴스 반환 (지연 초기화)
   */
  public get manufacturerService(): ManufacturerService {
    if (!this._manufacturerService) {
      this._manufacturerService = new ManufacturerService(this.prisma);
    }
    return this._manufacturerService;
  }

  /**
   * DeviceService 인스턴스 반환 (지연 초기화)
   */
  public get deviceService(): DeviceService {
    if (!this._deviceService) {
      this._deviceService = new DeviceService(this.prisma);
    }
    return this._deviceService;
  }

  /**
   * SaleItemService 인스턴스 반환 (지연 초기화)
   */
  public get saleItemService(): SaleItemService {
    if (!this._saleItemService) {
      this._saleItemService = new SaleItemService(this.prisma, this);
    }
    return this._saleItemService;
  }

  /**
   * SalesAdminService 인스턴스 반환 (지연 초기화)
   */
  public get salesAdminService(): SalesAdminService {
    if (!this._salesAdminService) {
      this._salesAdminService = new SalesAdminService(this.prisma);
    }
    return this._salesAdminService;
  }

  /**
   * SaleItemViewHistoryService 인스턴스 반환 (지연 초기화)
   */
  public get saleItemViewHistoryService(): SaleItemViewHistoryService {
    if (!this._saleItemViewHistoryService) {
      this._saleItemViewHistoryService = new SaleItemViewHistoryService(this.prisma, this);
    }
    return this._saleItemViewHistoryService;
  }

  /**
   * SaleItemCartService 인스턴스 반환 (지연 초기화)
   */
  public get saleItemCartService(): SaleItemCartService {
    if (!this._saleItemCartService) {
      this._saleItemCartService = new SaleItemCartService(this.prisma);
    }
    return this._saleItemCartService;
  }

  /**
   * AuctionItemService 인스턴스 반환 (지연 초기화)
   */
  public get auctionItemService(): AuctionItemService {
    if (!this._auctionItemService) {
      this._auctionItemService = new AuctionItemService(this.prisma);
    }
    return this._auctionItemService;
  }

  /**
   * AuctionItemHistoryService 인스턴스 반환 (지연 초기화)
   */
  public get auctionItemHistoryService(): AuctionItemHistoryService {
    if (!this._auctionItemHistoryService) {
      this._auctionItemHistoryService = new AuctionItemHistoryService(this.prisma);
    }
    return this._auctionItemHistoryService;
  }

  /**
   * SystemEnvironmentService 인스턴스 반환 (지연 초기화)
   */
  public get systemEnvironmentService(): SystemEnvironmentService {
    if (!this._systemEnvironmentService) {
      this._systemEnvironmentService = new SystemEnvironmentService(this.prisma);
    }
    return this._systemEnvironmentService;
  }

  /**
   * SalesTypeService 인스턴스 반환 (지연 초기화)
   */
  public get salesTypeService(): SalesTypeService {
    if (!this._salesTypeService) {
      this._salesTypeService = new SalesTypeService(this.prisma);
    }
    return this._salesTypeService;
  }

  /**
   * NotificationService 인스턴스 반환 (지연 초기화)
   */
  public get notificationService(): NotificationService {
    if (!this._notificationService) {
      this._notificationService = new NotificationService(this.prisma);
    }
    return this._notificationService;
  }

  /**
   * NotificationMessageService 인스턴스 반환 (지연 초기화)
   */
  public get notificationMessageService(): NotificationMessageService {
    if (!this._notificationMessageService) {
      this._notificationMessageService = new NotificationMessageService(this.prisma);
    }
    return this._notificationMessageService;
  }

  /**
   * UsedDeviceService 인스턴스 반환 (지연 초기화)
   */
  public get usedDeviceService(): UsedDeviceService {
    if (!this._usedDeviceService) {
      this._usedDeviceService = new UsedDeviceService(this.prisma);
    }
    return this._usedDeviceService;
  }

  /**
   * 모든 서비스 인스턴스를 한번에 반환
   */
  public getAllServices() {
    return {
      adminService: this.adminService,
      userService: this.userService,
      profileService: this.profileService,
      companyService: this.companyService,
      productService: this.productService,
      deviceTypeService: this.deviceTypeService,
      departmentService: this.departmentService,
      manufacturerService: this.manufacturerService,
      deviceService: this.deviceService,
      saleItemService: this.saleItemService,
      salesAdminService: this.salesAdminService,
      saleItemViewHistoryService: this.saleItemViewHistoryService,
      saleItemCartService: this.saleItemCartService,
      auctionItemService: this.auctionItemService,
      auctionItemHistoryService: this.auctionItemHistoryService,
      systemEnvironmentService: this.systemEnvironmentService,
      salesTypeService: this.salesTypeService,
      notification: this.notificationService,
      notificationMessage: this.notificationMessageService,
      usedDevice: this.usedDeviceService,
    };
  }

  /**
   * PrismaClient 인스턴스를 반환하는 유틸리티 함수
   */
  public getPrismaClient() {
    return this.prisma;
  }

  /**
   * 모든 서비스를 미리 로드하여 초기화합니다 (개발 환경용).
   */
  public preloadAllServices(): void {
    this.adminService;
    this.userService;
    this.profileService;
    this.companyService;
    this.productService;
    this.deviceTypeService;
    this.departmentService;
    this.manufacturerService;
    this.deviceService;
    this.saleItemService;
    this.salesAdminService;
    this.saleItemViewHistoryService;
    this.saleItemCartService;
    this.auctionItemService;
    this.auctionItemHistoryService;
    this.systemEnvironmentService;
    this.salesTypeService;
    this.notificationService;
    this.notificationMessageService;
    this.usedDeviceService;
  }

  /**
   * 데이터베이스 연결을 안전하게 종료합니다.
   */
  public async dispose(): Promise<void> {
    if (this.prisma && typeof this.prisma.$disconnect === 'function') {
      await this.prisma.$disconnect();
    }
  }

  registerService(name: string, service: BaseService<any, any, any>) {
    this.services.set(name, service);
  }

  getService(name: string): BaseService<any, any, any> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    return service;
  }
}

// 전역 변수 타입을 선언하여 개발 환경의 Hot Reload에 대응합니다.
declare global {
  var __service_manager_instance: ServiceManager | undefined;
}

export function createAndSetupManager(): ServiceManager {
  const prisma = createPrismaClient();
  const manager = new ServiceManager(prisma);

  // setupGracefulShutdown은 Node.js 환경에서만, 프로세스당 한 번만 실행되어야 합니다.
  // 이 로직이 lazy-loading의 일부이므로, 여기서 런타임을 체크합니다.
  if (process.env.NEXT_RUNTIME !== 'edge') {
    setupGracefulShutdown(prisma);
  }

  // 서비스 등록
  manager.registerService('adminService', manager.adminService);
  manager.registerService('userService', manager.userService);
  manager.registerService('profileService', manager.profileService);
  manager.registerService('companyService', manager.companyService);
  manager.registerService('productService', manager.productService);
  manager.registerService('deviceTypeService', manager.deviceTypeService);
  manager.registerService('departmentService', manager.departmentService);
  manager.registerService('manufacturerService', manager.manufacturerService);
  manager.registerService('deviceService', manager.deviceService);
  manager.registerService('saleItemService', manager.saleItemService);
  manager.registerService('salesAdminService', manager.salesAdminService);
  manager.registerService('saleItemViewHistoryService', manager.saleItemViewHistoryService);
  manager.registerService('saleItemCartService', manager.saleItemCartService);
  manager.registerService('auctionItemService', manager.auctionItemService);
  manager.registerService('auctionItemHistoryService', manager.auctionItemHistoryService);
  manager.registerService('systemEnvironmentService', manager.systemEnvironmentService);
  manager.registerService('salesTypeService', manager.salesTypeService);
  manager.registerService('notificationService', manager.notificationService);
  manager.registerService('notificationMessageService', manager.notificationMessageService);
  manager.registerService('usedDeviceService', manager.usedDeviceService);

  // 개발 환경에서는 빠른 테스트를 위해 미리 로드합니다.
  if (process.env.NODE_ENV === 'development') {
    manager.preloadAllServices();
  }

  return manager;
}

/**
 * 서비스 매니저의 싱글턴 인스턴스를 가져옵니다.
 * 인스턴스가 없으면 첫 호출 시 생성합니다 (Lazy Initialization).
 * 개발/운영 환경 모두 전역 변수를 사용하여 인스턴스를 공유합니다.
 */
export function getServiceManager(): ServiceManager {
  if (!global.__service_manager_instance) {
    global.__service_manager_instance = createAndSetupManager();
  }
  return global.__service_manager_instance;
}

/**
 * 모든 서비스의 묶음을 가져오는 편의 함수
 */
export function getServices() {
  return getServiceManager().getAllServices();
}

/**
 * 개별 서비스 인스턴스를 빠르게 가져오는 변수
 */
export const adminService = getServiceManager().adminService;
export const userService = getServiceManager().userService;
export const profileService = getServiceManager().profileService;
export const companyService = getServiceManager().companyService;
export const productService = getServiceManager().productService;
export const deviceTypeService = getServiceManager().deviceTypeService;
export const departmentService = getServiceManager().departmentService;
export const manufacturerService = getServiceManager().manufacturerService;
export const deviceService = getServiceManager().deviceService;
export const saleItemService = getServiceManager().saleItemService;
export const salesAdminService = getServiceManager().salesAdminService;
export const saleItemViewHistoryService = getServiceManager().saleItemViewHistoryService;
export const saleItemCartService = getServiceManager().saleItemCartService;
export const auctionItemService = getServiceManager().auctionItemService;
export const auctionItemHistoryService = getServiceManager().auctionItemHistoryService;
export const systemEnvironmentService = getServiceManager().systemEnvironmentService;
export const salesTypeService = getServiceManager().salesTypeService;
export const notificationService = getServiceManager().notificationService;
export const notificationMessageService = getServiceManager().notificationMessageService;
export const usedDeviceService = getServiceManager().usedDeviceService;