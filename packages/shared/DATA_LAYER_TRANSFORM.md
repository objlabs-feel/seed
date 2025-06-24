# 데이터 변환 계층 추가 작업 요약

## 1. 개요

이 문서는 Prisma 데이터 모델과 서비스 레이어, 그리고 API 응답 사이의 데이터 변환을 위한 계층 추가 작업을 요약합니다.

## 2. 디렉토리 구조

```
src/
├── types/
│   ├── dto/
│   │   ├── index.ts        # 기본 DTO 인터페이스
│   │   ├── user.dto.ts     # 사용자 관련 DTO
│   │   └── device.dto.ts   # 장치 관련 DTO
│   └── ...
├── transformers/
│   ├── common.ts           # 공통 변환 유틸리티
│   ├── user.transformer.ts # 사용자 데이터 변환기
│   └── device.transformer.ts # D장치 데이터 변환기
└── services/
    ├── userService.ts      # 변환된 사용자 서비스
    ├── personalDeviceService.ts # 변환된 개인 장치 서비스
    └── ...
```

## 3. 구현 내용

### 3.1 DTO (Data Transfer Object) 타입 정의

- **기본 DTO 인터페이스**: 모든 DTO가 공통으로 가지는 속성을 정의
- **사용자 DTO**: 클라이언트에 전달되는 사용자 객체 형태 정의
- **장치 DTO**: 클라이언트에 전달되는 장치 객체 형태 정의

### 3.2 데이터 변환 유틸리티

- **BigInt 처리**: BigInt를 문자열이나 숫자로 변환하는 함수
- **JSON 파싱**: JSON 데이터를 안전하게 파싱하는 함수
- **네이밍 변환**: snake_case와 camelCase 간 변환 함수

### 3.3 모델별 변환기

- **사용자 변환기**: Prisma User 모델과 UserDTO 간 변환
- **장치 변환기**: Prisma Device 모델과 DeviceDTO 간 변환

### 3.4 서비스 레이어 수정

- **비동기 처리**: 모든 함수를 async/await 패턴으로 통일
- **DTO 반환**: Prisma 모델을 직접 반환하지 않고 DTO로 변환하여 반환
- **타입 안전성**: TypeScript 타입 정의를 통한 타입 안전성 확보

## 4. 주요 변경 사항

### 4.1 타입 변환 규칙

| Prisma 모델 타입 | DTO 타입           | 비고                         |
|-------------------|---------------------|------------------------------|
| bigint            | string             | JS에서 안전하게 처리하기 위함 |
| snake_case 키     | camelCase 키       | 프론트엔드 코드 스타일에 맞춤 |
| Date              | Date 또는 ISO 문자열 | API 응답 시 문자열로 변환 가능 |
| JSON              | 객체 타입          | 자동 파싱                   |

### 4.2 서비스 함수 패턴

모든 서비스 함수는 다음 패턴을 따릅니다:

```typescript
export const someFunction = async (params): Promise<SomeDTO> => {
  // 1. DTO → Prisma 입력으로 변환 (필요한 경우)
  const prismaData = someDtoToPrisma(params);
  
  // 2. Prisma 작업 수행
  const result = await prisma.someModel.someAction(prismaData);
  
  // 3. Prisma 결과 → DTO로 변환하여 반환
  return someToDTO(result);
};
```

## 5. 남은 작업

- **나머지 서비스 적용**: 모든 서비스 파일에 변환 계층 적용
- **테스트 코드 수정**: 변경된 서비스 레이어에 맞추어 테스트 코드 수정
- **모델 타입 통합**: Prisma 모델과 완벽하게 일치하는 TypeScript 타입 정의
- **에러 처리 개선**: 데이터 변환 과정에서 발생할 수 있는 오류에 대한 처리

## 6. 이점

- **일관성**: Prisma 모델과 서비스 레이어 간 명확한 분리로 일관성 유지
- **유연성**: 데이터 모델 변경 시 변환 계층만 수정하면 됨
- **타입 안전성**: TypeScript로 인한 강력한 타입 검사
- **확장성**: 새로운 모델 추가 시 동일한 패턴으로 쉽게 확장 가능 