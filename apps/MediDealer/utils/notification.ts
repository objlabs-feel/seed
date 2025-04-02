import { Platform } from 'react-native';
import { deviceTypes } from '../constants/data';

// 'all' 토픽 제외
const defaultTopics = ['NOTICE', 'UPDATE'];

/**
 * 모든 토픽 목록 가져오기
 */
export const getAllTopics = () => {
  const deviceTypeTopics = deviceTypes.map(type => type.code || '');
  return [...defaultTopics, ...deviceTypeTopics];
};

/**
 * 알림 설정 객체 생성
 */
export const createNotificationSet = (topics: string[], userType: string) => {
  return {
    topics,
    user_type: userType
  };
};

/**
 * 디바이스 타입 가져오기
 */
export const getDeviceType = () => {
  return Platform.select({
    ios: 'IOS',
    android: 'ANDROID',
    default: 'UNKNOWN'
  });
};

/**
 * OS 버전 가져오기 (major 버전만)
 */
export const getOSVersion = () => {
  const version = Platform.Version;
  if (typeof version === 'number') {
    return Math.floor(version).toString();
  }
  return version.split('.')[0];
}; 