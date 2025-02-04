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
  { id: 'seoul', name: '서울' },
  { id: 'gyeonggi', name: '경기' },
  { id: 'incheon', name: '인천' },
  { id: 'busan', name: '부산' },
  { id: 'daegu', name: '대구' },
  { id: 'gwangju', name: '광주' },
  { id: 'daejeon', name: '대전' },
  { id: 'ulsan', name: '울산' },
  { id: 'gwangyang', name: '광양' },
  { id: 'jeonju', name: '전주' },
  { id: 'jeju', name: '제주' },
  // ... 추가 지역
];