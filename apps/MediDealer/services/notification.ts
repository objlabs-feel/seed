import messaging from '@react-native-firebase/messaging';
import { getDeviceType, getOSVersion } from '../utils/device';
import { deviceTypes } from '../constants/data';
import { setNotification, updateNotification } from './medidealer/api';
import { getAllTopics, createNotificationSet } from '../utils/notification';
import { Platform } from 'react-native';

/**
 * 단일 토픽 구독
 */
export const subscribeToTopic = async (topic: string) => {
  return messaging().subscribeToTopic(topic);
};

/**
 * 단일 토픽 구독 해제
 */
export const unsubscribeFromTopic = async (topic: string) => {
  return messaging().unsubscribeFromTopic(topic);
};

/**
 * 여러 토픽 구독
 */
export const subscribeToTopics = async (topics: string[]): Promise<void> => {
  await Promise.all(topics.map(topic => messaging().subscribeToTopic(topic)));
};

/**
 * 여러 토픽 구독 해제
 */
export const unsubscribeFromTopics = async (topics: string[]): Promise<void> => {
  await Promise.all(topics.map(topic => messaging().unsubscribeFromTopic(topic)));
};

/**
 * 토픽 구독 상태 업데이트
 * - 구독 해제가 필요한 토픽과 구독이 필요한 토픽만 처리
 */
export const updateTopicSubscriptions = async (currentTopics: string[], newTopics: string[]): Promise<void> => {
  try {
    // 1. 구독 해제가 필요한 토픽 찾기 (현재 구독 중이지만 새로운 목록에는 없는 토픽)
    const topicsToUnsubscribe = currentTopics.filter(topic => !newTopics.includes(topic));

    // 2. 구독이 필요한 토픽 찾기 (새로운 목록에는 있지만 현재 구독하지 않은 토픽)
    const topicsToSubscribe = newTopics.filter(topic => !currentTopics.includes(topic));

    // 3. 필요한 경우에만 구독/구독 해제 실행
    if (topicsToUnsubscribe.length > 0) {
      await Promise.all(topicsToUnsubscribe.map(topic => unsubscribeFromTopic(topic)));
    }

    if (topicsToSubscribe.length > 0) {
      await Promise.all(topicsToSubscribe.map(topic => subscribeToTopic(topic)));
    }
  } catch (error) {
    console.error('토픽 구독 상태 업데이트 중 오류:', error);
    throw error;
  }
};

/**
 * FCM 토큰 가져오기
 */
export const getFCMToken = async (): Promise<string> => {
  return await messaging().getToken();
};

/**
 * 알림 권한 요청
 */
export const requestUserPermission = async (): Promise<boolean> => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  return false;
};

/**
 * 백그라운드 메시지 핸들러 설정
 */
export const setBackgroundMessageHandler = (handler: (remoteMessage: any) => Promise<void>): void => {
  messaging().setBackgroundMessageHandler(handler);
};

/**
 * 모든 토픽 구독
 */
export const subscribeToAllTopics = async (userType: 'HOSPITAL' | 'COMPANY') => {
  try {
    const allTopics = getAllTopics();
    await subscribeToTopics([...allTopics, userType]);

    return {
      noti_set: {
        topics: allTopics,
        user_type: userType
      }
    };
  } catch (error) {
    console.error('Error subscribing to all topics:', error);
    throw error;
  }
};