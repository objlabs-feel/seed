# 서비스 레이어 (Services)

이 디렉토리는 모든 비즈니스 로직과 데이터 접근을 담당하는 서비스 클래스들을 포함합니다.

## 구조

### 기본 서비스 (BaseService)
- `base.service.ts`: 모든 CRUD 서비스가 상속받는 기본 추상 클래스
- 공통 CRUD 작업, 페이지네이션, 검색 기능 제공

### 생성된 서비스들

#### 1. AdminService (`admin.service.ts`)
- 시스템 관리자 관리
- 기능: 생성, 조회, 업데이트, 삭제, 로그인 검증
- 특별 기능: 사용자명 조회, 레벨별 조회, 활성 관리자 조회

#### 2. UserService & ProfileService (`user.service.ts`)
- 사용자 및 프로필 관리
- 기능: 기본 CRUD, 디바이스 토큰 조회
- 관계: User ↔ Profile ↔ Company

#### 3. CompanyService (`company.service.ts`)
- 회사 정보 관리
- 기능: 기본 CRUD, 사업자번호 조회, 지역별 조회
- 특별 기능: 소유자별 조회, 회사 타입별 조회

#### 4. ProductService (`product.service.ts`)
- 제품 관리
- 기능: 기본 CRUD, 가격 범위 검색, 재고 조회
- 관계: Product ↔ Company, Device, Components

### 미구현 서비스들

다음 서비스들은 구조가 준비되어 있지만 아직 구현되지 않았습니다:

#### 기기 관련 서비스
- `DeviceService`: 기기 관리
- `DeviceTypeService`: 기기 타입 관리  
- `DepartmentService`: 부서 관리
- `ManufacturerService`: 제조사 관리
- `UsedDeviceService`: 중고 기기 관리

#### 판매 관련 서비스
- `SalesTypeService`: 판매 타입 관리
- `SaleItemService`: 판매 아이템 관리
- `SaleItemViewHistoryService`: 조회 이력 관리
- `SaleItemCartService`: 장바구니 관리
- `SalesAdminService`: 판매 관리자 관리

#### 경매 관련 서비스
- `AuctionItemService`: 경매 아이템 관리
- `AuctionItemHistoryService`: 경매 이력 관리

#### 알림 관련 서비스
- `NotificationInfoService`: 알림 설정 관리
- `NotificationMessageService`: 알림 메시지 관리

## 사용법

### 기본 사용 예시

```typescript
import { AdminService } from './services';

// PrismaClient 인스턴스와 함께 서비스 초기화
const adminService = new AdminService(prismaClient);

// 관리자 생성
const newAdmin = await adminService.create({
  username: 'admin',
  password: 'hashedPassword',
  level: 1,
  status: 1
});

// 페이지네이션과 함께 조회
const admins = await adminService.findWithPagination({
  page: 1,
  limit: 10,
  where: { status: 1 },
  orderBy: { created_at: 'desc' }
});

// 검색
const searchResult = await adminService.search({
  keyword: '관리자',
  status: 1,
  page: 1,
  limit: 10
});
```

### 고급 사용 예시

```typescript
// 관계형 데이터와 함께 조회
const users = await userService.findWithPagination({
  include: {
    profile: {
      include: {
        company: true
      }
    }
  },
  where: { status: 1 }
});

// 복잡한 검색 조건
const products = await productService.search({
  keyword: '스마트폰',
  min_price: 100000,
  max_price: 500000,
  owner_id: '12345',
  page: 1,
  limit: 20
});
```

## 특징

### 1. 타입 안전성
- TypeScript로 작성되어 컴파일 타임 타입 검사
- 모든 입출력 데이터는 DTO로 타입 정의

### 2. 일관된 인터페이스
- 모든 서비스는 BaseService를 상속
- 표준화된 CRUD 메서드 제공

### 3. 페이지네이션 지원
- 기본 페이지네이션 기능 내장
- 성능을 위한 limit/offset 처리

### 4. 소프트 삭제
- 실제 삭제 대신 status 필드를 0으로 설정
- 데이터 복구 가능

### 5. 검색 및 필터링
- 키워드 검색 지원
- 복합 조건 검색 가능
- 정렬 옵션 제공

## 확장 방법

새로운 서비스를 추가하려면:

1. BaseService를 상속하는 새 클래스 생성
2. 필요한 DTO 타입 import
3. 추상 메서드들 구현
4. 모델별 특화 메서드 추가
5. index.ts에 export 추가

```typescript
export class NewModelService extends BaseService<NewModel, CreateDto, UpdateDto> {
  protected modelName = 'newModel';
  
  constructor(protected prisma: any) {
    super();
  }
  
  // 추상 메서드 구현
  async create(data: CreateDto): Promise<NewModel> {
    // 구현
  }
  
  // 특화 메서드
  async findBySpecialCondition(): Promise<NewModel[]> {
    // 구현
  }
}
``` 