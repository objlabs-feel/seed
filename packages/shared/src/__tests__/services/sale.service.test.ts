import {
  SalesTypeService,
  SaleItemService,
  SaleItemViewHistoryService,
  SaleItemCartService,
  SalesAdminService
} from '../../services/sale.service';
import type { SalesType, SaleItem, SaleItemViewHistory, SaleItemCart, SalesAdmin } from '../../types/models';

// Mock PrismaClient
const mockPrismaClient = {
  salesType: {
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
  saleItem: {
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
  saleItemViewHistory: {
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
  saleItemCart: {
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
  salesAdmin: {
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

describe('SalesTypeService', () => {
  let salesTypeService: SalesTypeService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    salesTypeService = new SalesTypeService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sales type', async () => {
      // Given
      const createData = {
        code: 'AUCTION',
        name: 'Auction Sales',
        description: 'Auction-based sales',
        sort_key: 1,
        status: 1,
      };

      const expectedSalesType: Partial<SalesType> = {
        id: 1,
        code: 'AUCTION',
        name: 'Auction Sales',
        description: 'Auction-based sales',
        sort_key: 1,
        status: 1,
      };

      mockPrisma.salesType.create.mockResolvedValue(expectedSalesType);

      // When
      const result = await salesTypeService.create(createData);

      // Then
      expect(mockPrisma.salesType.create).toHaveBeenCalledWith({
        data: {
          code: 'AUCTION',
          name: 'Auction Sales',
          img: undefined,
          description: 'Auction-based sales',
          sort_key: 1,
          status: 1,
        },
      });
      expect(result).toEqual(expectedSalesType);
    });
  });

  describe('findById', () => {
    it('should find sales type by id', async () => {
      // Given
      const salesTypeId = '1';
      const expectedSalesType = { id: 1, name: 'Auction Sales' };
      mockPrisma.salesType.findUnique.mockResolvedValue(expectedSalesType);

      // When
      const result = await salesTypeService.findById(salesTypeId);

      // Then
      expect(mockPrisma.salesType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(expectedSalesType);
    });
  });

  describe('softDelete', () => {
    it('should soft delete sales type', async () => {
      // Given
      const salesTypeId = '1';
      const expectedSalesType = { id: 1, status: 0 };
      mockPrisma.salesType.update.mockResolvedValue(expectedSalesType);

      // When
      const result = await salesTypeService.softDelete(salesTypeId);

      // Then
      expect(mockPrisma.salesType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 0 },
      });
      expect(result).toEqual(expectedSalesType);
    });
  });

  describe('count', () => {
    it('should count sales types', async () => {
      // Given
      mockPrisma.salesType.count.mockResolvedValue(5);

      // When
      const result = await salesTypeService.count();

      // Then
      expect(mockPrisma.salesType.count).toHaveBeenCalledWith({});
      expect(result).toBe(5);
    });
  });
});

describe('SaleItemService', () => {
  let saleItemService: SaleItemService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    saleItemService = new SaleItemService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sale item', async () => {
      // Given
      const createData = {
        owner_id: '1',
        sales_type: 1,
        status: 1,
        item_id: '1',
      };

      const expectedSaleItem: Partial<SaleItem> = {
        id: BigInt(1),
        owner_id: BigInt(1),
        sales_type: 1,
        status: 1,
        item_id: BigInt(1),
      };

      mockPrisma.saleItem.create.mockResolvedValue(expectedSaleItem);

      // When
      const result = await saleItemService.create(createData);

      // Then
      expect(mockPrisma.saleItem.create).toHaveBeenCalledWith({
        data: {
          owner_id: BigInt(1),
          sales_type: 1,
          status: 1,
          item_id: BigInt(1),
        },
        include: {
          salesType: true,
          product: true,
          auction: true,
        },
      });
      expect(result).toEqual(expectedSaleItem);
    });
  });

  describe('findById', () => {
    it('should find sale item by id', async () => {
      // Given
      const saleItemId = '1';
      const expectedSaleItem = {
        id: BigInt(1),
        owner_id: BigInt(1),
        salesType: { id: 1, name: 'Auction' },
        product: { id: BigInt(1), description: 'Test Product' }
      };
      mockPrisma.saleItem.findUnique.mockResolvedValue(expectedSaleItem);

      // When
      const result = await saleItemService.findById(saleItemId);

      // Then
      expect(mockPrisma.saleItem.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: {
          salesType: true,
          product: true,
          auction: true,
        },
      });
      expect(result).toEqual(expectedSaleItem);
    });
  });

  describe('findBySalesType', () => {
    it('should find sale items by sales type', async () => {
      // Given
      const salesType = 1;
      const expectedSaleItems = [
        { id: BigInt(1), sales_type: 1 },
        { id: BigInt(2), sales_type: 1 },
      ];
      mockPrisma.saleItem.findMany.mockResolvedValue(expectedSaleItems);

      // When
      const result = await saleItemService.findBySalesType(salesType);

      // Then
      expect(mockPrisma.saleItem.findMany).toHaveBeenCalledWith({
        where: { sales_type: 1, status: 1 },
        orderBy: { created_at: 'desc' },
        include: {
          salesType: true,
          product: true,
          auction: true,
        },
      });
      expect(result).toEqual(expectedSaleItems);
    });
  });

  describe('softDelete', () => {
    it('should soft delete sale item', async () => {
      // Given
      const saleItemId = '1';
      const expectedSaleItem = { id: BigInt(1), status: 0 };
      mockPrisma.saleItem.update.mockResolvedValue(expectedSaleItem);

      // When
      const result = await saleItemService.softDelete(saleItemId);

      // Then
      expect(mockPrisma.saleItem.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 0 },
        include: {
          salesType: true,
          product: true,
          auction: true,
        },
      });
      expect(result).toEqual(expectedSaleItem);
    });
  });

  describe('count', () => {
    it('should count sale items', async () => {
      // Given
      mockPrisma.saleItem.count.mockResolvedValue(25);

      // When
      const result = await saleItemService.count();

      // Then
      expect(mockPrisma.saleItem.count).toHaveBeenCalledWith({});
      expect(result).toBe(25);
    });
  });
});

