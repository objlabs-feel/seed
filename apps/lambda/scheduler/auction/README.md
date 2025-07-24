# Auction Scheduler Lambda

경매 시스템을 위한 스케줄러 Lambda 함수입니다. EventBridge를 통해 정기적으로 특정 API를 호출합니다.

## 기능

- **만료된 경매 처리**: 매일 자정에 만료된 경매를 처리
- **경매 리마인더**: 매시간 경매 리마인더 전송
- **정리 작업**: 매주 일요일 새벽 2시에 오래된 데이터 정리
- **커스텀 이벤트**: EventBridge를 통한 커스텀 이벤트 처리

## 설치 및 배포

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# API 설정
API_BASE_URL=https://your-api-domain.com
API_TOKEN=your-api-token-here

# AWS 설정
CDK_DEFAULT_ACCOUNT=your-aws-account-id
CDK_DEFAULT_REGION=ap-northeast-2
```

### 3. 빌드
```bash
npm run build
```

### 4. 배포
```bash
npm run deploy
```

## 스케줄 설정

### 만료된 경매 처리
- **스케줄**: 매일 자정 (00:00)
- **API 엔드포인트**: `/api/v1/auctions/process-expired`
- **메서드**: POST

### 경매 리마인더
- **스케줄**: 매시간 (00분)
- **API 엔드포인트**: `/api/v1/auctions/send-reminders`
- **메서드**: POST

### 정리 작업
- **스케줄**: 매주 일요일 새벽 2시 (02:00)
- **API 엔드포인트**: `/api/v1/auctions/cleanup`
- **메서드**: POST

## 커스텀 이벤트

EventBridge를 통해 커스텀 이벤트를 전송하면 `/api/v1/scheduler/webhook` 엔드포인트로 전달됩니다.

### 이벤트 예시
```json
{
  "detail-type": "auction.custom",
  "source": "auction.scheduler",
  "detail": {
    "action": "custom-action",
    "data": {
      "auctionId": "123",
      "userId": "456"
    }
  }
}
```

## 로컬 테스트

```typescript
import { testApiCall } from './src/index';

// 만료된 경매 처리 테스트
await testApiCall('auction.expired');

// 리마인더 테스트
await testApiCall('auction.reminder');

// 정리 작업 테스트
await testApiCall('auction.cleanup');
```

## 모니터링

- **CloudWatch Logs**: Lambda 함수의 실행 로그
- **EventBridge**: 스케줄 이벤트 모니터링
- **API 응답**: 각 API 호출의 성공/실패 상태

## 문제 해결

### 타임아웃 오류
- Lambda 함수의 타임아웃 설정을 확인 (현재 5분)
- API 응답 시간을 확인

### 인증 오류
- `API_TOKEN` 환경 변수가 올바르게 설정되었는지 확인
- API 서버의 인증 설정 확인

### 네트워크 오류
- `API_BASE_URL`이 올바른지 확인
- VPC 설정 확인 (필요한 경우) 