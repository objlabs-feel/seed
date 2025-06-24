/**
 * 기본 통합 테스트
 * 실제 서비스들이 제대로 작동하는지 간단히 확인합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ServiceManager } from '../services/service.manager';
import { ServiceFactory } from '../services/service.factory';
import { createPrismaMock, setupCommonMocks, TestDataFactory } from './mocks/prisma.mock';
import type { PrismaClient } from '@prisma/client';

describe('기본 서비스 통합 테스트', () => {
  let prismaMock: any;
  let serviceManager: ServiceManager;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    setupCommonMocks(prismaMock);
    serviceManager = ServiceFactory.createForTest(prismaMock);
  });

  afterEach(async () => {
    await serviceManager.dispose();
  });

  describe('ServiceManager 기본 기능', () => {
    it('서비스 매니저가 생성되어야 함', () => {
      expect(serviceManager).toBeDefined();
    });

    it('모든 서비스에 접근할 수 있어야 함', () => {
      const services = serviceManager.getAllServices();

      expect(services.admin).toBeDefined();
      expect(services.user).toBeDefined();
      expect(services.profile).toBeDefined();
      expect(services.company).toBeDefined();
      expect(services.product).toBeDefined();
    });

    it('개별 서비스에 접근할 수 있어야 함', () => {
      expect(serviceManager.adminService).toBeDefined();
      expect(serviceManager.userService).toBeDefined();
      expect(serviceManager.profileService).toBeDefined();
      expect(serviceManager.companyService).toBeDefined();
      expect(serviceManager.productService).toBeDefined();
    });

    it('같은 서비스 인스턴스를 반환해야 함 (싱글톤)', () => {
      const admin1 = serviceManager.adminService;
      const admin2 = serviceManager.adminService;

      expect(admin1).toBe(admin2);
    });
  });

  describe('AdminService 기본 CRUD', () => {
    it('관리자를 생성할 수 있어야 함', async () => {
      // Given
      const createData = {
        username: 'testadmin',
        password: 'hashedpassword',
        level: 1,
      };
      const expectedAdmin = TestDataFactory.createAdmin(createData);
      prismaMock.admin.create.mockResolvedValue(expectedAdmin);

      // When
      const result = await serviceManager.adminService.create(createData);

      // Then
      expect(prismaMock.admin.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createData),
      });
      expect(result).toEqual(expectedAdmin);
    });

    it('관리자를 ID로 조회할 수 있어야 함', async () => {
      // Given
      const adminId = '1';
      const expectedAdmin = TestDataFactory.createAdmin({ id: 1 });
      prismaMock.admin.findUnique.mockResolvedValue(expectedAdmin);

      // When
      const result = await serviceManager.adminService.findById(adminId);

      // Then
      expect(prismaMock.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedAdmin);
    });

    it('관리자 목록을 조회할 수 있어야 함', async () => {
      // Given
      const admins = [
        TestDataFactory.createAdmin({ id: 1, username: 'admin1' }),
        TestDataFactory.createAdmin({ id: 2, username: 'admin2' }),
      ];
      prismaMock.admin.findMany.mockResolvedValue(admins);

      // When
      const result = await serviceManager.adminService.findMany({});

      // Then
      expect(prismaMock.admin.findMany).toHaveBeenCalled();
      expect(result).toEqual(admins);
    });
  });

  describe('UserService 기본 CRUD', () => {
    it('사용자를 생성할 수 있어야 함', async () => {
      // Given
      const createData = {
        device_token: 'test_token_123',
        status: 1,
      };
      const expectedUser = TestDataFactory.createUser(createData);
      prismaMock.user.create.mockResolvedValue(expectedUser);

      // When
      const result = await serviceManager.userService.create(createData);

      // Then
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(createData),
        })
      );
      expect(result).toEqual(expectedUser);
    });
  });

  describe('ServiceFactory 기능', () => {
    it('새로운 서비스 매니저를 생성할 수 있어야 함', () => {
      const newManager = ServiceFactory.create(prismaMock);
      expect(newManager).toBeDefined();
      expect(newManager.adminService).toBeDefined();
    });

    it('환경별 서비스 매니저를 생성할 수 있어야 함', () => {
      const devManager = ServiceFactory.createForEnvironment(prismaMock, 'development');
      const prodManager = ServiceFactory.createForEnvironment(prismaMock, 'production');
      const testManager = ServiceFactory.createForEnvironment(prismaMock, 'test');

      expect(devManager).toBeDefined();
      expect(prodManager).toBeDefined();
      expect(testManager).toBeDefined();
    });

    it('테스트용 서비스 매니저를 생성할 수 있어야 함', () => {
      const testManager = ServiceFactory.createForTest(prismaMock);
      expect(testManager).toBeDefined();
      expect(testManager.adminService).toBeDefined();
    });
  });

  describe('에러 처리', () => {
    it('데이터베이스 오류를 처리할 수 있어야 함', async () => {
      // Given
      prismaMock.admin.create.mockRejectedValue(new Error('Database connection failed'));

      // When & Then
      await expect(serviceManager.adminService.create({
        username: 'test',
        password: 'test',
        level: 1,
      })).rejects.toThrow('Database connection failed');
    });

    it('정리 작업이 정상적으로 작동해야 함', async () => {
      // When
      await serviceManager.dispose();

      // Then
      expect(prismaMock.$disconnect).toHaveBeenCalled();
    });
  });

  describe('Transformer 통합 테스트', () => {
    it('Admin 모델을 DTO로 변환할 수 있어야 함', () => {
      const { toAdminResponseDto } = require('../transformers/admin.transformer');

      // Given
      const admin = TestDataFactory.createAdmin({
        id: 1,
        username: 'testadmin',
        level: 5,
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.username).toBe('testadmin');
      expect(result.level).toBe(5);
      expect(result).not.toHaveProperty('password');
    });
  });
}); 