describe('SaleItemViewHistoryService', () => {
  let saleItemViewHistoryService: SaleItemViewHistoryService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    saleItemViewHistoryService = new SaleItemViewHistoryService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sale item view history', async () => {
      // Given
      const createData = {
        owner_id: '1',
        item_id: '1',
        status: 1,
      };

      const expectedViewHistory: Partial<SaleItemViewHistory> = {
        id: BigInt(1),
        owner_id: BigInt(1),
        item_id: BigInt(1),
        status: 1,
      };

      mockPrisma.saleItemViewHistory.create.mockResolvedValue(expectedViewHistory);

      // When
      const result = await saleItemViewHistoryService.create(createData);

      // Then
      expect(mockPrisma.saleItemViewHistory.create).toHaveBeenCalledWith({
        data: {
          owner_id: BigInt(1),
          item_id: BigInt(1),
          status: 1,
        },
        include: {
          saleItem: true,
        },
      });
      expect(result).toEqual(expectedViewHistory);
    });
  });

  describe('findByOwnerId', () => {
    it('should find view histories by owner id', async () => {
      // Given
      const ownerId = '1';
      const expectedViewHistories = [
        { id: BigInt(1), owner_id: BigInt(1) },
        { id: BigInt(2), owner_id: BigInt(1) },
      ];
      mockPrisma.saleItemViewHistory.findMany.mockResolvedValue(expectedViewHistories);

      // When
      const result = await saleItemViewHistoryService.findByOwnerId(ownerId);

      // Then
      expect(mockPrisma.saleItemViewHistory.findMany).toHaveBeenCalledWith({
        where: { owner_id: BigInt(1) },
        include: {
          saleItem: true,
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(expectedViewHistories);
    });
  });

  describe('count', () => {
    it('should count view histories', async () => {
      // Given
      mockPrisma.saleItemViewHistory.count.mockResolvedValue(100);

      // When
      const result = await saleItemViewHistoryService.count();

      // Then
      expect(mockPrisma.saleItemViewHistory.count).toHaveBeenCalledWith({});
      expect(result).toBe(100);
    });
  });
});

describe('SaleItemCartService', () => {
  let saleItemCartService: SaleItemCartService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    saleItemCartService = new SaleItemCartService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sale item cart', async () => {
      // Given
      const createData = {
        owner_id: '1',
        item_id: '1',
        status: 1,
      };

      const expectedCartItem: Partial<SaleItemCart> = {
        id: BigInt(1),
        owner_id: BigInt(1),
        item_id: BigInt(1),
        status: 1,
      };

      mockPrisma.saleItemCart.create.mockResolvedValue(expectedCartItem);

      // When
      const result = await saleItemCartService.create(createData);

      // Then
      expect(mockPrisma.saleItemCart.create).toHaveBeenCalledWith({
        data: {
          owner_id: BigInt(1),
          item_id: BigInt(1),
          status: 1,
        },
        include: {
          saleItem: true,
        },
      });
      expect(result).toEqual(expectedCartItem);
    });
  });

  describe('findCartByOwnerId', () => {
    it('should find cart items by owner id', async () => {
      // Given
      const ownerId = '1';
      const expectedCartItems = [
        { id: BigInt(1), owner_id: BigInt(1) },
        { id: BigInt(2), owner_id: BigInt(1) },
      ];
      mockPrisma.saleItemCart.findMany.mockResolvedValue(expectedCartItems);

      // When
      const result = await saleItemCartService.findCartByOwnerId(ownerId);

      // Then
      expect(mockPrisma.saleItemCart.findMany).toHaveBeenCalledWith({
        where: { owner_id: BigInt(1), status: 1 },
        orderBy: { created_at: 'desc' },
        include: {
          saleItem: true,
        },
      });
      expect(result).toEqual(expectedCartItems);
    });
  });

  describe('getCartItemCount', () => {
    it('should get cart item count for owner', async () => {
      // Given
      const ownerId = '1';
      mockPrisma.saleItemCart.count.mockResolvedValue(3);

      // When
      const result = await saleItemCartService.getCartItemCount(ownerId);

      // Then
      expect(mockPrisma.saleItemCart.count).toHaveBeenCalledWith({
        where: { owner_id: BigInt(1), status: 1 },
      });
      expect(result).toBe(3);
    });
  });

  describe('softDelete', () => {
    it('should soft delete cart item', async () => {
      // Given
      const cartItemId = '1';
      const expectedCartItem = { id: BigInt(1), status: 0 };
      mockPrisma.saleItemCart.update.mockResolvedValue(expectedCartItem);

      // When
      const result = await saleItemCartService.softDelete(cartItemId);

      // Then
      expect(mockPrisma.saleItemCart.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 0 },
        include: {
          saleItem: true,
        },
      });
      expect(result).toEqual(expectedCartItem);
    });
  });
});

