import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const DEVICE_ID_KEY = '@MediDealer:deviceId';

export const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    // 저장된 디바이스 ID 확인
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (existingId) {
      return existingId;
    }

    // 새로운 유니크 ID 생성
    const newId = uuid.v4().toString();
    
    // AsyncStorage에 저장
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    
    return newId;
  } catch (error) {
    console.error('Error managing device ID:', error);
    // 에러 발생 시 임시 ID 반환
    return `temp-${Date.now()}`;
  }
}; 