import messaging from '@react-native-firebase/messaging';

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