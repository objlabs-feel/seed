# 🧪 테스트 시스템 가이드

Jest를 이용한 완전한 unit test 시스템입니다.

## 📁 테스트 구조

```
src/__tests__/
├── setup.ts                    # Jest 환경 설정
├── mocks/
│   └── prisma.mock.ts          # Prisma 모킹 유틸리티
├── transformers/
│   └── admin.transformer.test.ts # Transformer 테스트
├── services/
│   ├── admin.service.test.ts    # Service 테스트
│   └── serviceManager.test.ts   # 서비스 관리 테스트
└── integration/
    └── nextjs.test.ts          # Next.js 통합 테스트
```

## 🚀 테스트 실행

### 기본 실행
```bash
npm test
```

### Watch 모드 (개발 중)
```bash
npm run test:watch
```

### 커버리지 포함
```bash
npm run test:coverage
```

### 자세한 출력
```bash
npm run test:verbose
```

### 디버깅 모드
```bash
npm run test:debug
```

## 🎯 테스트 범위

### 1. **Transformer 테스트** (`transformers/`)
- 순수 함수의 변환 로직 테스트
- 입력/출력 데이터 검증
- Edge case 처리

```typescript
describe('toAdminResponseDto', () => {
  it('should transform Admin model to AdminResponseDto', () => {
    // Given
    const admin = TestDataFactory.createAdmin({
      id: 1,
      username: 'testadmin',
      level: 5,
    });

    // When
    const result = toAdminResponseDto(admin);

    // Then
    expect(result).toEqual({
      id: '1',
      username: 'testadmin',
      level: 5,
      // ...
    });
  });
});
```

### 2. **Service 테스트** (`services/`)
- CRUD 작업 테스트
- 비즈니스 로직 검증
- PrismaClient 모킹

```typescript
describe('AdminService', () => {
  let adminService: AdminService;
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    adminService = new AdminService(prismaMock);
  });

  it('should create a new admin', async () => {
    // Given
    const createData = { username: 'newadmin', level: 1 };
    prismaMock.admin.create.mockResolvedValue(expectedAdmin);

    // When
    const result = await adminService.create(createData);

    // Then
    expect(prismaMock.admin.create).toHaveBeenCalledWith({
      data: createData,
    });
    expect(result).toEqual(expectedAdmin);
  });
});
```

### 3. **통합 테스트** (`integration/`)
- Next.js 환경 시뮬레이션
- 서비스 초기화 테스트
- 환경별 동작 검증

```typescript
describe('Next.js Integration', () => {
  beforeEach(() => {
    delete (global as any).window; // 서버 환경 시뮬레이션
    global.__nextjs_services = undefined;
  });

  it('should initialize services in server environment', () => {
    const serviceManager = initializeNextjsServices();
    expect(serviceManager).toBeDefined();
  });
});
```

## 🛠️ 모킹 시스템

### PrismaClient 모킹
```typescript
import { createPrismaMock, setupCommonMocks } from '../mocks/prisma.mock';

const prismaMock = createPrismaMock();
setupCommonMocks(prismaMock);

// 특정 메서드 모킹
prismaMock.admin.findMany.mockResolvedValue([]);
prismaMock.admin.create.mockResolvedValue(mockAdmin);
```

### 테스트 데이터 팩토리
```typescript
import { TestDataFactory } from '../mocks/prisma.mock';

// 기본 관리자 생성
const admin = TestDataFactory.createAdmin();

// 커스텀 데이터로 생성
const admin = TestDataFactory.createAdmin({
  username: 'customadmin',
  level: 10,
});

// 페이지네이션 응답 생성
const paginatedResponse = TestDataFactory.createPaginationResponse(admins, 100);
```

## 📊 커버리지 목표

현재 설정된 커버리지 임계값:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### 커버리지 보고서 확인
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🧩 테스트 패턴

### Given-When-Then 패턴
```typescript
it('should do something', () => {
  // Given - 테스트 조건 설정
  const input = 'test';
  
  // When - 실행
  const result = functionUnderTest(input);
  
  // Then - 검증
  expect(result).toBe('expected');
});
```

### 에러 케이스 테스트
```typescript
it('should throw error when invalid input', async () => {
  // Given
  prismaMock.admin.create.mockRejectedValue(new Error('Database error'));
  
  // When & Then
  await expect(adminService.create(invalidData))
    .rejects.toThrow('Database error');
});
```

### Edge Case 테스트
```typescript
describe('Edge Cases', () => {
  it('should handle empty array', () => {
    const result = transformArray([]);
    expect(result).toEqual([]);
  });

  it('should handle null values', () => {
    const result = transform(null);
    expect(result).toBeNull();
  });
});
```

## 🔧 설정 파일

### `jest.config.js`
- TypeScript 지원
- 테스트 환경 설정
- 커버리지 설정
- 타임아웃 설정

### `setup.ts`
- 글로벌 환경 변수
- BigInt JSON 직렬화
- 콘솔 로그 모킹

## 🚨 주의사항

### 1. 비동기 테스트
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### 2. Mock 초기화
```typescript
beforeEach(() => {
  resetAllMocks(prismaMock);
});
```

### 3. 환경 변수 설정
```typescript
beforeEach(() => {
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});
```

## 🎯 테스트 작성 가이드라인

### 1. **단위 테스트**
- 하나의 함수/메서드만 테스트
- 외부 의존성은 모킹
- 빠른 실행 속도

### 2. **통합 테스트**
- 여러 컴포넌트 간 상호작용 테스트
- 실제 환경과 유사한 조건
- 시나리오 기반 테스트

### 3. **에러 처리**
- 예상되는 모든 에러 케이스
- 경계값 테스트
- 예외 상황 처리

### 4. **코드 커버리지**
- 모든 분기문 커버
- 함수의 모든 경로 테스트
- Edge case 포함

이 테스트 시스템으로 **견고하고 신뢰할 수 있는 코드**를 유지할 수 있습니다! 🚀 