import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';
import { ServiceManager } from '../services/service.manager';
import type { CreateAdminRequestDto } from '../types/dto';

interface AdminInput {
  username: string;
  password: string;
  level: number;
}

/**
 * 비밀번호 해싱 (PBKDF2 + salt)
 */
async function hashPassword(password: string): Promise<string> {
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * 비밀번호 검증
 */
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const crypto = require('crypto');
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * 입력값 검증
 */
function validateInput(adminData: AdminInput): string[] {
  const errors: string[] = [];

  // 사용자명 검증
  if (!adminData.username || adminData.username.trim().length < 3) {
    errors.push('사용자명은 최소 3자 이상이어야 합니다.');
  }

  // 비밀번호 검증
  if (!adminData.password || adminData.password.length < 6) {
    errors.push('비밀번호는 최소 6자 이상이어야 합니다.');
  }

  // 권한 레벨 검증
  if (adminData.level < 1 || adminData.level > 10) {
    errors.push('권한 레벨은 1-10 사이여야 합니다.');
  }

  return errors;
}

/**
 * 입력 인터페이스 생성
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * 질문 함수
 */
function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 관리자 계정 생성
 */
async function createAdmin(adminData: AdminInput, serviceManager: ServiceManager): Promise<void> {
  try {
    console.log('\n🔐 관리자 계정을 생성하고 있습니다...');

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(adminData.password);

    const createData: CreateAdminRequestDto = {
      username: adminData.username,
      password: hashedPassword,
      level: adminData.level,
      status: 1
    };

    const admin = await serviceManager.adminService.create(createData);

    console.log('✅ 관리자 계정이 성공적으로 생성되었습니다!');
    console.log(`👤 사용자명: ${admin.username}`);
    console.log(`🔒 권한 레벨: ${admin.level}`);
    console.log(`📅 생성일: ${admin.created_at}`);

  } catch (error: any) {
    console.error('❌ 관리자 계정 생성 중 오류가 발생했습니다:', error.message);
    throw error;
  }
}

/**
 * 사용자 입력 수집
 */
async function collectAdminData(serviceManager: ServiceManager): Promise<AdminInput> {
  const rl = createInterface();

  try {
    console.log('👋 관리자 계정 생성을 시작합니다.\n');

    // 사용자명 입력
    let username: string;
    while (true) {
      username = await question(rl, '사용자명을 입력하세요 (최소 3자): ');

      if (username.trim().length < 3) {
        console.log('❌ 사용자명은 최소 3자 이상이어야 합니다.\n');
        continue;
      }

      // 중복 확인
      const existingAdmin = await serviceManager.adminService.findByUsername(username.trim());
      if (existingAdmin) {
        console.log('❌ 이미 존재하는 사용자명입니다. 다른 사용자명을 입력해주세요.\n');
        continue;
      }

      break;
    }

    // 비밀번호 입력
    let password: string;
    while (true) {
      password = await question(rl, '비밀번호를 입력하세요 (최소 6자): ');

      if (password.length < 6) {
        console.log('❌ 비밀번호는 최소 6자 이상이어야 합니다.\n');
        continue;
      }

      const confirmPassword = await question(rl, '비밀번호를 다시 입력하세요: ');

      if (password !== confirmPassword) {
        console.log('❌ 비밀번호가 일치하지 않습니다.\n');
        continue;
      }

      break;
    }

    // 권한 레벨 입력
    let level: number;
    while (true) {
      const levelInput = await question(rl, '권한 레벨을 입력하세요 (1-10, 기본값: 5): ');

      if (!levelInput.trim()) {
        level = 5; // 기본값
        break;
      }

      const parsedLevel = parseInt(levelInput, 10);

      if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 10) {
        console.log('❌ 권한 레벨은 1-10 사이의 숫자여야 합니다.\n');
        continue;
      }

      level = parsedLevel;
      break;
    }

    // 최종 확인
    console.log('\n📋 입력한 정보를 확인해주세요:');
    console.log(`👤 사용자명: ${username}`);
    console.log(`🔒 권한 레벨: ${level}`);

    const confirm = await question(rl, '\n✅ 이 정보로 관리자 계정을 생성하시겠습니까? (y/N): ');

    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ 관리자 계정 생성이 취소되었습니다.');
      process.exit(0);
    }

    return {
      username: username.trim(),
      password,
      level
    };

  } finally {
    rl.close();
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  let serviceManager: ServiceManager | null = null;

  try {
    console.log('🚀 관리자 계정 생성 도구를 시작합니다...\n');

    // PrismaClient 생성 및 ServiceManager 초기화
    const prisma = new PrismaClient();
    serviceManager = ServiceManager.getInstance(prisma);

    // 기존 관리자 수 확인
    const adminCount = await serviceManager.adminService.count({});
    console.log(`📊 현재 등록된 관리자 수: ${adminCount}명\n`);

    // 사용자 입력 수집
    const adminData = await collectAdminData(serviceManager);

    // 입력값 검증
    const errors = validateInput(adminData);
    if (errors.length > 0) {
      console.error('❌ 입력값 검증 실패:');
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    // 관리자 계정 생성
    await createAdmin(adminData, serviceManager);

    console.log('\n🎉 모든 작업이 완료되었습니다!');

  } catch (error: any) {
    console.error('\n❌ 오류가 발생했습니다:', error.message);
    process.exit(1);
  } finally {
    // ServiceManager 정리
    if (serviceManager) {
      await serviceManager.dispose();
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export default main; 