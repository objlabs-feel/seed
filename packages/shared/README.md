# @repo/shared

Prisma 기반 서비스 모듈 라이브러리

참조 가능 모듈
# @repo/shared : 전역 모듈 전부 임포트
# @repo/shared/models : 객체 데이터 모델 모듈
# @repo/shared/dto : 객체 데이터 모델의 DTO객체 모듈
# @repo/shared/transformers : 데이터 트랜스퍼 모듈
# @repo/shared/services : 비즈니스 로직 서비스 모듈
# @repo/shared/libs : 참조가능 라이브러리 모듈

# 프롬프트 AI가 개발 서포트 할때의 유의사항
1. 이미 만들어져 있는 코드를 최대한 활용
2. 오류가 있는 코드는 오류 수정
3. 필요한 기능 추가시에는 작업계획을 확인하고 추가 진행
4. 함수형 개발을 위한 구조가 우선이지만, 가독성과 재사용성을 생각해야할 부분에서는 일부 무시할 수 있고, 무시하게 될때는 작업계획을 확인하고 진행

개발 진행시 데이터 모델의 기준 우선순위
1. /Users/feel/workgroup/objlabs/projects/seed/packages/shared/prisma/schema.prisma
2. /Users/feel/workgroup/objlabs/projects/seed/packages/shared/src/types/models.ts
3. /Users/feel/workgroup/objlabs/projects/seed/packages/shared/src/types/dto/index.ts
4. /Users/feel/workgroup/objlabs/projects/seed/packages/shared/src/transformers/index.ts

개발에 사용되는 비즈니스 로직을 정의한 경로
/Users/feel/workgroup/objlabs/projects/seed/packages/shared/src/services

## 특징

- 표준화된 리포지토리 패턴을 사용하여 데이터베이스 작업을 추상화
- 비즈니스 로직을 깔끔하게 분리하여 유지보수성 향상
- 타입 안전성을 위한 완전한 TypeScript 통합
- 자동 생성된 Prisma 클라이언트를 활용하여 안전한 데이터베이스 작업 보장
- 모듈식 아키텍처로 코드 재사용 촉진

## 설치

프로젝트의 루트 디렉토리에서 다음 명령을 실행하세요:

```bash
cd packages/shared
npm install
```

## 서비스 모듈

이 라이브러리는 다음 주요 서비스 모듈을 제공합니다:

- **기본 서비스**: 공통 CRUD 작업을 위한 기본 클래스
- **부서 서비스**: 부서 관리를 위한 기능
- **사용자 서비스**: 사용자 계정 및 권한 관리
- **알림 서비스**: 사용자 알림 시스템
- **장치 서비스**: 장치 유형 및 장치 관리
- **제조사 서비스**: 제조업체 정보 관리
- **개인 장치 서비스**: 사용자별 개인 장치 관리
- **프로필 서비스**: 사용자 프로필 관리
- **제품 서비스**: 제품 정보 및 속성 관리
- **회사 서비스**: 회사 정보 및 관리
- **판매 아이템 서비스**: 판매 관련 항목 관리
- **진료과-장치 타입 연결 서비스**: 진료과와 장치 타입 간의 연결 관리

## 사용 예시

```typescript
import { 
  departmentService, 
  userService, 
  notificationService 
} from '@repo/shared';

// 부서 목록 조회
const departments = await departmentService.findAllDepartments();

// 사용자 생성
const newUser = await userService.createUser({
  username: 'test_user',
  email: 'test@example.com',
  // 추가 필드
});

// 알림 전송
await notificationService.broadcastNotification('시스템 점검 안내', '오늘 밤 11시부터 새벽 2시까지 시스템 점검이 있을 예정입니다.');
```

## 테스트

다양한 테스트 실행 옵션이 있습니다:
### 테스트 파일 구조

테스트 파일은 다음 디렉토리에 있습니다:

```
src/__tests__/            # 모든 테스트 파일
├── helpers/              # 테스트 헬퍼 및 유틸리티
│   ├── mockFactory.ts    # 모의 데이터 생성 
│   ├── prisma-mock.ts    # Prisma 모킹 
│   └── serviceTestUtil.ts # 서비스 테스트 유틸리티
├── services/             # 서비스별 테스트 파일
│   ├── userService.test.ts
│   ├── departmentService.test.ts
│   └── ...               # 기타 서비스 테스트
├── services.test.ts      # 서비스 모듈 구조 테스트
├── setup.ts              # 테스트 설정 
├── TEST_GUIDE.md         # 테스트 작성 가이드
└── TEST_SUMMARY.md       # 테스트 상태 요약
```

### 테스트 작성 가이드

## 개발

### 필수 도구

- Node.js v18 이상
- npm 9 이상

### 개발 명령어

```bash
# Prisma 클라이언트 생성
npx run prisma generate

# Prisma 변경사항 마이그레이션
npx run prisma migrate

# Prisma 변경사항 주입
npx run prisma db push
```

## 문서화

모든 서비스 모듈은 JSDoc 주석을 포함하고 있으며, TypeScript 타입 정의를 통해 API 문서화를 제공합니다. 