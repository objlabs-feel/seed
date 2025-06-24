import { PrismaClient } from '@prisma/client';

/**
 * Prisma 클라이언트 설정 타입
 */
export interface PrismaConfig {
  /** 로깅 레벨 설정 */
  log?: Array<'query' | 'info' | 'warn' | 'error'>;
  /** 에러 포맷 설정 */
  errorFormat?: 'pretty' | 'colorless' | 'minimal';
  /** 데이터소스 URL 오버라이드 */
  datasourceUrl?: string;
}

/**
 * 환경별 Prisma 설정
 */
export const getPrismaConfig = (): PrismaConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    log: isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : isTest
        ? ['warn', 'error']
        : ['error'],
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
    datasourceUrl: process.env.DATABASE_URL,
  };
};

/**
 * Prisma 클라이언트 생성 함수
 * ServiceFactory에서 사용하기 위한 팩토리 함수
 */
export const createPrismaClient = (config?: PrismaConfig): PrismaClient => {
  const finalConfig = { ...getPrismaConfig(), ...config };

  return new PrismaClient({
    log: finalConfig.log,
    errorFormat: finalConfig.errorFormat,
    datasources: finalConfig.datasourceUrl
      ? {
        db: {
          url: finalConfig.datasourceUrl,
        },
      }
      : undefined,
  });
};

/**
 * Prisma 클라이언트 연결 상태 확인
 */
export const checkDatabaseConnection = async (prisma: PrismaClient): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

/**
 * 데이터베이스 연결 재시도 함수
 */
export const retryDatabaseConnection = async (
  prisma: PrismaClient,
  maxRetries: number = 5,
  delay: number = 1000
): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    const isConnected = await checkDatabaseConnection(prisma);
    if (isConnected) {
      return true;
    }

    if (i < maxRetries - 1) {
      console.log(`Database connection attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // 지수 백오프
    }
  }

  return false;
};

/**
 * Prisma 클라이언트 연결 해제 헬퍼
 */
export const disconnectPrisma = async (prisma: PrismaClient): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('Prisma client disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error);
  }
};

/**
 * 데이터베이스 정보 조회
 */
export const getDatabaseInfo = async (prisma: PrismaClient) => {
  try {
    // 데이터베이스 버전 정보 (PostgreSQL 예시)
    const result = await prisma.$queryRaw`SELECT version()` as any[];
    return {
      connected: true,
      version: result[0]?.version || 'Unknown',
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    };
  }
};

/**
 * 트랜잭션 헬퍼 함수
 */
export const withTransaction = async <T>(
  prisma: PrismaClient,
  operations: (tx: any) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(async (tx) => {
    return await operations(tx);
  });
};

/**
 * 프로세스 종료 시 Prisma 연결 정리를 위한 헬퍼
 */
export const setupGracefulShutdown = (prisma: PrismaClient): void => {
  const gracefulShutdown = async () => {
    if (prisma) {
      await disconnectPrisma(prisma);
    }
  };

  // 프로세스 종료 시 연결 정리
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('beforeExit', gracefulShutdown);
};

/**
 * Prisma 클라이언트 타입 내보내기
 */
export type { PrismaClient } from '@prisma/client';

/**
 * 싱글턴 Prisma 클라이언트 인스턴스
 */
export const prisma = createPrismaClient();
