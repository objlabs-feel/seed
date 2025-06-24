import { UserService, ProfileService } from '../../services/user.service';
import type { User, Profile } from '../../types/models';

// Mock PrismaClient
const mockPrismaClient = {
  user: {
    create: jest.fn(),
    createMany: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  profile: {
    create: jest.fn(),
    createMany: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('UserService', () => {
  let userService: UserService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    userService = new UserService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // Given
      const createData = {
        device_token: 'test-device-token',
        profile_id: '1',
        status: 1,
      };

      const expectedUser: User = {
        id: BigInt(1),
        device_token: 'test-device-token',
        profile_id: BigInt(1),
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
        profile: undefined,
        company: undefined,
      };

      mockPrisma.user.create.mockResolvedValue(expectedUser);

      // When
      const result = await userService.create(createData);

      // Then
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          device_token: 'test-device-token',
          profile_id: BigInt('1'),
          status: 1,
        },
        include: {
          profile: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should create user with null profile_id when not provided', async () => {
      // Given
      const createData = {
        device_token: 'test-device-token',
        status: 1,
      };

      // When
      await userService.create(createData);

      // Then
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          device_token: 'test-device-token',
          profile_id: null,
          status: 1,
        },
        include: {
          profile: true,
        },
      });
    });
  });

  describe('createMany', () => {
    it('should create multiple users', async () => {
      // Given
      const createData = [
        { device_token: 'token1', status: 1 },
        { device_token: 'token2', status: 1 },
      ];

      mockPrisma.user.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: BigInt(1), device_token: 'token1', status: 1 },
        { id: BigInt(2), device_token: 'token2', status: 1 },
      ]);

      // When
      const result = await userService.createMany(createData);

      // Then
      expect(mockPrisma.user.createMany).toHaveBeenCalledWith({
        data: createData.map(item => ({
          device_token: item.device_token,
          profile_id: null,
          status: 1,
        })),
        skipDuplicates: true,
      });
      expect(result.count).toBe(2);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find user by string id', async () => {
      // Given
      const userId = '1';
      const expectedUser = { id: BigInt(1), device_token: 'test-token' };
      mockPrisma.user.findUnique.mockResolvedValue(expectedUser);

      // When
      const result = await userService.findById(userId);

      // Then
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: { profile: true },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should find user by number id', async () => {
      // Given
      const userId = 1;
      const expectedUser = { id: BigInt(1), device_token: 'test-token' };
      mockPrisma.user.findUnique.mockResolvedValue(expectedUser);

      // When
      const result = await userService.findById(userId);

      // Then
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: { profile: true },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findByDeviceToken', () => {
    it('should find user by device token', async () => {
      // Given
      const deviceToken = 'test-device-token';
      const expectedUser = { id: BigInt(1), device_token: deviceToken };
      mockPrisma.user.findUnique.mockResolvedValue(expectedUser);

      // When
      const result = await userService.findByDeviceToken(deviceToken);

      // Then
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { device_token: deviceToken },
        include: { profile: true },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      // Given
      const userId = '1';
      const updateData = {
        device_token: 'new-token',
        status: 2,
      };

      const expectedUser = { id: BigInt(1), device_token: 'new-token', status: 2 };
      mockPrisma.user.update.mockResolvedValue(expectedUser);

      // When
      const result = await userService.update(userId, updateData);

      // Then
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          device_token: 'new-token',
          status: 2,
        },
        include: { profile: true },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('softDelete', () => {
    it('should soft delete user by setting status to 0', async () => {
      // Given
      const userId = '1';
      const expectedUser = { id: BigInt(1), status: 0 };
      mockPrisma.user.update.mockResolvedValue(expectedUser);

      // When
      const result = await userService.softDelete(userId);

      // Then
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 0 },
        include: { profile: true },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('restore', () => {
    it('should restore user by setting status to 1', async () => {
      // Given
      const userId = '1';
      const expectedUser = { id: BigInt(1), status: 1 };
      mockPrisma.user.update.mockResolvedValue(expectedUser);

      // When
      const result = await userService.restore(userId);

      // Then
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 1 },
        include: { profile: true },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('count', () => {
    it('should count users', async () => {
      // Given
      mockPrisma.user.count.mockResolvedValue(5);

      // When
      const result = await userService.count();

      // Then
      expect(mockPrisma.user.count).toHaveBeenCalledWith({});
      expect(result).toBe(5);
    });

    it('should count users with where condition', async () => {
      // Given
      const whereCondition = { status: 1 };
      mockPrisma.user.count.mockResolvedValue(3);

      // When
      const result = await userService.count(whereCondition);

      // Then
      expect(mockPrisma.user.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(3);
    });
  });

  describe('exists', () => {
    it('should return true if user exists', async () => {
      // Given
      const whereCondition = { device_token: 'test-token' };
      mockPrisma.user.count.mockResolvedValue(1);

      // When
      const result = await userService.exists(whereCondition);

      // Then
      expect(mockPrisma.user.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      // Given
      const whereCondition = { device_token: 'non-existent-token' };
      mockPrisma.user.count.mockResolvedValue(0);

      // When
      const result = await userService.exists(whereCondition);

      // Then
      expect(result).toBe(false);
    });
  });
});

describe('ProfileService', () => {
  let profileService: ProfileService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    profileService = new ProfileService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      // Given
      const createData = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '010-1234-5678',
        company_id: '1',
        profile_type: 1,
        status: 1,
      };

      const expectedProfile: Profile = {
        id: BigInt(1),
        company_id: BigInt(1),
        profile_type: 1,
        created_at: new Date(),
        updated_at: new Date(),
        name: 'John Doe',
        mobile: '010-1234-5678',
        email: 'john@example.com',
        status: 1,
        company: undefined,
        user: undefined,
        companies: [],
      };

      mockPrisma.profile.create.mockResolvedValue(expectedProfile);

      // When
      const result = await profileService.create(createData);

      // Then
      expect(mockPrisma.profile.create).toHaveBeenCalledWith({
        data: {
          company_id: BigInt('1'),
          profile_type: 1,
          name: 'John Doe',
          mobile: '010-1234-5678',
          email: 'john@example.com',
          status: 1,
        },
        include: {
          company: true,
        },
      });
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('findByEmail', () => {
    it('should find profile by email', async () => {
      // Given
      const email = 'john@example.com';
      const expectedProfile = { id: BigInt(1), email, name: 'John Doe' };
      mockPrisma.profile.findFirst.mockResolvedValue(expectedProfile);

      // When
      const result = await profileService.findByEmail(email);

      // Then
      expect(mockPrisma.profile.findFirst).toHaveBeenCalledWith({
        where: { email },
        include: { company: true },
      });
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('findByMobile', () => {
    it('should find profile by mobile', async () => {
      // Given
      const mobile = '010-1234-5678';
      const expectedProfile = { id: BigInt(1), mobile, name: 'John Doe' };
      mockPrisma.profile.findFirst.mockResolvedValue(expectedProfile);

      // When
      const result = await profileService.findByMobile(mobile);

      // Then
      expect(mockPrisma.profile.findFirst).toHaveBeenCalledWith({
        where: { mobile },
        include: { company: true },
      });
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('update', () => {
    it('should update profile', async () => {
      // Given
      const profileId = '1';
      const updateData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const expectedProfile = { id: BigInt(1), name: 'Jane Doe', email: 'jane@example.com' };
      mockPrisma.profile.update.mockResolvedValue(expectedProfile);

      // When
      const result = await profileService.update(profileId, updateData);

      // Then
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
        include: { company: true },
      });
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('softDelete', () => {
    it('should soft delete profile by setting status to 0', async () => {
      // Given
      const profileId = '1';
      const expectedProfile = { id: BigInt(1), status: 0 };
      mockPrisma.profile.update.mockResolvedValue(expectedProfile);

      // When
      const result = await profileService.softDelete(profileId);

      // Then
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 0 },
        include: { company: true },
      });
      expect(result).toEqual(expectedProfile);
    });
  });

  describe('count', () => {
    it('should count profiles', async () => {
      // Given
      mockPrisma.profile.count.mockResolvedValue(10);

      // When
      const result = await profileService.count();

      // Then
      expect(mockPrisma.profile.count).toHaveBeenCalledWith({});
      expect(result).toBe(10);
    });
  });

  describe('exists', () => {
    it('should return true if profile exists', async () => {
      // Given
      const whereCondition = { email: 'john@example.com' };
      mockPrisma.profile.count.mockResolvedValue(1);

      // When
      const result = await profileService.exists(whereCondition);

      // Then
      expect(result).toBe(true);
    });

    it('should return false if profile does not exist', async () => {
      // Given
      const whereCondition = { email: 'nonexistent@example.com' };
      mockPrisma.profile.count.mockResolvedValue(0);

      // When
      const result = await profileService.exists(whereCondition);

      // Then
      expect(result).toBe(false);
    });
  });
}); 