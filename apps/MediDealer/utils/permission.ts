import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

export async function requestPushNotificationPermission() {
  try {
    // 디바이스 타입 설정
    // 0: Unknown, 1: AOS, 2: iOS, 3: Browser
    let deviceType = 0; // 기본값: Unknown
    if (Platform.OS === 'android') deviceType = 1;
    else if (Platform.OS === 'ios') deviceType = 2;

    // 디바이스 OS 버전 (Major Number만 추출)
    const deviceOs = getOSMajorVersion();

    // iOS 권한 요청
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return { enabled, deviceType, deviceOs };
    }
    // Android 권한 요청 (Android 13+ 필요)
    else if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return { enabled: permission === 'granted', deviceType, deviceOs };
      }
      return { enabled: true, deviceType, deviceOs }; // Android 13 미만은 권한 필요 없음
    }

    return { enabled: false, deviceType, deviceOs };
  } catch (error) {
    console.error('Push Notification permission error:', error);
    return { enabled: false, deviceType: 0, deviceOs: 0 };
  }
}

// OS 버전의 Major Number만 추출하는 함수
function getOSMajorVersion(): number {
  try {
    if (Platform.OS === 'ios') {
      // iOS 버전 추출 (예: "14.5" -> 14)
      const versionString = Platform.Version.toString();
      const majorVersion = parseInt(versionString.split('.')[0], 10);
      return isNaN(majorVersion) ? 0 : majorVersion;
    } else if (Platform.OS === 'android') {
      // Android API 레벨을 버전으로 변환
      // Platform.Version은 Android에서 API 레벨을 반환
      const apiLevel = Platform.Version as number;

      // API 레벨을 대략적인 Android 버전으로 매핑
      // 참고: https://developer.android.com/studio/releases/platforms
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
    console.error('Error getting OS major version:', error);
    return 0;
  }
}