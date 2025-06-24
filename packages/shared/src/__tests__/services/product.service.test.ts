import { ProductService } from '../../services/product.service';
import type { Product } from '../../types/models';

// Mock PrismaClient
const mockPrismaClient = {
  product: {
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

describe('ProductService', () => {
  let productService: ProductService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    productService = new ProductService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Given
      const createData = {
        owner_id: '1',
        media: { images: ['product1.jpg'] },
        info: { model: 'XR-200' },
        device_id: '1',
        available_quantity: 10,
        origin_price: 100000,
        sale_price: 90000,
        discount_type: 1,
        discount_value: 10000,
        components_ids: [1, 2, 3],
        version: 1,
        description: 'X-Ray machine product',
        status: 1,
      };

      const expectedProduct: Partial<Product> = {
        id: BigInt(1),
        owner_id: BigInt(1),
        media: { images: ['product1.jpg'] },
        info: { model: 'XR-200' },
        device_id: BigInt(1),
        available_quantity: 10,
        origin_price: 100000,
        sale_price: 90000,
        discount_type: 1,
        discount_value: 10000,
        components_ids: [1, 2, 3],
        version: 1,
        description: 'X-Ray machine product',
        status: 1,
      };

      mockPrisma.product.create.mockResolvedValue(expectedProduct);

      // When
      const result = await productService.create(createData);

      // Then
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          owner_id: BigInt(1),
          media: { images: ['product1.jpg'] },
          info: { model: 'XR-200' },
          device_id: BigInt(1),
          available_quantity: 10,
          origin_price: 100000,
          sale_price: 90000,
          discount_type: 1,
          discount_value: 10000,
          components_ids: [1, 2, 3],
          version: 1,
          description: 'X-Ray machine product',
          status: 1,
        },
        include: {
          company: true,
          components: true,
          device: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('findById', () => {
    it('should find product by id', async () => {
      // Given
      const productId = '1';
      const expectedProduct = {
        id: BigInt(1),
        description: 'X-Ray machine product',
        company: { id: BigInt(1), name: 'Test Company' },
        device: { id: BigInt(1), description: 'Test Device' }
      };
      mockPrisma.product.findUnique.mockResolvedValue(expectedProduct);

      // When
      const result = await productService.findById(productId);

      // Then
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: {
          company: true,
          components: true,
          device: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('findByOwnerId', () => {
    it('should find products by owner id', async () => {
      // Given
      const ownerId = '1';
      const expectedProducts = [
        { id: BigInt(1), owner_id: BigInt(1), description: 'Product 1' },
        { id: BigInt(2), owner_id: BigInt(1), description: 'Product 2' },
      ];
      mockPrisma.product.findMany.mockResolvedValue(expectedProducts);

      // When
      const result = await productService.findByOwnerId(ownerId);

      // Then
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { owner_id: BigInt(1), status: 1 },
        orderBy: { created_at: 'desc' },
        include: {
          company: true,
          components: true,
          device: true,
        },
      });
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('findByPriceRange', () => {
    it('should find products within price range', async () => {
      // Given
      const minPrice = 50000;
      const maxPrice = 150000;
      const expectedProducts = [
        { id: BigInt(1), sale_price: 90000, description: 'Product 1' },
        { id: BigInt(2), sale_price: 120000, description: 'Product 2' },
      ];
      mockPrisma.product.findMany.mockResolvedValue(expectedProducts);

      // When
      const result = await productService.findByPriceRange(minPrice, maxPrice);

      // Then
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          sale_price: {
            gte: 50000,
            lte: 150000,
          },
          status: 1,
        },
        orderBy: { sale_price: 'asc' },
        include: {
          company: true,
          components: true,
          device: true,
        },
      });
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('findAvailableProducts', () => {
    it('should find available products', async () => {
      // Given
      const expectedProducts = [
        { id: BigInt(1), available_quantity: 5, status: 1 },
        { id: BigInt(2), available_quantity: 10, status: 1 },
      ];
      mockPrisma.product.findMany.mockResolvedValue(expectedProducts);

      // When
      const result = await productService.findAvailableProducts();

      // Then
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          available_quantity: { gt: 0 },
          status: 1,
        },
        orderBy: { created_at: 'desc' },
        include: {
          company: true,
          components: true,
          device: true,
        },
      });
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('update', () => {
    it('should update product', async () => {
      // Given
      const productId = '1';
      const updateData = {
        description: 'Updated X-Ray machine product',
        sale_price: 85000,
        available_quantity: 8,
      };

      const expectedProduct = {
        id: BigInt(1),
        description: 'Updated X-Ray machine product',
        sale_price: 85000,
        available_quantity: 8,
      };
      mockPrisma.product.update.mockResolvedValue(expectedProduct);

      // When
      const result = await productService.update(productId, updateData);

      // Then
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          description: 'Updated X-Ray machine product',
          sale_price: 85000,
          available_quantity: 8,
        },
        include: {
          company: true,
          components: true,
          device: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('softDelete', () => {
    it('should soft delete product', async () => {
      // Given
      const productId = '1';
      const expectedProduct = { id: BigInt(1), status: 0 };
      mockPrisma.product.update.mockResolvedValue(expectedProduct);

      // When
      const result = await productService.softDelete(productId);

      // Then
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 0 },
        include: {
          company: true,
          components: true,
          device: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('restore', () => {
    it('should restore soft deleted product', async () => {
      // Given
      const productId = '1';
      const expectedProduct = { id: BigInt(1), status: 1 };
      mockPrisma.product.update.mockResolvedValue(expectedProduct);

      // When
      const result = await productService.restore(productId);

      // Then
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 1 },
        include: {
          company: true,
          components: true,
          device: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('count', () => {
    it('should count products', async () => {
      // Given
      mockPrisma.product.count.mockResolvedValue(100);

      // When
      const result = await productService.count();

      // Then
      expect(mockPrisma.product.count).toHaveBeenCalledWith({});
      expect(result).toBe(100);
    });

    it('should count products with where condition', async () => {
      // Given
      const whereCondition = { status: 1 };
      mockPrisma.product.count.mockResolvedValue(80);

      // When
      const result = await productService.count(whereCondition);

      // Then
      expect(mockPrisma.product.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(80);
    });
  });

  describe('exists', () => {
    it('should return true if product exists', async () => {
      // Given
      const whereCondition = { device_id: BigInt(1) };
      mockPrisma.product.count.mockResolvedValue(1);

      // When
      const result = await productService.exists(whereCondition);

      // Then
      expect(mockPrisma.product.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(true);
    });

    it('should return false if product does not exist', async () => {
      // Given
      const whereCondition = { device_id: BigInt(999) };
      mockPrisma.product.count.mockResolvedValue(0);

      // When
      const result = await productService.exists(whereCondition);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('createMany', () => {
    it('should create multiple products', async () => {
      // Given
      const createDataArray = [
        {
          owner_id: '1',
          device_id: '1',
          available_quantity: 5,
          origin_price: 50000,
          sale_price: 45000,
          discount_type: 1,
          discount_value: 5000,
          version: 1,
          description: 'Product 1',
        },
        {
          owner_id: '1',
          device_id: '2',
          available_quantity: 3,
          origin_price: 80000,
          sale_price: 75000,
          discount_type: 1,
          discount_value: 5000,
          version: 1,
          description: 'Product 2',
        },
      ];

      const createdProducts = [
        { id: BigInt(1), description: 'Product 1' },
        { id: BigInt(2), description: 'Product 2' },
      ];

      mockPrisma.product.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.product.findMany.mockResolvedValue(createdProducts);

      // When
      const result = await productService.createMany(createDataArray);

      // Then
      expect(mockPrisma.product.createMany).toHaveBeenCalledWith({
        data: [
          {
            owner_id: BigInt(1),
            media: undefined,
            info: undefined,
            device_id: BigInt(1),
            available_quantity: 5,
            origin_price: 50000,
            sale_price: 45000,
            discount_type: 1,
            discount_value: 5000,
            components_ids: undefined,
            version: 1,
            description: 'Product 1',
            status: 1,
          },
          {
            owner_id: BigInt(1),
            media: undefined,
            info: undefined,
            device_id: BigInt(2),
            available_quantity: 3,
            origin_price: 80000,
            sale_price: 75000,
            discount_type: 1,
            discount_value: 5000,
            components_ids: undefined,
            version: 1,
            description: 'Product 2',
            status: 1,
          },
        ],
        skipDuplicates: true,
      });
      expect(result).toEqual({ count: 2, data: createdProducts });
    });
  });

  describe('delete', () => {
    it('should delete product', async () => {
      // Given
      const productId = '1';
      const deletedProduct = { id: BigInt(1), description: 'Deleted product' };
      mockPrisma.product.delete.mockResolvedValue(deletedProduct);

      // When
      const result = await productService.delete(productId);

      // Then
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
      expect(result).toEqual(deletedProduct);
    });
  });
}); 