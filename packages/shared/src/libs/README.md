# 📚 Libs 유틸리티 라이브러리

애플리케이션 개발에 필요한 핵심 유틸리티들을 제공합니다.

## 📋 목차
- [개요](#개요)
- [Prisma 유틸리티](#prisma-유틸리티)
- [앱 서비스 래퍼](#앱-서비스-래퍼)
- [빠른 시작](#빠른-시작)
- [사용 예제](#사용-예제)
- [트러블슈팅](#트러블슈팅)

## 🎯 개요

`libs` 폴더는 다음 유틸리티들을 제공합니다:

### 📁 파일 구조
```
libs/
├── prisma.ts                 # 데이터베이스 유틸리티
├── app.service.wrapper.ts    # 앱 서비스 래퍼
├── index.ts                  # 통합 export
└── README.md                 # 가이드 (현재 파일)
```

## 🗄️ Prisma 유틸리티

### 주요 기능
- PrismaClient 생성 및 관리
- 환경별 설정 최적화
- 연결 상태 관리
- 트랜잭션 헬퍼

### 사용법

```typescript
import { 
  createPrismaClient, 
  checkPrismaConnection,
  withTransaction 
} from '@repo/shared';

// 기본 클라이언트 생성
const prisma = createPrismaClient();

// 환경별 설정
const prisma = createPrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  logLevel: 'development' // 'development' | 'production' | 'test'
});

// 연결 확인
const isConnected = await checkPrismaConnection(prisma);

// 트랜잭션 헬퍼
const result = await withTransaction(prisma, async (tx) => {
  const user = await tx.user.create({ data: userData });
  const profile = await tx.profile.create({ data: { userId: user.id } });
  return { user, profile };
});
```

## 🎛️ 앱 서비스 래퍼

### 주요 기능
- 서버 환경에서 서비스 초기화
- Route handlers용 래퍼 함수들
- 자동 에러 처리
- 하위 호환성 지원

### 새로운 API (권장)

```typescript
import { 
  useAppServices,
  useAppAdminService,
  routeWithServices 
} from '@repo/shared';

// 모든 서비스 접근
const services = useAppServices();
const admin = await services.admin.findById('1');

// 개별 서비스 접근
const adminService = useAppAdminService();
const admin = await adminService.findById('1');
```

### 하위 호환성 API

```typescript
import { 
  useNextjsServices,    // ✅ 계속 지원
  useServerServices     // ✅ 계속 지원
} from '@repo/shared';
```

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
NODE_ENV=development
```

### 2. 기본 사용법

```typescript
// lib/services.ts (선택사항)
import { 
  useAppServices,
  useAppAdminService 
} from '@repo/shared';

// 간단한 re-export
export { 
  useAppServices as useServices,
  useAppAdminService as useAdminService
};
```

## 📖 사용 예제

### App Router - Route Handlers

```typescript
// app/api/admin/route.ts
import { useAppAdminService } from '@repo/shared';

export async function GET(request: Request) {
  const adminService = useAppAdminService();
  const { searchParams } = new URL(request.url);
  
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  
  const result = await adminService.findWithPagination({ page, limit });
  return Response.json(result);
}

export async function POST(request: Request) {
  const adminService = useAppAdminService();
  const body = await request.json();
  
  const admin = await adminService.create(body);
  return Response.json(admin, { status: 201 });
}
```

### 래퍼 함수 사용 (권장)

```typescript
// app/api/admin/route.ts
import { routeWithServices } from '@repo/shared';

export const GET = routeWithServices(async (request, services) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  
  const result = await services.admin.findWithPagination({ page, limit });
  return Response.json(result);
});

export const POST = routeWithServices(async (request, services) => {
  const body = await request.json();
  const admin = await services.admin.create(body);
  return Response.json(admin, { status: 201 });
});
```

### Pages Router - API Routes

```typescript
// pages/api/admin/index.ts
import { apiWithServices } from '@repo/shared';

export default apiWithServices(async (req, res, services) => {
  if (req.method === 'GET') {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    
    const result = await services.admin.findWithPagination({ page, limit });
    return res.json(result);
  }
  
  if (req.method === 'POST') {
    const admin = await services.admin.create(req.body);
    return res.json(admin);
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
```

### Server Components

```typescript
// app/admin/page.tsx
import { useAppAdminService } from '@repo/shared';

export default async function AdminPage({
  searchParams
}: {
  searchParams: { page?: string; limit?: string }
}) {
  const adminService = useAppAdminService();
  
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  
  const { data: admins, total, totalPages } = await adminService.findWithPagination({
    page,
    limit,
    where: { status: 1 }
  });
  
  return (
    <div>
      <h1>관리자 목록 ({total}명)</h1>
      <div>
        {admins.map(admin => (
          <div key={admin.id}>
            <h3>{admin.username}</h3>
            <p>레벨: {admin.level}</p>
          </div>
        ))}
      </div>
      <div>페이지: {page} / {totalPages}</div>
    </div>
  );
}
```

### Server Actions

```typescript
// app/admin/actions.ts
'use server';

import { useAppAdminService } from '@repo/shared';
import { revalidatePath } from 'next/cache';

export async function createAdmin(formData: FormData) {
  const adminService = useAppAdminService();
  
  const admin = await adminService.create({
    username: formData.get('username') as string,
    password: formData.get('password') as string,
    level: Number(formData.get('level')),
  });
  
  revalidatePath('/admin');
  return admin;
}
```

## 🔧 고급 사용법

### 커스텀 서비스 훅

```typescript
// lib/custom-hooks.ts
import { useAppServices } from '@repo/shared';

export function useAdminOperations() {
  const services = useAppServices();
  
  return {
    async createAdminWithDefaults(data: Partial<any>) {
      return await services.admin.create({
        level: 1,
        status: 1,
        ...data,
      });
    },
    
    async getActiveAdmins() {
      return await services.admin.findMany({
        where: { status: 1 },
        orderBy: { created_at: 'desc' }
      });
    },
  };
}
```

### 트랜잭션 사용

```typescript
import { useAppServices, withTransaction } from '@repo/shared';

const services = useAppServices();
const result = await withTransaction(services.getPrismaClient(), async (tx) => {
  const admin = await tx.admin.create({ data: adminData });
  const log = await tx.adminLog.create({ 
    data: { adminId: admin.id, action: 'created' } 
  });
  return { admin, log };
});
```

## 🧪 테스트 설정

```typescript
// __tests__/api/admin.test.ts
import { createMocks } from 'node-mocks-http';
import { ServiceFactory } from '@repo/shared';

// Mock PrismaClient
const mockPrisma = {
  admin: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  }
};

beforeEach(() => {
  ServiceFactory.createForTest(mockPrisma);
});

describe('/api/admin', () => {
  it('should create admin', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'testadmin', password: 'password', level: 1 },
    });

    mockPrisma.admin.create.mockResolvedValue({
      id: 1,
      username: 'testadmin',
      level: 1,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({
      username: 'testadmin',
    });
  });
});
```

## 🚨 트러블슈팅

### 일반적인 문제들

#### 1. "서비스는 서버 사이드에서만 초기화할 수 있습니다"
```typescript
// ❌ 클라이언트 컴포넌트에서 사용
'use client';
import { useAppAdminService } from '@repo/shared';

// ✅ 서버 컴포넌트 또는 API 라우트에서만 사용
```

#### 2. 서비스가 초기화되지 않음
```typescript
// 서비스 상태 확인
import { isServicesInitialized } from '@repo/shared';

if (!isServicesInitialized()) {
  console.log('서비스가 아직 초기화되지 않았습니다.');
}
```

#### 3. 타입 오류
```typescript
// prisma 타입이 인식되지 않는 경우
import type { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}
```

### 성능 최적화

#### 1. 서비스 재사용
```typescript
// ✅ 좋은 예 - 한 번만 호출
const services = useAppServices();
const admin = await services.admin.findById('1');
const user = await services.user.findById('1');

// ❌ 나쁜 예 - 매번 새로 호출
const admin = await useAppAdminService().findById('1');
const user = await useAppUserService().findById('1');
```

#### 2. 조건부 로딩
```typescript
// 필요한 경우에만 서비스 로드
if (requiresAdminAccess) {
  const adminService = useAppAdminService();
  // ...
}
```

## 📈 모니터링

### 서비스 상태 확인

```typescript
// app/api/health/route.ts
import { isServicesInitialized } from '@repo/shared';

export async function GET() {
  const isReady = isServicesInitialized();
  
  return Response.json({
    status: isReady ? 'healthy' : 'not ready',
    timestamp: new Date().toISOString(),
  });
}
```

## 🔄 마이그레이션 가이드

### 기존 코드에서 새 API로 전환

```typescript
// Before (계속 작동함)
import { useNextjsServices, useNextjsAdminService } from '@repo/shared';

// After (권장)
import { useAppServices, useAppAdminService } from '@repo/shared';

// 래퍼 함수들도 새로운 이름 사용 권장
// Before: withAppRouterServices, withApiServices
// After: routeWithServices, apiWithServices
```

이 라이브러리들을 통해 깔끔하고 효율적인 애플리케이션을 구축하세요! 🚀 