import { getConstants } from '../services/medidealer/api';

// 초기 빈 배열로 설정
export let departments: Array<{ id: number; name: string; code: string }> = [];
export let deviceTypes: Array<{ id: number; name: string; code: string }> = [];
export let manufacturers: Array<{ id: number; name: string }> = [];

// 상수 데이터 초기화 함수
export const initConstants = async () => {
  try {
    const constants = await getConstants();
    departments = constants.departments;
    deviceTypes = constants.deviceTypes;
    manufacturers = constants.manufacturers;
  } catch (error) {
    console.error('상수 데이터 초기화 실패:', error);
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