import { ServiceManager } from '../services/service.manager';
import type { CreateDepartmentRequestDto, CreateDeviceTypeRequestDto } from '../types/dto';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface DeviceTypeData {
  code: string;
  name: string;
  description: string;
  sort_key: number;
}

interface DepartmentData {
  department_code: string;
  department_name: string;
  department_description: string;
  department_sort_key: number;
  tags: string;
  device_types: DeviceTypeData[];
}

async function importDepartmentDeviceTypes() {
  const prismaClient = new PrismaClient();
  const serviceManager = new ServiceManager(prismaClient);
  const prisma = serviceManager.getPrismaClient();

  try {
    console.log('🚀 부서 및 기기 타입 데이터 가져오기 시작...');

    // JSON 파일 읽기
    const filePath = path.join(__dirname, '../../public/medidealer_device_types_restructured.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const departmentData: DepartmentData[] = JSON.parse(jsonData);

    console.log(`📄 JSON 파일에서 ${departmentData.length}개 부서 데이터 로드됨`);

    // 1. 기존 데이터 정리
    console.log('🧹 기존 데이터 정리 중...');

    // 연결 테이블 삭제
    const deletedRelations = await serviceManager.deviceTypeService.deleteDepartmentToDeviceTypeMany({});
    console.log(`🗑️ ${deletedRelations.count}개 부서-기기타입 연결 삭제됨`);

    // DeviceType 삭제
    const deletedDeviceTypes = await serviceManager.deviceTypeService.deleteMany({});
    console.log(`🗑️ ${deletedDeviceTypes.count}개 기기 타입 삭제됨`);

    // Department 삭제
    const deletedDepartments = await serviceManager.departmentService.deleteMany({});
    console.log(`🗑️ ${deletedDepartments.count}개 부서 삭제됨`);

    // AUTO INCREMENT 시퀀스 리셋
    console.log('🔄 AUTO INCREMENT 시퀀스 리셋 중...');
    await prisma.$executeRaw`ALTER SEQUENCE department_id_seq RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE device_type_id_seq RESTART WITH 1`;

    // 트랜잭션으로 모든 작업 실행
    await prisma.$transaction(async (tx) => {
      // 2. 부서(Department) 데이터 삽입
      console.log('🏢 부서 데이터 삽입 중...');
      const departmentInsertData: CreateDepartmentRequestDto[] = departmentData.map(dept => ({
        code: dept.department_code,
        name: dept.department_name,
        description: dept.department_description,
        sort_key: dept.department_sort_key,
        status: 1, // 활성 상태
      }));

      const createdDepartments = await serviceManager.departmentService.createMany(departmentInsertData);
      console.log(`✅ ${createdDepartments.count}개 부서 생성됨`);

      // 3. 기기 타입(DeviceType) 데이터 수집 및 중복 제거
      console.log('🔧 기기 타입 데이터 수집 중...');
      const allDeviceTypes = new Map<string, DeviceTypeData>();

      departmentData.forEach(dept => {
        dept.device_types.forEach(deviceType => {
          const key = deviceType.code;
          if (!allDeviceTypes.has(key)) {
            allDeviceTypes.set(key, deviceType);
          }
        });
      });

      // 4. 기기 타입 데이터 삽입
      console.log('🔧 기기 타입 데이터 삽입 중...');
      let count = 0;
      let device_type_sort_key_in_department = 1000;
      const deviceTypeInsertData: CreateDeviceTypeRequestDto[] = Array.from(allDeviceTypes.values()).map(deviceType => ({
        code: deviceType.code,
        name: deviceType.name,
        description: deviceType.description,
        sort_key: device_type_sort_key_in_department + count++,
        status: 1, // 활성 상태
      }));

      const createdDeviceTypes = await serviceManager.deviceTypeService.createMany(deviceTypeInsertData);
      console.log(`✅ ${createdDeviceTypes.count}개 기기 타입 생성됨`);

      // 5. 생성된 부서와 기기 타입 ID 매핑 가져오기
      console.log('🔍 부서 및 기기 타입 ID 매핑 조회 중...');
      const departments = await serviceManager.departmentService.findMany({
        where: {
          code: {
            in: departmentData.map(dept => dept.department_code)
          }
        }
      });

      const deviceTypes = await serviceManager.deviceTypeService.findMany({
        where: {
          code: {
            in: Array.from(allDeviceTypes.keys())
          }
        }
      });

      // ID 매핑 생성
      const departmentMap = new Map(departments.map(dept => [dept.code!, dept.id]));
      const deviceTypeMap = new Map(deviceTypes.map(dt => [dt.code!, dt.id]));

      // 6. 부서-기기 타입 연결 데이터 생성
      console.log('🔗 부서-기기 타입 연결 데이터 생성 중...');
      const relationshipData: {
        department_id: number | bigint;
        device_type_id: number | bigint;
        sort_key: number;
        status: number;
        created_at: Date;
        updated_at: Date;
      }[] = [];

      count = 0;
      departmentData.forEach(dept => {
        const departmentId = departmentMap.get(dept.department_code);
        if (!departmentId) {
          console.warn(`⚠️ 부서 ID를 찾을 수 없음: ${dept.department_code}`);
          return;
        }

        dept.device_types.forEach(deviceType => {
          const deviceTypeId = deviceTypeMap.get(deviceType.code);
          if (!deviceTypeId) {
            console.warn(`⚠️ 기기 타입 ID를 찾을 수 없음: ${deviceType.code}`);
            return;
          }

          relationshipData.push({
            department_id: departmentId,
            device_type_id: deviceTypeId,
            sort_key: device_type_sort_key_in_department + (100 * count++),
            status: 1, // 활성 상태
            created_at: new Date(),
            updated_at: new Date(),
          });
        });
      });

      // 7. 부서-기기 타입 연결 데이터 삽입
      console.log('🔗 부서-기기 타입 연결 데이터 삽입 중...');
      const createdRelationships = await serviceManager.deviceTypeService.createDepartmentToDeviceTypeMany(relationshipData);
      console.log(`✅ ${createdRelationships.count}개 부서-기기 타입 연결 생성됨`);
    });

    // 8. 결과 통계 출력
    console.log('\n📊 최종 통계:');
    const [departmentCount, deviceTypeCount, relationshipCount] = await Promise.all([
      serviceManager.departmentService.count({ status: 1 }),
      serviceManager.deviceTypeService.count({ status: 1 }),
      serviceManager.deviceTypeService.countDepartmentToDeviceType({ status: 1 }),
    ]);

    console.log(`🏢 총 부서 수: ${departmentCount}`);
    console.log(`🔧 총 기기 타입 수: ${deviceTypeCount}`);
    console.log(`🔗 총 부서-기기 타입 연결 수: ${relationshipCount}`);

    console.log('\n🎉 부서 및 기기 타입 데이터 가져오기 완료!');

  } catch (error) {
    console.error('❌ 데이터 가져오기 중 오류 발생:', error);
    throw error;
  } finally {
    await serviceManager.dispose();
  }
}

// 스크립트 실행
if (require.main === module) {
  importDepartmentDeviceTypes()
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export default importDepartmentDeviceTypes; 