import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { requestPushNotificationPermission } from '../../utils/permission';
import { subscribeToTopic, unsubscribeFromTopic } from '../../services/notification';
import { setNotification, updateNotification } from '../../services/medidealer/api';
import { INotificationInfo } from '@repo/shared';
const RequestNotificationScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [notificationInfo, setNotificationInfo] = useState<INotificationInfo>({
    id: 0,
    user_id: 0,
    noti_set: {},
    device_type: 0,
    device_os: 0,
    device_token: '',
    permission_status: 0,
    noti_notice: 0,
    noti_event: 0,
    noti_sms: 0,
    noti_email: 0,
    noti_auction: 0,
    noti_favorite: 0,
    created_at: '',
    updated_at: '',
  });

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const { enabled, deviceType, deviceOs } = await requestPushNotificationPermission();

    if (enabled) {
      // 푸시 알림 토큰 가져오기
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      await subscribeToTopic('all');      
      
      setNotificationInfo({
        ...notificationInfo,
        device_type: deviceType,
        device_os: deviceOs,
        device_token: token,
        permission_status: 1,
        noti_notice: 1,
        noti_event: 1,
        noti_sms: 1,
        noti_email: 1,
        noti_auction: 1,
        noti_favorite: 1,
      });
      await setNotification(notificationInfo);
    } else {
      // notificationInfo.device_token = '';
      setNotificationInfo({
        ...notificationInfo,
        device_type: deviceType,
        device_os: deviceOs,
        device_token: '',
        permission_status: 1,
        noti_notice: 1,
        noti_event: 1,
        noti_sms: 1,
        noti_email: 1,
        noti_auction: 1,
        noti_favorite: 1,
      });
      console.log('Push notifications not permitted');
    }

    setHasPermission(enabled);
    if (!enabled) {
      navigation.goBack();
    }
  };

  const handleNotificationTypeSelect = async (type: 'hospital' | 'company') => {
    try {
      // TODO: 선택한 알림 타입을 서버에 저장하는 로직 구현
      const message = type === 'hospital' 
        ? '병원 관련 알림 설정이 완료되었습니다.' 
        : '업체 관련 알림 설정이 완료되었습니다.';

      setNotificationInfo({
        ...notificationInfo,
        noti_set: {topics:["all", type]},
      }); 

      await subscribeToTopic(type);
      await updateNotification(notificationInfo);
      
      Alert.alert('알림 설정 완료', message, [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('오류', '알림 설정 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>알림 설정</Text>
        <Text style={styles.description}>
          메디딜러의 알림을 받아보시겠습니까?
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleNotificationTypeSelect('hospital')}
        >
          <Text style={styles.buttonTitle}>병원입니다</Text>
          <Text style={styles.buttonDescription}>
            신규 장비나 변경된 의료정책 알림을 받습니다
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleNotificationTypeSelect('company')}
        >
          <Text style={styles.buttonTitle}>업체입니다</Text>
          <Text style={styles.buttonDescription}>
            다양한 판매처에 대한 변경 알림사항을 받습니다
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default RequestNotificationScreen;
