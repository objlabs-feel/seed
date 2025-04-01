import { deviceTypes } from '../constants/data';

// 'all' 토픽 제외
export const DEFAULT_TOPICS = ['NOTICE', 'UPDATE'];

export const getAllTopics = () => {
  const deviceTypeTopics = deviceTypes.map(type => type.code || '');
  return [...DEFAULT_TOPICS, ...deviceTypeTopics];
};

export const createNotificationSet = (topics: string[], userType: string) => {
  return {
    noti_set: {
      topics,
      user_type: userType
    }
  };
}; 