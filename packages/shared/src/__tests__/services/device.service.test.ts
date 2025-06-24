import { DeviceTypeService, DepartmentService, ManufacturerService, DeviceService } from '../../services/device.service';
import type { DeviceType, Department, Manufacturer, Device } from '../../types/models';

// Mock PrismaClient
const mockPrismaClient = {
  deviceType: {
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
  department: {
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
  manufacturer: {
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
  device: {
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

describe('DeviceTypeService', () => {
  let deviceTypeService: DeviceTypeService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    deviceTypeService = new DeviceTypeService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new device type', async () => {
      // Given
      const createData = {
        code: 'DT001',
        name: 'Stethoscope',
        description: 'Medical stethoscope',
        sort_key: 1,
        status: 1,
      };

      const expectedDeviceType: Partial<DeviceType> = {
        id: 1,
        code: 'DT001',
        name: 'Stethoscope',
        description: 'Medical stethoscope',
        sort_key: 1,
        status: 1,
      };

      mockPrisma.deviceType.create.mockResolvedValue(expectedDeviceType);

      // When
      const result = await deviceTypeService.create(createData);

      // Then
      expect(mockPrisma.deviceType.create).toHaveBeenCalledWith({
        data: {
          code: 'DT001',
          name: 'Stethoscope',
          description: 'Medical stethoscope',
          img: undefined,
          sort_key: 1,
          status: 1,
        },
      });
      expect(result).toEqual(expectedDeviceType);
    });
  });

  describe('findById', () => {
    it('should find device type by id', async () => {
      // Given
      const deviceTypeId = '1';
      const expectedDeviceType = { id: 1, name: 'Stethoscope' };
      mockPrisma.deviceType.findUnique.mockResolvedValue(expectedDeviceType);

      // When
      const result = await deviceTypeService.findById(deviceTypeId);

      // Then
      expect(mockPrisma.deviceType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedDeviceType);
    });
  });

  describe('findBySortOrder', () => {
    it('should find device types ordered by sort_key', async () => {
      // Given
      const expectedDeviceTypes = [
        { id: 1, name: 'Type A', sort_key: 1, status: 1 },
        { id: 2, name: 'Type B', sort_key: 2, status: 1 },
      ];
      mockPrisma.deviceType.findMany.mockResolvedValue(expectedDeviceTypes);

      // When
      const result = await deviceTypeService.findBySortOrder();

      // Then
      expect(mockPrisma.deviceType.findMany).toHaveBeenCalledWith({
        where: { status: 1 },
        orderBy: { sort_key: 'asc' },
      });
      expect(result).toEqual(expectedDeviceTypes);
    });
  });

  describe('update', () => {
    it('should update device type', async () => {
      // Given
      const deviceTypeId = '1';
      const updateData = {
        name: 'Updated Stethoscope',
        description: 'Updated description',
      };

      const expectedDeviceType = { id: 1, name: 'Updated Stethoscope' };
      mockPrisma.deviceType.update.mockResolvedValue(expectedDeviceType);

      // When
      const result = await deviceTypeService.update(deviceTypeId, updateData);

      // Then
      expect(mockPrisma.deviceType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Stethoscope',
          description: 'Updated description',
        },
      });
      expect(result).toEqual(expectedDeviceType);
    });
  });

  describe('softDelete', () => {
    it('should soft delete device type', async () => {
      // Given
      const deviceTypeId = '1';
      const expectedDeviceType = { id: 1, status: 0 };
      mockPrisma.deviceType.update.mockResolvedValue(expectedDeviceType);

      // When
      const result = await deviceTypeService.softDelete(deviceTypeId);

      // Then
      expect(mockPrisma.deviceType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 0 },
      });
      expect(result).toEqual(expectedDeviceType);
    });
  });

  describe('count', () => {
    it('should count device types', async () => {
      // Given
      mockPrisma.deviceType.count.mockResolvedValue(5);

      // When
      const result = await deviceTypeService.count();

      // Then
      expect(mockPrisma.deviceType.count).toHaveBeenCalledWith({});
      expect(result).toBe(5);
    });
  });

  describe('exists', () => {
    it('should return true if device type exists', async () => {
      // Given
      const whereCondition = { code: 'DT001' };
      mockPrisma.deviceType.count.mockResolvedValue(1);

      // When
      const result = await deviceTypeService.exists(whereCondition);

      // Then
      expect(mockPrisma.deviceType.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(true);
    });
  });
});

