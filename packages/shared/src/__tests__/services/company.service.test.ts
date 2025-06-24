import { CompanyService } from '../../services/company.service';
import type { Company } from '../../types/models';

// Mock PrismaClient
const mockPrismaClient = {
  company: {
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

describe('CompanyService', () => {
  let companyService: CompanyService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = { ...mockPrismaClient };
    companyService = new CompanyService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new company', async () => {
      // Given
      const createData = {
        name: 'Test Company',
        business_no: '123-45-67890',
        business_tel: '02-1234-5678',
        owner_id: '1',
        company_type: 1,
        status: 1,
      };

      const expectedCompany: Partial<Company> = {
        id: BigInt(1),
        name: 'Test Company',
        business_no: '123-45-67890',
        business_tel: '02-1234-5678',
        owner_id: BigInt(1),
        company_type: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrisma.company.create.mockResolvedValue(expectedCompany);

      // When
      const result = await companyService.create(createData);

      // Then
      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Company',
          business_no: '123-45-67890',
          business_tel: '02-1234-5678',
          license_img: undefined,
          owner_id: BigInt('1'),
          related_members: undefined,
          institute_members: undefined,
          company_type: 1,
          business_mobile: undefined,
          secret_info: undefined,
          zipcode: undefined,
          address: undefined,
          address_detail: undefined,
          area: undefined,
          status: 1,
        },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedCompany);
    });

    it('should create company with null owner_id when not provided', async () => {
      // Given
      const createData = {
        name: 'Test Company',
        business_no: '123-45-67890',
        status: 1,
      };

      // When
      await companyService.create(createData);

      // Then
      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Company',
          business_no: '123-45-67890',
          owner_id: null,
          status: 1,
        }),
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
    });
  });

  describe('findById', () => {
    it('should find company by string id', async () => {
      // Given
      const companyId = '1';
      const expectedCompany = { id: BigInt(1), name: 'Test Company' };
      mockPrisma.company.findUnique.mockResolvedValue(expectedCompany);

      // When
      const result = await companyService.findById(companyId);

      // Then
      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
          profiles: true,
        },
      });
      expect(result).toEqual(expectedCompany);
    });

    it('should find company by number id', async () => {
      // Given
      const companyId = 1;
      const expectedCompany = { id: BigInt(1), name: 'Test Company' };
      mockPrisma.company.findUnique.mockResolvedValue(expectedCompany);

      // When
      const result = await companyService.findById(companyId);

      // Then
      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
          profiles: true,
        },
      });
      expect(result).toEqual(expectedCompany);
    });
  });

  describe('findByBusinessNo', () => {
    it('should find company by business number', async () => {
      // Given
      const businessNo = '123-45-67890';
      const expectedCompany = { id: BigInt(1), business_no: businessNo };
      mockPrisma.company.findFirst.mockResolvedValue(expectedCompany);

      // When
      const result = await companyService.findByBusinessNo(businessNo);

      // Then
      expect(mockPrisma.company.findFirst).toHaveBeenCalledWith({
        where: { business_no: businessNo },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedCompany);
    });
  });

  describe('findByOwnerId', () => {
    it('should find companies by owner id', async () => {
      // Given
      const ownerId = '1';
      const expectedCompanies = [
        { id: BigInt(1), owner_id: BigInt(1), name: 'Company 1' },
        { id: BigInt(2), owner_id: BigInt(1), name: 'Company 2' },
      ];
      mockPrisma.company.findMany.mockResolvedValue(expectedCompanies);

      // When
      const result = await companyService.findByOwnerId(ownerId);

      // Then
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith({
        where: { owner_id: BigInt(1) },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedCompanies);
    });
  });

  describe('findByType', () => {
    it('should find companies by type', async () => {
      // Given
      const companyType = 1;
      const expectedCompanies = [
        { id: BigInt(1), company_type: 1, name: 'Type 1 Company' },
      ];
      mockPrisma.company.findMany.mockResolvedValue(expectedCompanies);

      // When
      const result = await companyService.findByType(companyType);

      // Then
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith({
        where: { company_type: companyType, status: 1 },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(expectedCompanies);
    });
  });

  describe('findByArea', () => {
    it('should find companies by area', async () => {
      // Given
      const area = 'Seoul';
      const expectedCompanies = [
        { id: BigInt(1), area: 'Seoul', name: 'Seoul Company' },
      ];
      mockPrisma.company.findMany.mockResolvedValue(expectedCompanies);

      // When
      const result = await companyService.findByArea(area);

      // Then
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith({
        where: {
          area: { contains: area },
          status: 1
        },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(expectedCompanies);
    });
  });

  describe('findActiveCompanies', () => {
    it('should find active companies', async () => {
      // Given
      const expectedCompanies = [
        { id: BigInt(1), status: 1, name: 'Active Company 1' },
        { id: BigInt(2), status: 1, name: 'Active Company 2' },
      ];
      mockPrisma.company.findMany.mockResolvedValue(expectedCompanies);

      // When
      const result = await companyService.findActiveCompanies();

      // Then
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith({
        where: { status: 1 },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(expectedCompanies);
    });
  });

  describe('update', () => {
    it('should update company', async () => {
      // Given
      const companyId = '1';
      const updateData = {
        name: 'Updated Company',
        business_tel: '02-9999-8888',
      };

      const expectedCompany = {
        id: BigInt(1),
        name: 'Updated Company',
        business_tel: '02-9999-8888',
      };
      mockPrisma.company.update.mockResolvedValue(expectedCompany);

      // When
      const result = await companyService.update(companyId, updateData);

      // Then
      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          name: 'Updated Company',
          business_tel: '02-9999-8888',
        },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedCompany);
    });
  });

  describe('softDelete', () => {
    it('should soft delete company by setting status to 0', async () => {
      // Given
      const companyId = '1';
      const expectedCompany = { id: BigInt(1), status: 0 };
      mockPrisma.company.update.mockResolvedValue(expectedCompany);

      // When
      const result = await companyService.softDelete(companyId);

      // Then
      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 0 },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedCompany);
    });
  });

  describe('restore', () => {
    it('should restore company by setting status to 1', async () => {
      // Given
      const companyId = '1';
      const expectedCompany = { id: BigInt(1), status: 1 };
      mockPrisma.company.update.mockResolvedValue(expectedCompany);

      // When
      const result = await companyService.restore(companyId);

      // Then
      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { status: 1 },
        include: {
          owner: {
            include: {
              profile: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedCompany);
    });
  });

  describe('count', () => {
    it('should count companies', async () => {
      // Given
      mockPrisma.company.count.mockResolvedValue(15);

      // When
      const result = await companyService.count();

      // Then
      expect(mockPrisma.company.count).toHaveBeenCalledWith({});
      expect(result).toBe(15);
    });

    it('should count companies with where condition', async () => {
      // Given
      const whereCondition = { status: 1 };
      mockPrisma.company.count.mockResolvedValue(10);

      // When
      const result = await companyService.count(whereCondition);

      // Then
      expect(mockPrisma.company.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(10);
    });
  });

  describe('exists', () => {
    it('should return true if company exists', async () => {
      // Given
      const whereCondition = { business_no: '123-45-67890' };
      mockPrisma.company.count.mockResolvedValue(1);

      // When
      const result = await companyService.exists(whereCondition);

      // Then
      expect(mockPrisma.company.count).toHaveBeenCalledWith({ where: whereCondition });
      expect(result).toBe(true);
    });

    it('should return false if company does not exist', async () => {
      // Given
      const whereCondition = { business_no: 'non-existent' };
      mockPrisma.company.count.mockResolvedValue(0);

      // When
      const result = await companyService.exists(whereCondition);

      // Then
      expect(result).toBe(false);
    });
  });
}); 