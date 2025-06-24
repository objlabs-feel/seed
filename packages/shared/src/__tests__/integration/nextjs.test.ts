/**
 * Next.js Integration 테스트
 * Next.js 환경에서의 서비스 초기화와 관리를 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  initializeNextjsServices,
  appServices,
  appAdminService,
  appUserService,
  isNextjsServicesReady,
  resetNextjsServices,
  routeWithServices,
  apiWithServices,
  getNextjsServicesDebugInfo,
} from '../../libs/app.service.wrapper';
import { createPrismaMock, setupCommonMocks } from '../mocks/prisma.mock';

// Global 타입 확장
declare global {
  var __nextjs_services: any;
  var __nextjs_prisma: any;
}

describe('Next.js Integration', () => {
  let originalWindow: any;
  let originalProcess: any;

  beforeEach(() => {
    // 환경 초기화
    originalWindow = global.window;
    originalProcess = process.env.NODE_ENV;

    // 서버 환경으로 설정
    delete (global as any).window;
    process.env.NODE_ENV = 'test';

    // 글로벌 변수 초기화
    global.__nextjs_services = undefined;
    global.__nextjs_prisma = undefined;
  });

  afterEach(async () => {
    // 환경 복원
    global.window = originalWindow;
    process.env.NODE_ENV = originalProcess;

    // 서비스 정리
    await resetNextjsServices();
  });

  describe('initializeNextjsServices', () => {
    it('should initialize services in server environment', () => {
      // When
      const serviceManager = initializeNextjsServices();

      // Then
      expect(serviceManager).toBeDefined();
      expect(serviceManager.adminService).toBeDefined();
      expect(serviceManager.userService).toBeDefined();
    });

    it('should throw error in client environment', () => {
      // Given
      global.window = {} as Window & typeof globalThis;

      // When & Then
      expect(() => initializeNextjsServices())
        .toThrow('서비스는 서버 사이드에서만 초기화할 수 있습니다');
    });

    it('should reuse existing services in development', () => {
      // Given
      process.env.NODE_ENV = 'development';
      const manager1 = initializeNextjsServices();

      // When
      const manager2 = initializeNextjsServices();

      // Then
      expect(manager1).toBe(manager2);
    });

    it('should create new instances in production', () => {
      // Given
      process.env.NODE_ENV = 'production';
      const manager1 = initializeNextjsServices();

      // When
      const manager2 = initializeNextjsServices();

      // Then
      expect(manager1).toBe(manager2); // 여전히 싱글톤
    });
  });

  describe('appServices', () => {
    it('should return all services', () => {
      // When
      const services = appServices();

      // Then
      expect(services).toHaveProperty('admin');
      expect(services).toHaveProperty('user');
      expect(services).toHaveProperty('company');
      expect(services).toHaveProperty('product');
    });

    it('should return consistent services', () => {
      // When
      const services1 = appServices();
      const services2 = appServices();

      // Then
      expect(services1.admin).toBe(services2.admin);
      expect(services1.user).toBe(services2.user);
    });
  });

  describe('individual service hooks', () => {
    it('should provide useNextjsAdminService', () => {
      // When
      const adminService = useNextjsAdminService();

      // Then
      expect(adminService).toBeDefined();
      expect(adminService.constructor.name).toBe('AdminService');
    });

    it('should provide useNextjsUserService', () => {
      // When
      const userService = useNextjsUserService();

      // Then
      expect(userService).toBeDefined();
      expect(userService.constructor.name).toBe('UserService');
    });

    it('should maintain service consistency', () => {
      // When
      const admin1 = useNextjsAdminService();
      const admin2 = useNextjsAdminService();

      // Then
      expect(admin1).toBe(admin2);
    });
  });

  describe('isNextjsServicesReady', () => {
    it('should return false in client environment', () => {
      // Given
      global.window = {} as Window & typeof globalThis;

      // When
      const ready = isNextjsServicesReady();

      // Then
      expect(ready).toBe(false);
    });

    it('should return false when services not initialized', () => {
      // When
      const ready = isNextjsServicesReady();

      // Then
      expect(ready).toBe(false);
    });

    it('should return true when services are ready', () => {
      // Given
      initializeNextjsServices();

      // When
      const ready = isNextjsServicesReady();

      // Then
      expect(ready).toBe(true);
    });
  });

  describe('resetNextjsServices', () => {
    it('should reset global services', async () => {
      // Given
      initializeNextjsServices();
      expect(global.__nextjs_services).toBeDefined();

      // When
      await resetNextjsServices();

      // Then
      expect(global.__nextjs_services).toBeUndefined();
      expect(global.__nextjs_prisma).toBeUndefined();
    });

    it('should handle reset when nothing initialized', async () => {
      // When & Then
      await expect(resetNextjsServices()).resolves.not.toThrow();
    });
  });

  describe('withServices wrapper', () => {
    it('should inject services into handler', async () => {
      // Given
      const handler = jest.fn().mockResolvedValue('result');
      const wrappedHandler = withServices(handler);

      // When
      const result = await wrappedHandler('arg1', 'arg2');

      // Then
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          admin: expect.anything(),
          user: expect.anything(),
          company: expect.anything(),
          product: expect.anything(),
        }),
        'arg1',
        'arg2'
      );
      expect(result).toBe('result');
    });

    it('should handle handler errors', async () => {
      // Given
      const handler = jest.fn().mockRejectedValue(new Error('Handler error'));
      const wrappedHandler = withServices(handler);

      // When & Then
      await expect(wrappedHandler()).rejects.toThrow('Handler error');
    });
  });

  describe('withApiServices wrapper', () => {
    it('should inject services into API handler', async () => {
      // Given
      const handler = jest.fn().mockResolvedValue(undefined);
      const wrappedHandler = withApiServices(handler);
      const mockReq = { method: 'GET' };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      // When
      await wrappedHandler(mockReq, mockRes);

      // Then
      expect(handler).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        expect.objectContaining({
          admin: expect.anything(),
          user: expect.anything(),
        })
      );
    });

    it('should handle API handler errors', async () => {
      // Given
      const handler = jest.fn().mockRejectedValue(new Error('API error'));
      const wrappedHandler = withApiServices(handler);
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      // When
      await wrappedHandler(mockReq, mockRes);

      // Then
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: '서버 오류가 발생했습니다.',
        message: 'API error',
      });
    });

    it('should hide error message in production', async () => {
      // Given
      process.env.NODE_ENV = 'production';
      const handler = jest.fn().mockRejectedValue(new Error('Secret error'));
      const wrappedHandler = withApiServices(handler);
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      // When
      await wrappedHandler(mockReq, mockRes);

      // Then
      expect(mockRes.json).toHaveBeenCalledWith({
        error: '서버 오류가 발생했습니다.',
        message: undefined,
      });
    });
  });

  describe('withAppRouterServices wrapper', () => {
    it('should inject services into App Router handler', async () => {
      // Given
      const handler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrappedHandler = withAppRouterServices(handler);
      const mockRequest = new Request('http://localhost:3000');
      const mockContext = { params: { id: '1' } };

      // When
      const response = await wrappedHandler(mockRequest, mockContext);

      // Then
      expect(handler).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          admin: expect.anything(),
          user: expect.anything(),
        }),
        mockContext
      );
      expect(response).toBeInstanceOf(Response);
    });

    it('should handle App Router handler errors', async () => {
      // Given
      const handler = jest.fn().mockRejectedValue(new Error('App Router error'));
      const wrappedHandler = withAppRouterServices(handler);
      const mockRequest = new Request('http://localhost:3000');

      // When
      const response = await wrappedHandler(mockRequest);

      // Then
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body).toEqual({
        error: '서버 오류가 발생했습니다.',
        message: 'App Router error',
      });
    });
  });

  describe('getNextjsServicesDebugInfo', () => {
    it('should return debug info in development', () => {
      // Given
      process.env.NODE_ENV = 'development';
      initializeNextjsServices();

      // When
      const debugInfo = getNextjsServicesDebugInfo();

      // Then
      expect(debugInfo).toEqual({
        servicesInitialized: true,
        prismaInitialized: true,
        nodeEnv: 'development',
        isServer: true,
      });
    });

    it('should return null in production', () => {
      // Given
      process.env.NODE_ENV = 'production';

      // When
      const debugInfo = getNextjsServicesDebugInfo();

      // Then
      expect(debugInfo).toBeNull();
    });

    it('should show uninitialized state', () => {
      // Given
      process.env.NODE_ENV = 'development';

      // When
      const debugInfo = getNextjsServicesDebugInfo();

      // Then
      expect(debugInfo).toEqual({
        servicesInitialized: false,
        prismaInitialized: false,
        nodeEnv: 'development',
        isServer: true,
      });
    });
  });

  describe('environment handling', () => {
    it('should handle development environment', () => {
      // Given
      process.env.NODE_ENV = 'development';

      // When
      const manager1 = initializeNextjsServices();
      const manager2 = initializeNextjsServices();

      // Then
      expect(manager1).toBe(manager2); // 개발 환경에서는 글로벌 저장
    });

    it('should handle production environment', () => {
      // Given
      process.env.NODE_ENV = 'production';

      // When
      const manager = initializeNextjsServices();

      // Then
      expect(manager).toBeDefined();
      expect(global.__nextjs_services).toBeUndefined(); // 프로덕션에서는 글로벌 저장 안함
    });

    it('should handle test environment', () => {
      // Given
      process.env.NODE_ENV = 'test';

      // When
      const manager = initializeNextjsServices();

      // Then
      expect(manager).toBeDefined();
    });
  });

  describe('error boundaries', () => {
    it('should handle PrismaClient creation errors', () => {
      // Given
      const originalPrismaClient = require('@prisma/client').PrismaClient;
      require('@prisma/client').PrismaClient = jest.fn(() => {
        throw new Error('Prisma error');
      });

      // When & Then
      expect(() => initializeNextjsServices()).toThrow();

      // Cleanup
      require('@prisma/client').PrismaClient = originalPrismaClient;
    });
  });

  describe('memory management', () => {
    it('should properly dispose services', async () => {
      // Given
      const manager = initializeNextjsServices();
      const disconnectSpy = jest.spyOn(manager as any, 'dispose');

      // When
      await resetNextjsServices();

      // Then
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
}); 