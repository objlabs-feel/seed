import { getConstants } from '../services/medidealer/api';

// 데이터 타입 정의
export interface SelectionItem {
  id: string;
  name: string;
  code?: string;
}

// 초기 빈 배열로 설정
export let departments: SelectionItem[] = [];
export let deviceTypes: SelectionItem[] = [];
export let manufacturers: SelectionItem[] = [];

// 데이터 초기화 여부를 추적
export let isConstantsInitialized = false;

// 상수 데이터 초기화 함수
export const initConstants = async (): Promise<boolean> => {
  // 이미 초기화되었으면 다시 호출하지 않음
  if (isConstantsInitialized && departments.length > 0 && deviceTypes.length > 0) {
    console.log('상수 데이터가 이미 초기화됨');
    return true;
  }

  try {
    console.log('상수 데이터 초기화 시작...');
    const constants = await getConstants();

    // id를 string으로 변환하여 일관성 유지
    departments = constants.departments?.map((dept: any) => ({
      id: String(dept.id),
      name: dept.name
    })) || [];

    deviceTypes = constants.deviceTypes?.map((type: any) => ({
      id: String(type.id),
      name: type.name,
      code: type.code
    })) || [];

    manufacturers = constants.manufacturers?.map((mfr: any) => ({
      id: String(mfr.id),
      name: mfr.name
    })) || [];

    isConstantsInitialized = true;
    console.log('상수 데이터 초기화 완료:', {
      departments: departments.length,
      deviceTypes: deviceTypes.length,
      manufacturers: manufacturers.length
    });

    return true;
  } catch (error) {
    console.error('상수 데이터 초기화 실패:', error);
    return false;
  }
};

// locations는 정적 데이터이므로 그대로 유지
export const locations = [
  { id: '서울', name: '서울' },
  { id: '경기', name: '경기' },
  { id: '인천', name: '인천' },
  { id: '강원', name: '강원' },
  { id: '충남', name: '충남' },
  { id: '충북', name: '충북' },
  { id: '전남', name: '전남' },
  { id: '전북', name: '전북' },
  { id: '경남', name: '경남' },
  { id: '경북', name: '경북' },
  { id: '제주', name: '제주' },
  // ... 추가 지역
];