describe('DepartmentService', () => {
  let departmentService: DepartmentService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    departmentService = new DepartmentService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new department', async () => {
      // Given
      const createData = {
        code: 'CARD',
        name: 'Cardiology',
        description: 'Heart and cardiovascular care',
        sort_key: 1,
        status: 1,
      };

      const expectedDepartment: Partial<Department> = {
        id: 1,
        code: 'CARD',
        name: 'Cardiology',
        description: 'Heart and cardiovascular care',
        sort_key: 1,
        status: 1,
      };

      mockPrisma.department.create.mockResolvedValue(expectedDepartment);

      // When
      const result = await departmentService.create(createData);

      // Then
      expect(mockPrisma.department.create).toHaveBeenCalledWith({
        data: {
          code: 'CARD',
          name: 'Cardiology',
          img: undefined,
          description: 'Heart and cardiovascular care',
          sort_key: 1,
          status: 1,
        },
      });
      expect(result).toEqual(expectedDepartment);
    });
  });

  describe('findById', () => {
    it('should find department by id', async () => {
      // Given
      const departmentId = '1';
      const expectedDepartment = { id: 1, name: 'Cardiology' };
      mockPrisma.department.findUnique.mockResolvedValue(expectedDepartment);

      // When
      const result = await departmentService.findById(departmentId);

      // Then
      expect(mockPrisma.department.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedDepartment);
    });
  });

  describe('findBySortOrder', () => {
    it('should find departments ordered by sort_key', async () => {
      // Given
      const expectedDepartments = [
        { id: 1, name: 'Cardiology', sort_key: 1, status: 1 },
        { id: 2, name: 'Neurology', sort_key: 2, status: 1 },
      ];
      mockPrisma.department.findMany.mockResolvedValue(expectedDepartments);

      // When
      const result = await departmentService.findBySortOrder();

      // Then
      expect(mockPrisma.department.findMany).toHaveBeenCalledWith({
        where: { status: 1 },
        orderBy: { sort_key: 'asc' },
      });
      expect(result).toEqual(expectedDepartments);
    });
  });

  describe('softDelete', () => {
    it('should soft delete department', async () => {
      // Given
      const departmentId = '1';
      const expectedDepartment = { id: 1, status: 0 };
      mockPrisma.department.update.mockResolvedValue(expectedDepartment);

      // When
      const result = await departmentService.softDelete(departmentId);

      // Then
      expect(mockPrisma.department.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 0 },
      });
      expect(result).toEqual(expectedDepartment);
    });
  });
});

describe('ManufacturerService', () => {
  let manufacturerService: ManufacturerService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    manufacturerService = new ManufacturerService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new manufacturer', async () => {
      // Given
      const createData = {
        name: 'Philips Healthcare',
        device_types: [1, 2, 3],
        description: 'Medical equipment manufacturer',
        status: 1,
      };

      const expectedManufacturer: Partial<Manufacturer> = {
        id: 1,
        name: 'Philips Healthcare',
        device_types: [1, 2, 3],
        description: 'Medical equipment manufacturer',
        status: 1,
      };

      mockPrisma.manufacturer.create.mockResolvedValue(expectedManufacturer);

      // When
      const result = await manufacturerService.create(createData);

      // Then
      expect(mockPrisma.manufacturer.create).toHaveBeenCalledWith({
        data: {
          name: 'Philips Healthcare',
          device_types: [1, 2, 3],
          img: undefined,
          description: 'Medical equipment manufacturer',
          status: 1,
        },
      });
      expect(result).toEqual(expectedManufacturer);
    });
  });

  describe('findById', () => {
    it('should find manufacturer by id', async () => {
      // Given
      const manufacturerId = '1';
      const expectedManufacturer = { id: 1, name: 'Philips Healthcare' };
      mockPrisma.manufacturer.findUnique.mockResolvedValue(expectedManufacturer);

      // When
      const result = await manufacturerService.findById(manufacturerId);

      // Then
      expect(mockPrisma.manufacturer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedManufacturer);
    });
  });

  describe('update', () => {
    it('should update manufacturer', async () => {
      // Given
      const manufacturerId = '1';
      const updateData = {
        name: 'Updated Philips',
        description: 'Updated description',
      };

      const expectedManufacturer = { id: 1, name: 'Updated Philips' };
      mockPrisma.manufacturer.update.mockResolvedValue(expectedManufacturer);

      // When
      const result = await manufacturerService.update(manufacturerId, updateData);

      // Then
      expect(mockPrisma.manufacturer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Philips',
          description: 'Updated description',
        },
      });
      expect(result).toEqual(expectedManufacturer);
    });
  });

  describe('count', () => {
    it('should count manufacturers', async () => {
      // Given
      mockPrisma.manufacturer.count.mockResolvedValue(10);

      // When
      const result = await manufacturerService.count();

      // Then
      expect(mockPrisma.manufacturer.count).toHaveBeenCalledWith({});
      expect(result).toBe(10);
    });
  });
});

