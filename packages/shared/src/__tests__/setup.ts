/**
 * Jest 테스트 환경 설정
 * 모든 테스트 파일이 실행되기 전에 초기화됩니다.
 */

// 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// 글로벌 모킹
global.console = {
  ...console,
  // 테스트 중 불필요한 로그 억제
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// BigInt JSON 직렬화 지원
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// 테스트 타임아웃 설정
jest.setTimeout(10000);

// 모든 테스트 후 정리
afterAll(async () => {
  // 추가 정리 작업이 필요한 경우
}); 