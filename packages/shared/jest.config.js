/** @type {import('jest').Config} */
module.exports = {
  // 테스트 환경 설정
  testEnvironment: 'node',
  
  // TypeScript 지원
  preset: 'ts-jest',
  
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts',
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  

  
  // 모듈 해석
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 테스트 환경 변수
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*',
    '!src/**/index.ts',
  ],
  
  // 커버리지 리포트
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  
  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // 테스트 타임아웃
  testTimeout: 10000,
  
  // 병렬 실행
  maxWorkers: '50%',
  
  // 자세한 출력
  verbose: true,
  
  // 캐시 비활성화 (개발 중)
  cache: false,
  
  // 변환 설정 (새로운 방식)
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
}; 