describe('DeviceService', () => {
  let deviceService: DeviceService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    deviceService = new DeviceService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new device', async () => {
      // Given
      const createData = {
        manufacturer_id: '1',
        device_type: 1,
        media: { images: ['image1.jpg'] },
        info: { model: 'XR-100' },
        version: 1,
        description: 'X-Ray machine',
        status: 1,
      };

      const expectedDevice: Partial<Device> = {
        id: BigInt(1),
        manufacturer_id: 1,
        device_type: 1,
        media: { images: ['image1.jpg'] },
        info: { model: 'XR-100' },
        version: 1,
        description: 'X-Ray machine',
        status: 1,
      };

      mockPrisma.device.create.mockResolvedValue(expectedDevice);

      // When
      const result = await deviceService.create(createData);

      // Then
      expect(mockPrisma.device.create).toHaveBeenCalledWith({
        data: {
          manufacturer_id: 1,
          device_type: 1,
          media: { images: ['image1.jpg'] },
          info: { model: 'XR-100' },
          version: 1,
          description: 'X-Ray machine',
          status: 1,
        },
        include: {
          manufacturer: true,
          deviceType: true,
        },
      });
      expect(result).toEqual(expectedDevice);
    });
  });

  describe('findById', () => {
    it('should find device by id', async () => {
      // Given
      const deviceId = '1';
      const expectedDevice = { id: BigInt(1), description: 'X-Ray machine' };
      mockPrisma.device.findUnique.mockResolvedValue(expectedDevice);

      // When
      const result = await deviceService.findById(deviceId);

      // Then
      expect(mockPrisma.device.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: {
          manufacturer: true,
          deviceType: true,
        },
      });
      expect(result).toEqual(expectedDevice);
    });
  });

  describe('update', () => {
    it('should update device', async () => {
      // Given
      const deviceId = '1';
      const updateData = {
        description: 'Updated X-Ray machine',
        version: 2,
      };

      const expectedDevice = { id: BigInt(1), description: 'Updated X-Ray machine' };
      mockPrisma.device.update.mockResolvedValue(expectedDevice);

      // When
      const result = await deviceService.update(deviceId, updateData);

      // Then
      expect(mockPrisma.device.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          description: 'Updated X-Ray machine',
          version: 2,
        },
        include: {
          manufacturer: true,
          deviceType: true,
        },
      });
      expect(result).toEqual(expectedDevice);
    });
  });

  describe('softDelete', () => {
    it('should soft delete device', async () => {
      // Given
      const deviceId = '1';
      const expectedDevice = { id: BigInt(1), status: 0 };
      mockPrisma.device.update.mockResolvedValue(expectedDevice);

      // When
      const result = await deviceService.softDelete(deviceId);

      // Then
      expect(mockPrisma.device.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 0 },
        include: {
          manufacturer: true,
          deviceType: true,
        },
      });
      expect(result).toEqual(expectedDevice);
    });
  });

  describe('count', () => {
    it('should count devices', async () => {
      // Given
      mockPrisma.device.count.mockResolvedValue(25);

      // When
      const result = await deviceService.count();

      // Then
      expect(mockPrisma.device.count).toHaveBeenCalledWith({});
      expect(result).toBe(25);
    });
  });

  describe('exists', () => {
    it('should return true if device exists', async () => {
      // Given
      const whereCondition = { manufacturer_id: 1 };
      mockPrisma.device.count.mockResolvedValue(1);

      // When
      const result = await deviceService.exists(whereCondition);

      // Then
      expect(mockPrisma.device.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(true);
    });

    it('should return false if device does not exist', async () => {
      // Given
      const whereCondition = { manufacturer_id: 999 };
      mockPrisma.device.count.mockResolvedValue(0);

      // When
      const result = await deviceService.exists(whereCondition);

      // Then
      expect(result).toBe(false);
    });
  });
}); 