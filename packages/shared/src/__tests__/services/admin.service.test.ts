/**
 * AdminService 테스트
 * CRUD 작업과 비즈니스 로직을 테스트합니다.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AdminService } from '../../services/admin.service';
import {
  createPrismaMock,
  TestDataFactory,
  resetAllMocks,
  setupCommonMocks
} from '../mocks/prisma.mock';
import type { PrismaClient } from '@prisma/client';

describe('AdminService', () => {
  let adminService: AdminService;
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    setupCommonMocks(prismaMock);
    adminService = new AdminService(prismaMock);
    resetAllMocks(prismaMock);
  });

  describe('create', () => {
    it('should create a new admin', async () => {
      // Given
      const createData = {
        username: 'newadmin',
        password: 'hashedpassword',
        level: 1,
      };
      const expectedAdmin = TestDataFactory.createAdmin(createData);

      prismaMock.admin.create.mockResolvedValue(expectedAdmin);

      // When
      const result = await adminService.create(createData);

      // Then
      expect(prismaMock.admin.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          status: 1,
        },
      });
      expect(result).toEqual(expectedAdmin);
    });

    it('should throw error when creation fails', async () => {
      // Given
      const createData = {
        username: 'newadmin',
        password: 'password',
        level: 1,
      };
      prismaMock.admin.create.mockRejectedValue(new Error('Database error'));

      // When & Then
      await expect(adminService.create(createData)).rejects.toThrow('Database error');
      expect(prismaMock.admin.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          status: 1,
        },
      });
    });
  });

  describe('findById', () => {
    it('should find admin by id', async () => {
      // Given
      const adminId = '1';
      const expectedAdmin = TestDataFactory.createAdmin({ id: 1 });

      prismaMock.admin.findUnique.mockResolvedValue(expectedAdmin);

      // When
      const result = await adminService.findById(adminId);

      // Then
      expect(prismaMock.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedAdmin);
    });

    it('should return null when admin not found', async () => {
      // Given
      prismaMock.admin.findUnique.mockResolvedValue(null);

      // When
      const result = await adminService.findById('999');

      // Then
      expect(result).toBeNull();
    });

    it('should handle invalid id format', async () => {
      // Given
      prismaMock.admin.findUnique.mockResolvedValue(null);

      // When
      const result = await adminService.findById('invalid');

      // Then
      expect(prismaMock.admin.findUnique).toHaveBeenCalledWith({
        where: { id: NaN },
      });
      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should return all admins', async () => {
      // Given
      const admins = [
        TestDataFactory.createAdmin({ id: 1, username: 'admin1' }),
        TestDataFactory.createAdmin({ id: 2, username: 'admin2' }),
      ];

      prismaMock.admin.findMany.mockResolvedValue(admins);

      // When
      const result = await adminService.findMany();

      // Then
      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({});
      expect(result).toEqual(admins);
    });

    it('should apply filters when provided', async () => {
      // Given
      const options = {
        where: { status: 1 },
        orderBy: { created_at: 'desc' as const },
        take: 10,
      };

      prismaMock.admin.findMany.mockResolvedValue([]);

      // When
      await adminService.findMany(options);

      // Then
      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({
        where: { status: 1 },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findFirst', () => {
    it('should find first admin with conditions', async () => {
      // Given
      const conditions = {
        where: { level: { gte: 5 } },
        orderBy: { username: 'asc' as const },
      };
      const expectedAdmin = TestDataFactory.createAdmin({ level: 5 });

      prismaMock.admin.findFirst.mockResolvedValue(expectedAdmin);

      // When
      const result = await adminService.findFirst(conditions);

      // Then
      expect(prismaMock.admin.findFirst).toHaveBeenCalledWith(conditions);
      expect(result).toEqual(expectedAdmin);
    });
  });

  describe('update', () => {
    it('should update admin successfully', async () => {
      // Given
      const adminId = '1';
      const updateData = { level: 10 };
      const updatedAdmin = TestDataFactory.createAdmin({
        id: 1,
        level: 10
      });

      prismaMock.admin.update.mockResolvedValue(updatedAdmin);

      // When
      const result = await adminService.update(adminId, updateData);

      // Then
      expect(prismaMock.admin.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedAdmin);
    });

    it('should throw error when update fails', async () => {
      // Given
      prismaMock.admin.update.mockRejectedValue(new Error('Admin not found'));

      // When & Then
      await expect(adminService.update('999', { level: 1 }))
        .rejects.toThrow('Admin not found');
    });
  });

  describe('delete', () => {
    it('should delete admin permanently', async () => {
      // Given
      const adminId = '1';
      const deletedAdmin = TestDataFactory.createAdmin({ id: 1 });

      prismaMock.admin.delete.mockResolvedValue(deletedAdmin);

      // When
      const result = await adminService.delete(adminId);

      // Then
      expect(prismaMock.admin.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(deletedAdmin);
    });
  });

  describe('softDelete', () => {
    it('should soft delete admin by setting status to 0', async () => {
      // Given
      const adminId = '1';
      const softDeletedAdmin = TestDataFactory.createAdmin({
        id: 1,
        status: 0
      });

      prismaMock.admin.update.mockResolvedValue(softDeletedAdmin);

      // When
      const result = await adminService.softDelete(adminId);

      // Then
      expect(prismaMock.admin.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 0 },
      });
      expect(result).toEqual(softDeletedAdmin);
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      // Given
      prismaMock.admin.count.mockResolvedValue(42);

      // When
      const result = await adminService.count();

      // Then
      expect(prismaMock.admin.count).toHaveBeenCalledWith({});
      expect(result).toBe(42);
    });

    it('should count with conditions', async () => {
      // Given
      const conditions = { status: 1 };
      prismaMock.admin.count.mockResolvedValue(10);

      // When
      const result = await adminService.count(conditions);

      // Then
      expect(prismaMock.admin.count).toHaveBeenCalledWith({ where: conditions });
      expect(result).toBe(10);
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', async () => {
      // Given
      const options = { page: 1, limit: 10 };
      const admins = [
        TestDataFactory.createAdmin({ id: 1 }),
        TestDataFactory.createAdmin({ id: 2 }),
      ];

      prismaMock.admin.findMany.mockResolvedValue(admins);
      prismaMock.admin.count.mockResolvedValue(25);

      // When
      const result = await adminService.findWithPagination(options);

      // Then
      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(prismaMock.admin.count).toHaveBeenCalledWith({});

      expect(result).toEqual({
        data: admins,
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should handle last page correctly', async () => {
      // Given
      const options = { page: 3, limit: 10 };
      const admins = [TestDataFactory.createAdmin({ id: 21 })];

      prismaMock.admin.findMany.mockResolvedValue(admins);
      prismaMock.admin.count.mockResolvedValue(21);

      // When
      const result = await adminService.findWithPagination(options);

      // Then
      expect(result.totalPages).toBe(3);
    });

    it('should apply filters in pagination', async () => {
      // Given
      const options = {
        page: 1,
        limit: 5,
        where: { status: 1 },
        orderBy: { created_at: 'desc' as const },
      };

      prismaMock.admin.findMany.mockResolvedValue([]);
      prismaMock.admin.count.mockResolvedValue(0);

      // When
      await adminService.findWithPagination(options);

      // Then
      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 5,
        where: { status: 1 },
        orderBy: { created_at: 'desc' },
      });
      expect(prismaMock.admin.count).toHaveBeenCalledWith({
        where: { status: 1 },
      });
    });
  });

  describe('findByUsername', () => {
    it('should find admin by username', async () => {
      // Given
      const username = 'testuser';
      const expectedAdmin = TestDataFactory.createAdmin({ username: 'testuser' });

      prismaMock.admin.findUnique.mockResolvedValue(expectedAdmin);

      // When
      const result = await adminService.findByUsername(username);

      // Then
      expect(prismaMock.admin.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual(expectedAdmin);
    });

    it('should return null when username not found', async () => {
      // Given
      prismaMock.admin.findUnique.mockResolvedValue(null);

      // When
      const result = await adminService.findByUsername('nonexistent');

      // Then
      expect(prismaMock.admin.findUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByLevel', () => {
    it('should find admins by specific level', async () => {
      // Given
      const level = 5;
      const expectedAdmins = [TestDataFactory.createAdmin({ level: 5 })];

      prismaMock.admin.findMany.mockResolvedValue(expectedAdmins);

      // When
      const result = await adminService.findByLevel(level);

      // Then
      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({
        where: { level, status: 1 },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(expectedAdmins);
    });
  });

  describe('findActiveAdmins', () => {
    it('should find only active admins', async () => {
      // Given
      const activeAdmins = [
        TestDataFactory.createAdmin({ id: 1, status: 1 }),
        TestDataFactory.createAdmin({ id: 2, status: 1 }),
      ];

      prismaMock.admin.findMany.mockResolvedValue(activeAdmins);

      // When
      const result = await adminService.findActiveAdmins();

      // Then
      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({
        where: { status: 1 },
        orderBy: { level: 'desc' },
      });
      expect(result).toEqual(activeAdmins);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large page numbers', async () => {
      // Given
      prismaMock.admin.findMany.mockResolvedValue([]);
      prismaMock.admin.count.mockResolvedValue(25);

      // When
      const result = await adminService.findWithPagination({ page: 1000, limit: 10 });

      // Then
      expect(result.data).toEqual([]);
      expect(result.totalPages).toBe(3);
    });

    it('should handle zero limit in pagination', async () => {
      // Given
      prismaMock.admin.findMany.mockResolvedValue([]);
      prismaMock.admin.count.mockResolvedValue(25);

      // When
      const result = await adminService.findWithPagination({ page: 1, limit: 0 });

      // Then
      expect(result.totalPages).toBe(3); // limit 0 -> 기본값 10으로 변환, Math.ceil(25 / 10) = 3
      expect(result.data).toEqual([]);
    });

    it('should handle negative page numbers', async () => {
      // Given
      prismaMock.admin.findMany.mockResolvedValue([]);
      prismaMock.admin.count.mockResolvedValue(25);

      // When
      const result = await adminService.findWithPagination({ page: -1, limit: 10 });

      // Then
      expect(prismaMock.admin.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });
}); 