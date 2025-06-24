/**
 * Admin Transformer 테스트
 * 순수 함수들의 변환 로직을 테스트합니다.
 */

import { describe, it, expect } from '@jest/globals';
import {
  toAdminResponseDto,
  toAdminListDto,
  toAdminLoginResponseDto,
  sanitizeAdmin,
  toAdminListDtoArray,
} from '../../transformers/admin.transformer';
import { TestDataFactory } from '../mocks/prisma.mock';
import type { Admin } from '../../types/models';

describe('Admin Transformer', () => {
  describe('toAdminResponseDto', () => {
    it('should transform Admin model to AdminResponseDto', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        id: 1,
        username: 'testadmin',
        password: 'hashedpassword',
        level: 5,
        created_at: new Date('2024-01-01T00:00:00Z'),
        status: 1,
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result).toEqual({
        id: '1',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: null, // Admin 모델에는 updated_at이 없음
        status: 1,
        username: 'testadmin',
        level: 5,
      });
    });

    it('should exclude password from response', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        password: 'supersecret',
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result).not.toHaveProperty('password');
      expect(Object.keys(result)).not.toContain('password');
    });

    it('should handle null created_at', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        created_at: null,
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result.created_at).toBeNull();
    });

    it('should convert id to string', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        id: 999,
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result.id).toBe('999');
      expect(typeof result.id).toBe('string');
    });
  });

  describe('toAdminListDto', () => {
    it('should transform Admin to AdminListDto with essential fields', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        id: 1,
        username: 'listadmin',
        level: 3,
        created_at: new Date('2024-01-01T00:00:00Z'),
        status: 1,
      });

      // When
      const result = toAdminListDto(admin);

      // Then
      expect(result).toEqual({
        id: '1',
        username: 'listadmin',
        level: 3,
        created_at: '2024-01-01T00:00:00.000Z',
        status: 1,
      });
    });

    it('should not include password or other sensitive data', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        password: 'secret',
      });

      // When
      const result = toAdminListDto(admin);

      // Then
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('toAdminLoginResponseDto', () => {
    it('should create login response with admin and token', () => {
      // Given
      const admin = TestDataFactory.createAdmin();
      const token = 'jwt.token.here';

      // When
      const result = toAdminLoginResponseDto(admin, token);

      // Then
      expect(result).toEqual({
        admin: {
          id: '1',
          created_at: expect.any(String),
          updated_at: null,
          status: 1,
          username: 'testadmin',
          level: 1,
        },
        token: 'jwt.token.here',
      });
    });

    it('should work without token', () => {
      // Given
      const admin = TestDataFactory.createAdmin();

      // When
      const result = toAdminLoginResponseDto(admin);

      // Then
      expect(result).toHaveProperty('admin');
      expect(result).toHaveProperty('token');
      expect(result.token).toBeUndefined();
    });

    it('should exclude password from admin in login response', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        password: 'supersecret',
      });

      // When
      const result = toAdminLoginResponseDto(admin, 'token');

      // Then
      expect(result.admin).not.toHaveProperty('password');
    });
  });

  describe('sanitizeAdmin', () => {
    it('should remove password from admin object', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        password: 'shouldberemoved',
      });

      // When
      const result = sanitizeAdmin(admin);

      // Then
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('id');
    });

    it('should preserve all other properties', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        id: 99,
        username: 'preserve',
        level: 10,
        status: 1,
      });

      // When
      const result = sanitizeAdmin(admin);

      // Then
      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe(99);
        expect(result.username).toBe('preserve');
        expect(result.level).toBe(10);
        expect(result.status).toBe(1);
      }
    });
  });

  describe('toAdminListDtoArray', () => {
    it('should transform array of Admin models', () => {
      // Given
      const admins = [
        TestDataFactory.createAdmin({ id: 1, username: 'admin1' }),
        TestDataFactory.createAdmin({ id: 2, username: 'admin2' }),
        TestDataFactory.createAdmin({ id: 3, username: 'admin3' }),
      ];

      // When
      const result = toAdminListDtoArray(admins);

      // Then
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('1');
      expect(result[0]?.username).toBe('admin1');
      expect(result[1]?.id).toBe('2');
      expect(result[1]?.username).toBe('admin2');
      expect(result[2]?.id).toBe('3');
      expect(result[2]?.username).toBe('admin3');
    });

    it('should handle empty array', () => {
      // Given
      const admins: Admin[] = [];

      // When
      const result = toAdminListDtoArray(admins);

      // Then
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should exclude passwords from all admins in array', () => {
      // Given
      const admins = [
        TestDataFactory.createAdmin({ password: 'secret1' }),
        TestDataFactory.createAdmin({ password: 'secret2' }),
      ];

      // When
      const result = toAdminListDtoArray(admins);

      // Then
      result.forEach(admin => {
        expect(admin).not.toHaveProperty('password');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle admin with maximum integer id', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        id: Number.MAX_SAFE_INTEGER,
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result.id).toBe(Number.MAX_SAFE_INTEGER.toString());
    });

    it('should handle admin with level 0', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        level: 0,
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result.level).toBe(0);
    });

    it('should handle admin with negative status', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        status: -1,
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result.status).toBe(-1);
    });

    it('should handle admin with empty username', () => {
      // Given
      const admin = TestDataFactory.createAdmin({
        username: '',
      });

      // When
      const result = toAdminResponseDto(admin);

      // Then
      expect(result.username).toBe('');
    });
  });
}); 