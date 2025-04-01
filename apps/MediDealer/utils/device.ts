import { Platform } from 'react-native';

/**
 * 디바이스 타입을 반환하는 함수
 * 0: 알 수 없음
 * 1: Android
 * 2: iOS
 * 3: Web
 */
export function getDeviceType(): number {
  switch (Platform.OS) {
    case 'android':
      return 1;
    case 'ios':
      return 2;
    case 'web':
      return 3;
    default:
      return 0;
  }
}

/**
 * 운영체제의 메이저 버전 번호를 반환하는 함수
 * iOS: 13, 14, 15 등
 * Android: 10, 11, 12, 13 등
 */
export function getOSVersion(): number {
  try {
    if (Platform.OS === 'ios') {
      // iOS 버전은 문자열 형태 (예: "14.4.1")
      const versionString = Platform.Version.toString();
      // 첫 번째 숫자만 추출 (메이저 버전)
      const majorVersion = parseInt(versionString.split('.')[0], 10);
      return isNaN(majorVersion) ? 0 : majorVersion;
    } else if (Platform.OS === 'android') {
      // Android 버전은 API 레벨 (숫자)
      const apiLevel = Number(Platform.Version);

      // API 레벨을 대략적인 Android 버전으로 변환
      if (apiLevel >= 33) return 13; // Android 13 (API 33+)
      if (apiLevel >= 31) return 12; // Android 12 (API 31-32)
      if (apiLevel >= 30) return 11; // Android 11 (API 30)
      if (apiLevel >= 29) return 10; // Android 10 (API 29)
      if (apiLevel >= 28) return 9;  // Android 9 (API 28)
      if (apiLevel >= 26) return 8;  // Android 8 (API 26-27)
      if (apiLevel >= 24) return 7;  // Android 7 (API 24-25)
      return 6; // Android 6 이하
    }

    return 0; // 알 수 없는 OS
  } catch (error) {
    console.error('[getOSVersion] 운영체제 버전 확인 오류:', error);
    return 0;
  }
} 