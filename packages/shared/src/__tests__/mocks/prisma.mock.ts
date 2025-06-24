/**
 * Prisma Mock 유틸리티
 * 테스트에서 PrismaClient를 모킹하기 위한 헬퍼 함수들
 */

import { jest } from '@jest/globals';
import type { PrismaClient } from '@prisma/client';

/**
 * 완전한 PrismaClient Mock 생성
 */
export function createPrismaMock(): jest.Mocked<PrismaClient> {
  return {
    admin: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      upsert: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      upsert: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    profile: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      upsert: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    company: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      upsert: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      upsert: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $transaction: jest.fn(),
  } as any;
}

/**
 * 테스트 데이터 팩토리
 */
export class TestDataFactory {
  static createAdmin(overrides: Partial<any> = {}) {
    return {
      id: 1,
      username: 'testadmin',
      password: 'hashedpassword',
      level: 1,
      created_at: new Date('2024-01-01'),
      status: 1,
      ...overrides,
    };
  }

  static createUser(overrides: Partial<any> = {}) {
    return {
      id: BigInt(1),
      device_token: 'test_token',
      profile_id: BigInt(1),
      status: 1,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      ...overrides,
    };
  }

  static createProfile(overrides: Partial<any> = {}) {
    return {
      id: BigInt(1),
      company_id: BigInt(1),
      profile_type: 1,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      name: 'Test User',
      mobile: '010-1234-5678',
      email: 'test@example.com',
      status: 1,
      ...overrides,
    };
  }

  static createCompany(overrides: Partial<any> = {}) {
    return {
      id: BigInt(1),
      name: 'Test Company',
      business_no: '123-45-67890',
      business_tel: '02-1234-5678',
      owner_id: BigInt(1),
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      status: 1,
      ...overrides,
    };
  }

  static createProduct(overrides: Partial<any> = {}) {
    return {
      id: BigInt(1),
      owner_id: BigInt(1),
      device_id: BigInt(1),
      available_quantity: 10,
      origin_price: 100000,
      sale_price: 90000,
      discount_type: 1,
      discount_value: 10000,
      version: 1,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      status: 1,
      ...overrides,
    };
  }

  static createPaginationResponse<T>(data: T[], total: number = data.length) {
    return {
      data,
      total,
      page: 1,
      limit: 10,
      totalPages: Math.ceil(total / 10),
      hasNext: total > 10,
      hasPrev: false,
    };
  }
}

/**
 * Mock 초기화 헬퍼
 */
export function resetAllMocks(prismaMock: jest.Mocked<PrismaClient>) {
  Object.values(prismaMock).forEach((model: any) => {
    if (model && typeof model === 'object') {
      Object.values(model).forEach((method: any) => {
        if (jest.isMockFunction(method)) {
          method.mockReset();
        }
      });
    }
  });
}

/**
 * 공통 Mock 설정
 */
export function setupCommonMocks(prismaMock: jest.Mocked<PrismaClient>) {
  // 기본 성공 응답 설정
  prismaMock.$connect.mockResolvedValue();
  prismaMock.$disconnect.mockResolvedValue();
  prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock));
}

/**
 * 에러 Mock 설정
 */
export function setupErrorMocks(prismaMock: jest.Mocked<PrismaClient>) {
  const databaseError = new Error('Database connection failed');

  // 모든 메서드에 에러 설정
  Object.values(prismaMock).forEach((model: any) => {
    if (model && typeof model === 'object') {
      Object.values(model).forEach((method: any) => {
        if (jest.isMockFunction(method)) {
          (method as jest.MockedFunction<any>).mockRejectedValue(databaseError);
        }
      });
    }
  });
} 