describe('SalesAdminService', () => {
  let salesAdminService: SalesAdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    salesAdminService = new SalesAdminService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sales admin', async () => {
      // Given
      const createData = {
        username: 'salesadmin',
        password: 'hashedpassword',
        email: 'admin@sales.com',
        level: 1,
        status: 1,
      };

      const expectedSalesAdmin: Partial<SalesAdmin> = {
        id: BigInt(1),
        username: 'salesadmin',
        password: 'hashedpassword',
        email: 'admin@sales.com',
        level: 1,
        status: 1,
      };

      mockPrisma.salesAdmin.create.mockResolvedValue(expectedSalesAdmin);

      // When
      const result = await salesAdminService.create(createData);

      // Then
      expect(mockPrisma.salesAdmin.create).toHaveBeenCalledWith({
        data: {
          username: 'salesadmin',
          password: 'hashedpassword',
          email: 'admin@sales.com',
          level: 1,
          status: 1,
        },
      });
      expect(result).toEqual(expectedSalesAdmin);
    });
  });

  describe('findByUsername', () => {
    it('should find sales admin by username', async () => {
      // Given
      const username = 'salesadmin';
      const expectedSalesAdmin = {
        id: BigInt(1),
        username: 'salesadmin',
        email: 'admin@sales.com'
      };
      mockPrisma.salesAdmin.findUnique.mockResolvedValue(expectedSalesAdmin);

      // When
      const result = await salesAdminService.findByUsername(username);

      // Then
      expect(mockPrisma.salesAdmin.findUnique).toHaveBeenCalledWith({
        where: { username: 'salesadmin' },
      });
      expect(result).toEqual(expectedSalesAdmin);
    });
  });

  describe('findByEmail', () => {
    it('should find sales admin by email', async () => {
      // Given
      const email = 'admin@sales.com';
      const expectedSalesAdmin = {
        id: BigInt(1),
        username: 'salesadmin',
        email: 'admin@sales.com'
      };
      mockPrisma.salesAdmin.findUnique.mockResolvedValue(expectedSalesAdmin);

      // When
      const result = await salesAdminService.findByEmail(email);

      // Then
      expect(mockPrisma.salesAdmin.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@sales.com' },
      });
      expect(result).toEqual(expectedSalesAdmin);
    });
  });

  describe('softDelete', () => {
    it('should soft delete sales admin', async () => {
      // Given
      const salesAdminId = '1';
      const expectedSalesAdmin = { id: BigInt(1), status: 0 };
      mockPrisma.salesAdmin.update.mockResolvedValue(expectedSalesAdmin);

      // When
      const result = await salesAdminService.softDelete(salesAdminId);

      // Then
      expect(mockPrisma.salesAdmin.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 0 },
      });
      expect(result).toEqual(expectedSalesAdmin);
    });
  });

  describe('count', () => {
    it('should count sales admins', async () => {
      // Given
      mockPrisma.salesAdmin.count.mockResolvedValue(10);

      // When
      const result = await salesAdminService.count();

      // Then
      expect(mockPrisma.salesAdmin.count).toHaveBeenCalledWith({});
      expect(result).toBe(10);
    });
  });

  describe('exists', () => {
    it('should return true if sales admin exists', async () => {
      // Given
      const whereCondition = { username: 'salesadmin' };
      mockPrisma.salesAdmin.count.mockResolvedValue(1);

      // When
      const result = await salesAdminService.exists(whereCondition);

      // Then
      expect(mockPrisma.salesAdmin.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(true);
    });

    it('should return false if sales admin does not exist', async () => {
      // Given
      const whereCondition = { username: 'nonexistent' };
      mockPrisma.salesAdmin.count.mockResolvedValue(0);

      // When
      const result = await salesAdminService.exists(whereCondition);

      // Then
      expect(result).toBe(false);
    });
  });
}); 