import messaging from '@react-native-firebase/messaging';
import { getDeviceType, getOSVersion } from '../utils/device';
import { deviceTypes } from '../constants/data';
import { setNotification, updateNotification } from './medidealer/api';
import { getAllTopics } from '../utils/notification';

// 토픽 구독 함수
export const subscribeToTopic = async (topic = 'all') => {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
    return true;
  } catch (error) {
    console.error('Failed to subscribe to topic:', error);
    return false;
  }
};

// 토픽 구독 취소 함수
export const unsubscribeFromTopic = async (topic = 'all') => {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from topic:', error);
    return false;
  }
};

export const subscribeToAllTopics = async (userType: 'HOSPITAL' | 'COMPANY') => {
  try {
    const allTopics = getAllTopics();
    await Promise.all([
      ...allTopics.map(topic => subscribeToTopic(topic)),
      subscribeToTopic(userType)
    ]);

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