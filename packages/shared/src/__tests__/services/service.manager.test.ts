/**
 * ServiceManager & ServiceFactory 테스트
 * 서비스 관리 시스템의 싱글톤 패턴과 팩토리 패턴을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ServiceManager } from '../../services/service.manager';
import { ServiceFactory } from '../../services/service.factory';
import { createPrismaMock, setupCommonMocks } from '../mocks/prisma.mock';
import type { PrismaClient } from '@prisma/client';

// Mock PrismaClient
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $transaction: jest.fn(),
  admin: {
    aggregate: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    groupBy: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
  },
  company: {
    aggregate: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    groupBy: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
  },
  product: {
    aggregate: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    groupBy: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
  },
  profile: {
    aggregate: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    groupBy: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
  },
  user: {
    aggregate: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    groupBy: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
  },
};

let prismaMock: any;

describe('ServiceManager', () => {
  beforeEach(() => {
    // Clear singleton instance before each test
    (ServiceManager as any).instance = undefined;
    prismaMock = { ...mockPrismaClient };
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should create ServiceManager with provided PrismaClient', () => {
      // When
      const serviceManager = ServiceManager.getInstance(prismaMock);

      // Then
      expect(serviceManager).toBeInstanceOf(ServiceManager);
      expect(serviceManager.getPrismaClient()).toBe(prismaMock);
    });

    it('should return same instance when called multiple times', () => {
      // When
      const firstInstance = ServiceManager.getInstance(prismaMock);
      const secondInstance = ServiceManager.getInstance();

      // Then
      expect(firstInstance).toBe(secondInstance);
    });

    it('should throw error when no PrismaClient provided on first call', () => {
      // Given - singleton instance는 이미 beforeEach에서 undefined로 설정됨

      // When & Then
      expect(() => ServiceManager.getInstance()).toThrow('PrismaClient가 필요합니다');
    });
  });

  describe('reinitialize', () => {
    it('should create new instance with new PrismaClient', () => {
      // Given
      const firstInstance = ServiceManager.getInstance(prismaMock);
      const newPrismaMock = { ...mockPrismaClient };

      // When
      const secondInstance = ServiceManager.reinitialize(newPrismaMock);

      // Then
      expect(secondInstance).not.toBe(firstInstance);
      expect(secondInstance.getPrismaClient()).toBe(newPrismaMock);
    });
  });

  describe('service access', () => {
    let serviceManager: ServiceManager;

    beforeEach(() => {
      serviceManager = ServiceManager.getInstance(prismaMock);
    });

    it('should provide access to adminService', () => {
      const adminService = serviceManager.adminService;
      expect(adminService).toBeDefined();
    });

    it('should provide access to userService', () => {
      const userService = serviceManager.userService;
      expect(userService).toBeDefined();
    });

    it('should provide access to companyService', () => {
      const companyService = serviceManager.companyService;
      expect(companyService).toBeDefined();
    });

    it('should provide access to productService', () => {
      const productService = serviceManager.productService;
      expect(productService).toBeDefined();
    });

    it('should provide access to deviceTypeService', () => {
      const deviceTypeService = serviceManager.deviceTypeService;
      expect(deviceTypeService).toBeDefined();
    });

    it('should provide access to departmentService', () => {
      const departmentService = serviceManager.departmentService;
      expect(departmentService).toBeDefined();
    });

    it('should return same service instance on multiple calls (lazy loading)', () => {
      const firstCall = serviceManager.adminService;
      const secondCall = serviceManager.adminService;
      expect(firstCall).toBe(secondCall);
    });
  });

  describe('getAllServices', () => {
    let serviceManager: ServiceManager;

    beforeEach(() => {
      serviceManager = ServiceManager.getInstance(prismaMock);
    });

    it('should return all services as object', () => {
      const services = serviceManager.getAllServices();

      expect(services).toHaveProperty('admin');
      expect(services).toHaveProperty('user');
      expect(services).toHaveProperty('company');
      expect(services).toHaveProperty('product');
      expect(services).toHaveProperty('deviceType');
      expect(services).toHaveProperty('department');
    });

    it('should return consistent service instances', () => {
      const services1 = serviceManager.getAllServices();
      const services2 = serviceManager.getAllServices();

      expect(services1.admin).toBe(services2.admin);
      expect(services1.user).toBe(services2.user);
    });
  });

  describe('getPrismaClient', () => {
    it('should return the PrismaClient instance', () => {
      // Given
      const serviceManager = ServiceManager.getInstance(prismaMock);

      // When
      const prisma = serviceManager.getPrismaClient();

      // Then
      expect(prisma).toEqual(prismaMock);
    });
  });

  describe('preloadAllServices', () => {
    it('should initialize all services', () => {
      // Given
      const serviceManager = ServiceManager.getInstance(prismaMock);

      // When
      serviceManager.preloadAllServices();

      // Then - 모든 서비스가 정의되어 있는지 확인
      const services = serviceManager.getAllServices();
      expect(services.admin).toBeDefined();
      expect(services.user).toBeDefined();
      expect(services.company).toBeDefined();
      expect(services.product).toBeDefined();
    });
  });

  describe('clearServices', () => {
    it('should clear all service instances', () => {
      // Given
      const serviceManager = ServiceManager.getInstance(prismaMock);
      serviceManager.preloadAllServices(); // 서비스들 로드

      // When
      serviceManager.clearServices();

      // Then - 새로운 인스턴스가 생성되는지 확인 (clearServices 후에는 새로 생성됨)
      const adminService1 = serviceManager.adminService;
      serviceManager.clearServices();
      const adminService2 = serviceManager.adminService;
      expect(adminService1).not.toBe(adminService2);
    });
  });

  describe('dispose', () => {
    it('should disconnect prisma client', async () => {
      // Given
      const serviceManager = ServiceManager.getInstance(prismaMock);

      // When
      await serviceManager.dispose();

      // Then
      expect(prismaMock.$disconnect).toHaveBeenCalled();
    });

    it('should handle disposal errors gracefully', async () => {
      // Given
      const serviceManager = ServiceManager.getInstance(prismaMock);
      prismaMock.$disconnect.mockRejectedValue(new Error('Disconnect failed'));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation((message: string) => {
        console.log('Mocked console.warn:', message);
      });

      // When & Then - 에러가 발생해도 예외를 던지지 않아야 함
      await expect(serviceManager.dispose()).resolves.not.toThrow();

      // 에러가 로깅되었는지 확인
      expect(consoleSpy).toHaveBeenCalledWith('PrismaClient disconnect error:', expect.any(Error));

      // cleanup
      consoleSpy.mockRestore();
    });

    it('should clear services when disposing', async () => {
      // Given
      const serviceManager = ServiceManager.getInstance(prismaMock);
      serviceManager.preloadAllServices();

      // When
      await serviceManager.dispose();

      // Then - 새로운 서비스가 생성되는지 확인
      const adminService1 = serviceManager.adminService;
      await serviceManager.dispose();
      const adminService2 = serviceManager.adminService;
      expect(adminService1).not.toBe(adminService2);
    });
  });
});

describe('ServiceFactory', () => {
  beforeEach(() => {
    // Clear singleton instance
    (ServiceManager as any).instance = undefined;
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create ServiceManager with provided PrismaClient', () => {
      const serviceManager = ServiceFactory.create(prismaMock);
      expect(serviceManager).toBeInstanceOf(ServiceManager);
      expect(serviceManager.getPrismaClient()).toBe(prismaMock);
    });

    it('should return same instance as getInstance', () => {
      const createdManager = ServiceFactory.create(prismaMock);
      const gottenManager = ServiceManager.getInstance();
      expect(createdManager).toBe(gottenManager);
    });
  });

  describe('createForEnvironment', () => {
    it('should create development environment services', () => {
      const serviceManager = ServiceFactory.createForEnvironment(prismaMock, 'development');
      expect(serviceManager).toBeInstanceOf(ServiceManager);
    });

    it('should create production environment services', () => {
      const serviceManager = ServiceFactory.createForEnvironment(prismaMock, 'production');
      expect(serviceManager).toBeInstanceOf(ServiceManager);
    });

    it('should create test environment services', () => {
      const serviceManager = ServiceFactory.createForEnvironment(prismaMock, 'test');
      expect(serviceManager).toBeInstanceOf(ServiceManager);
    });

    it('should default to development environment', () => {
      const serviceManager = ServiceFactory.createForEnvironment(prismaMock);
      expect(serviceManager).toBeInstanceOf(ServiceManager);
    });
  });

  describe('createForTest', () => {
    it('should create new ServiceManager for testing', () => {
      const serviceManager = ServiceFactory.createForTest(prismaMock);
      expect(serviceManager).toBeInstanceOf(ServiceManager);
      expect(serviceManager.getPrismaClient()).toBe(prismaMock);
    });

    it('should reinitialize with new PrismaClient', () => {
      // Given
      const firstManager = ServiceFactory.create(prismaMock);
      const newPrismaMock = { ...mockPrismaClient };

      // When
      const testManager = ServiceFactory.createForTest(newPrismaMock);

      // Then
      expect(testManager).not.toBe(firstManager);
      expect(testManager.getPrismaClient()).toBe(newPrismaMock);
    });
  });

  describe('getInstance', () => {
    it('should return existing ServiceManager instance', () => {
      // Given
      const createdManager = ServiceFactory.create(prismaMock);

      // When
      const gottenManager = ServiceFactory.getInstance();

      // Then
      expect(gottenManager).toBe(createdManager);
    });

    it('should throw if no instance exists', () => {
      // ServiceManager instance가 없는 상태에서 getInstance 호출
      expect(() => ServiceFactory.getInstance()).toThrow();
    });
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    (ServiceManager as any).instance = undefined;
    jest.clearAllMocks();
  });

  it('should work together - ServiceFactory and ServiceManager', () => {
    // Create via ServiceFactory
    const factoryManager = ServiceFactory.create(prismaMock);

    // Get via ServiceManager
    const directManager = ServiceManager.getInstance();

    // Should be same instance
    expect(factoryManager).toBe(directManager);

    // Both should have access to services
    expect(factoryManager.adminService).toBeDefined();
    expect(directManager.adminService).toBeDefined();
    expect(factoryManager.adminService).toBe(directManager.adminService);
  });

  it('should handle environment-specific initialization', () => {
    const devManager = ServiceFactory.createForEnvironment(prismaMock, 'development');
    expect(devManager).toBeInstanceOf(ServiceManager);

    // Reinitialize for test
    const testManager = ServiceFactory.createForTest(prismaMock);
    expect(testManager).toBeInstanceOf(ServiceManager);
  });
}); 