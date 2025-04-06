import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Linking, ActivityIndicator } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { requestPushNotificationPermission } from '../../utils/permission';
import { subscribeToAllTopics, subscribeToTopic, unsubscribeFromTopic } from '../../services/notification';
import { setNotification, updateNotification } from '../../services/medidealer/api';
import { INotificationInfo } from '@repo/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceType, getOSVersion } from '../../utils/device';
import { eventEmitter } from '../../utils/eventEmitter';
import { deviceTypes } from '../../constants/data';
import { createNotificationSet, getAllTopics } from '../../utils/notification';
import notifee from '@notifee/react-native';

const RequestNotificationScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [notificationInfo, setNotificationInfo] = useState<INotificationInfo>({
    id: 0,
    user_id: 0,
    noti_set: createNotificationSet(getAllTopics(), 'HOSPITAL'),
    device_type: getDeviceType(),
    device_os: getOSVersion(),
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
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  
  // 최초 마운트 시 한 번만 실행
  useEffect(() => {
    console.log('[RequestNotificationScreen] 컴포넌트 마운트됨');
    
    // Android에서 알림 채널 설정
    if (Platform.OS === 'android') {
      console.log('[RequestNotificationScreen] Android 알림 채널 설정 시도');
      try {
        // notifee를 사용하여 알림 채널 생성
        notifee.createChannel({
          id: 'default',
          name: '기본 알림',
          lights: true,
          vibration: true,
          importance: 4 // AndroidImportance.HIGH
        }).then(() => {
          console.log('[RequestNotificationScreen] Android 알림 채널 생성 성공');
        }).catch((error) => {
          console.error('[RequestNotificationScreen] 알림 채널 생성 실패:', error);
        });
        
        // 중요 알림 채널 추가로 생성
        notifee.createChannel({
          id: 'important_channel',
          name: '중요 알림',
          description: '중요한 알림을 위한 채널입니다.',
          lights: true,
          vibration: true,
          importance: 4 // AndroidImportance.HIGH
        }).then(() => {
          console.log('[RequestNotificationScreen] 중요 알림 채널 생성 성공');
        }).catch((error) => {
          console.error('[RequestNotificationScreen] 중요 알림 채널 생성 실패:', error);
        });
      } catch (error) {
        console.error('[RequestNotificationScreen] Android 알림 채널 설정 오류:', error);
      }
    }
    
    // 권한 요청 실행
    requestSystemPermission();
    
    return () => {
      console.log('[RequestNotificationScreen] 컴포넌트 언마운트됨');
    };
  }, []);

  const requestSystemPermission = async () => {
    try {
      console.log('[RequestNotificationScreen] 시스템 권한 요청 시작...');
      
      // 플랫폼별 접근
      if (Platform.OS === 'ios') {
        console.log('[RequestNotificationScreen] iOS 권한 요청 시도');
        
        // iOS에서는 messaging().requestPermission() 사용
        const authStatus = await messaging().requestPermission({
          alert: true,
          announcement: true, 
          badge: true,
          carPlay: false,
          provisional: false,
          sound: true,
        });
        console.log('[RequestNotificationScreen] iOS 권한 요청 결과:', authStatus);
        
        if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
            authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          console.log('[RequestNotificationScreen] iOS 알림 권한 승인됨');
          await handlePermissionGranted();
        } else {
          console.log('[RequestNotificationScreen] iOS 알림 권한 거부됨');
          setShowCustomAlert(true);
        }
      } else {
        // Android 권한 요청
        console.log('[RequestNotificationScreen] Android 권한 요청 시도');
        
        try {
          // 먼저 현재 권한 상태 확인
          const currentPermission = await messaging().hasPermission();
          console.log('[RequestNotificationScreen] Android 현재 권한 상태:', currentPermission);
          
          // 다양한 방법 시도
          // 방법 1: 일반 requestPermission 호출
          console.log('[RequestNotificationScreen] 방법 1: requestPermission 시도');
          const authStatus1 = await messaging().requestPermission();
          console.log('[RequestNotificationScreen] 방법 1 결과:', authStatus1);
          
          // 방법 2: 외부 유틸리티 함수 사용 (이미 프로젝트에 존재)
          console.log('[RequestNotificationScreen] 방법 2: 유틸리티 함수 사용 시도');
          const authStatus2 = await requestPushNotificationPermission();
          console.log('[RequestNotificationScreen] 방법 2 결과:', authStatus2);
          
          // 최종 권한 상태 확인
          const finalPermission = await messaging().hasPermission();
          console.log('[RequestNotificationScreen] 최종 권한 상태:', finalPermission);
          
          if (finalPermission === messaging.AuthorizationStatus.AUTHORIZED || 
              finalPermission === messaging.AuthorizationStatus.PROVISIONAL) {
            console.log('[RequestNotificationScreen] Android 알림 권한 승인됨');
            await handlePermissionGranted();
          } else {
            console.log('[RequestNotificationScreen] Android 알림 권한 거부됨');
            setShowCustomAlert(true);
          }
        } catch (androidError) {
          console.error('[RequestNotificationScreen] Android 권한 요청 중 오류:', androidError);
          
          // 오류 발생 시 기존 방식 시도
          console.log('[RequestNotificationScreen] 기존 방식으로 재시도');
          const authStatus = await messaging().requestPermission();
          
          if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
            console.log('[RequestNotificationScreen] 알림 권한 승인됨');
            await handlePermissionGranted();
          } else {
            console.log('[RequestNotificationScreen] 알림 권한 거부됨');
            setShowCustomAlert(true);
          }
        }
      }
    } catch (error) {
      console.error('[RequestNotificationScreen] 권한 요청 오류:', error);
      setShowCustomAlert(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 권한이 허용된 경우의 처리를 별도 함수로 분리
  const handlePermissionGranted = async () => {
    try {
      console.log('[RequestNotificationScreen] 권한 허용됨, 토큰 및 설정 처리 시작');
      
      // 푸시 알림 토큰 가져오기
      const token = await messaging().getToken();
      console.log('[RequestNotificationScreen] FCM Token:', token);
      
      // 토큰이 비어있는 경우 서버 호출 방지
      if (!token || token.trim() === '') {
        console.log('[RequestNotificationScreen] 토큰이 비어있어 서버 저장 취소됨');
        // AsyncStorage만 설정하고 서버 호출은 하지 않음
        await AsyncStorage.setItem('hasShownNotificationRequest', 'true');
        setHasPermission(true);
        
        // 이벤트만 발행
        setTimeout(() => {
          try {
            eventEmitter.emit('notificationInitialized');
            console.log('[RequestNotificationScreen] notificationInitialized 이벤트 발행 완료');
          } catch (eventError) {
            console.error('[RequestNotificationScreen] 이벤트 발행 오류:', eventError);
          }
        }, 1000);
        return;
      }
      
      // 'all' 토픽 구독 - 오류가 발생해도 계속 진행
      try {
        await subscribeToTopic('all');
        console.log('[RequestNotificationScreen] 토픽 구독 완료: all');
      } catch (topicError) {
        console.error('[RequestNotificationScreen] 토픽 구독 오류:', topicError);
        // 오류가 발생해도 계속 진행
      }
      
      const updatedNotificationInfo = {
        ...notificationInfo,
        device_type: getDeviceType(),
        device_os: getOSVersion(),
        device_token: token,
        permission_status: 1,
        noti_notice: 1,
        noti_event: 1,
        noti_sms: 1,
        noti_email: 1,
        noti_auction: 1,
        noti_favorite: 1,
      };
      
      setNotificationInfo(updatedNotificationInfo);
      setHasPermission(true);
      console.log('[RequestNotificationScreen] 서버에 알림 설정 저장 시작:', updatedNotificationInfo);
      
      try {
        await setNotification(updatedNotificationInfo);
        console.log('[RequestNotificationScreen] 서버에 알림 설정 저장 완료');
        
        // AsyncStorage 저장을 서버 저장 성공 후에만 수행
        console.log('[RequestNotificationScreen] AsyncStorage에 알림 요청 표시 저장');
        await AsyncStorage.setItem('hasShownNotificationRequest', 'true');
        
        // 알림 초기화 완료 이벤트 발행 - 약간의 지연을 주어 안정성 향상
        console.log('[RequestNotificationScreen] notificationInitialized 이벤트 발행 준비');
        
        // 이벤트 발행 시 iOS와 Android에서 타이밍 문제 방지를 위한 지연
        setTimeout(() => {
          try {
            eventEmitter.emit('notificationInitialized');
            console.log('[RequestNotificationScreen] notificationInitialized 이벤트 발행 완료');
          } catch (eventError) {
            console.error('[RequestNotificationScreen] 이벤트 발행 오류:', eventError);
          }
        }, 1000); // 1초 지연으로 설정하여 더 안정적으로 동작하도록 함
      } catch (apiError) {
        console.error('[RequestNotificationScreen] 알림 설정 저장 오류:', apiError);
        // API 오류 발생 시 AsyncStorage 저장 안 함
        // await AsyncStorage.setItem('hasShownNotificationRequest', 'true'); // 이 부분을 제거 또는 주석 처리
      }
    } catch (error) {
      console.error('[RequestNotificationScreen] 푸시 토큰 가져오기 오류:', error);
      // 오류 발생 시 AsyncStorage 저장 안 함
      // await AsyncStorage.setItem('hasShownNotificationRequest', 'true'); // 이 부분을 제거 또는 주석 처리
    }
  };

  const handleDeviceTypeSelect = async (type: 'HOSPITAL' | 'COMPANY') => {
    setIsLoading(true); // 로딩 상태 시작
    try {
      // 1. 선택된 디바이스 타입으로 noti_set 업데이트
      const updatedInfo = {
        ...notificationInfo,
        noti_set: createNotificationSet(getAllTopics(), type),
      };
      setNotificationInfo(updatedInfo);
      console.log('[RequestNotificationScreen] 디바이스 타입 선택:', type);

      // 2. 선택한 타입을 AsyncStorage에 저장
      await AsyncStorage.setItem('notificationType', type);
      console.log('[RequestNotificationScreen] AsyncStorage에 타입 저장:', type);

      // 3. 토픽 구독 처리 - 설정 기반으로 구독
      try {
        console.log('[RequestNotificationScreen] 토픽 구독 시작...');
        
        // 'all' 토픽 구독
        await subscribeToTopic('all');
        console.log('[RequestNotificationScreen] 기본 토픽(all) 구독 완료');
        
        // 모든 토픽 구독
        const allTopics = getAllTopics();
        console.log('[RequestNotificationScreen] 모든 토픽 구독 시도:', allTopics);
        
        await subscribeToAllTopics(type);
        console.log('[RequestNotificationScreen] 모든 토픽 구독 완료');
      } catch (topicError) {
        console.error('[RequestNotificationScreen] 토픽 구독 중 오류 발생:', topicError);
        // 토픽 구독 실패해도 계속 진행
      }

      // 4. 서버에 알림 설정 저장 시도
      const infoToSend = { ...updatedInfo, permission_status: 0 };
      
      try {
        await setNotification(infoToSend);
        console.log('[RequestNotificationScreen] 서버에 타입 정보 등 설정 저장 시도 완료');
      } catch (apiError) {
        console.error('[RequestNotificationScreen] 서버에 설정 저장 오류:', apiError);
      }

      // 5. 이전 화면으로 돌아가기 (불필요한 알림 대화상자 제거)
      navigation.goBack();

    } catch (error) {
      console.error('[RequestNotificationScreen] 디바이스 타입 선택 처리 오류:', error);
      // 오류 시에만 사용자에게 알림
      Alert.alert('오류', '타입 선택 처리 중 오류가 발생했습니다.', [
        { text: "확인", onPress: () => navigation.goBack() }
      ]);
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  // 초기 상태 설정 - 이 useEffect는 handleDeviceTypeSelect와 중복될 수 있어 제거 또는 주석 처리합니다.
  /*
  useEffect(() => {
    const initializeNotificationInfo = async () => {
      try {
        const storedType = await AsyncStorage.getItem('notificationType');
        if (storedType) {
          handleDeviceTypeSelect(storedType as 'HOSPITAL' | 'DEALER');
        }
      } catch (error) {
        console.error('알림 타입 초기화 오류:', error);
      }
    };

    initializeNotificationInfo();
  }, []);
  */

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>토픽 구독 중...</Text>
          <Text style={styles.subLoadingText}>잠시만 기다려주세요.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>알림 권한이 필요합니다</Text>
        <Text style={styles.description}>
          입찰 요청, 낙찰 알림 등{'\n'}
          중요한 알림을 받을 수 있습니다.
        </Text>
        
        {/* 직접 설정으로 이동 버튼 추가 */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Linking.openSettings()}
        >
          <Icon name="settings-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.settingsButtonText}>기기 설정에서 알림 허용하기</Text>
        </TouchableOpacity>
        
        <View style={[styles.buttonContainer, { marginTop: 32 }]}>
          <TouchableOpacity
            style={[styles.button, styles.hospitalButton]}
            onPress={() => handleDeviceTypeSelect('HOSPITAL')}
          >
            <Icon name="medical-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>병원입니다</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.dealerButton]}
            onPress={() => handleDeviceTypeSelect('COMPANY')}
          >
            <Icon name="business-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>업체입니다</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hospitalButton: {
    backgroundColor: '#007bff',
  },
  dealerButton: {
    backgroundColor: '#6c757d',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000',
  },
  subLoadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 8,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RequestNotificationScreen;
