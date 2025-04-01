import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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

const RequestNotificationScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [notificationInfo, setNotificationInfo] = useState<INotificationInfo>({
    id: 0,
    user_id: 0,
    ...createNotificationSet(getAllTopics(), 'HOSPITAL'),
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
  
  // 화면이 포커스될 때마다 권한 확인 갱신
  useFocusEffect(
    React.useCallback(() => {
      console.log('[RequestNotificationScreen] 화면 포커스, 권한 상태 확인');
      checkNotificationPermission();
      return () => {
        // 화면이 비활성화될 때 클린업 함수
      };
    }, [])
  );
  
  // 최초 마운트 시 한 번만 실행
  useEffect(() => {
    console.log('[RequestNotificationScreen] 컴포넌트 마운트됨');
    
    return () => {
      console.log('[RequestNotificationScreen] 컴포넌트 언마운트됨');
    };
  }, []);

  const checkNotificationPermission = async () => {
    console.log('[RequestNotificationScreen] 알림 권한 확인 시작');
    
    try {
      // 현재 권한 상태 먼저 확인
      const authStatus = await messaging().hasPermission();
      const isCurrentlyEnabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      console.log('[RequestNotificationScreen] 현재 권한 상태:', isCurrentlyEnabled ? '허용' : '거부', authStatus);
      
      // 이미 명시적으로 거부된 경우 설정으로 이동하도록 안내
      if (!isCurrentlyEnabled && authStatus === messaging.AuthorizationStatus.DENIED) {
        console.log('[RequestNotificationScreen] 권한이 이미 거부됨, 설정 앱으로 이동 필요');
        Alert.alert(
          '알림 권한 필요',
          '알림 권한이 거부되어 있습니다. 설정 앱에서 권한을 변경해주세요.',
          [
            { 
              text: '취소', 
              style: 'cancel',
              onPress: () => navigation.goBack() 
            },
            { 
              text: '설정으로 이동', 
              onPress: () => {
                console.log('[RequestNotificationScreen] 설정 앱으로 이동');
                Linking.openSettings();
              }
            }
          ]
        );
        return;
      }
      
      // 이미 권한이 부여된 상태인 경우
      if (isCurrentlyEnabled) {
        console.log('[RequestNotificationScreen] 이미 권한이 허용됨, 토큰 확인');
        // 이미 권한이 있으면 토큰만 확인하고 화면은 보여주기
        setHasPermission(true);
        // 필요한 경우 토큰 확인 및 서버 업데이트
        const token = await messaging().getToken();
        if (token) {
          console.log('[RequestNotificationScreen] FCM 토큰 확인:', token);
          // 서버에 토큰 업데이트가 필요할 수 있으나, 여기서는 화면 표시만 유지
        }
        return;
      }
      
      // 권한 요청 - iOS와 Android에서 다르게 처리
      // iOS와 Android에서 권한 요청 방식 처리
      requestNotificationPermission();
    } catch (error) {
      console.error('[RequestNotificationScreen] 알림 권한 확인/요청 오류:', error);
      navigation.goBack();
    }
  };
  
  // 권한 요청 함수를 분리하여 명확하게 관리
  const requestNotificationPermission = async () => {
    console.log('[RequestNotificationScreen] 알림 권한 요청 시작');
    
    try {
      if (Platform.OS === 'ios') {
        // iOS에서는 직접 requestPermission 호출
        const authResult = await messaging().requestPermission();
        const enabled =
          authResult === messaging.AuthorizationStatus.AUTHORIZED ||
          authResult === messaging.AuthorizationStatus.PROVISIONAL;
          
        console.log('[RequestNotificationScreen] iOS 권한 요청 결과:', enabled ? '허용' : '거부');
        
        if (enabled) {
          await handlePermissionGranted();
        } else {
          // iOS에서 권한이 거부된 경우
          if (authResult === messaging.AuthorizationStatus.DENIED) {
            // 설정으로 이동 안내
            Alert.alert(
              '알림 권한 필요',
              '알림 기능을 사용하려면 설정 앱에서 권한을 허용해주세요.',
              [
                { text: '취소', style: 'cancel', onPress: () => navigation.goBack() },
                { 
                  text: '설정으로 이동', 
                  onPress: () => {
                    console.log('[RequestNotificationScreen] 설정 앱으로 이동');
                    Linking.openSettings();
                  }
                }
              ]
            );
          } else {
            console.log('[RequestNotificationScreen] 알림 권한 거부됨');
            navigation.goBack();
          }
        }
      } else {
        // Android에서는 permission 유틸리티 사용
        const { enabled, deviceType, deviceOs } = await requestPushNotificationPermission();
        console.log('[RequestNotificationScreen] Android 권한 요청 결과:', enabled ? '허용' : '거부');
        
        if (enabled) {
          await handlePermissionGranted();
        } else {
          // Android에서 권한이 거부된 경우
          console.log('[RequestNotificationScreen] 알림 권한 거부됨');
          
          // API 33 이상(Android 13+)에서는 권한 거부 시 설정으로 이동 안내
          if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
            Alert.alert(
              '알림 권한 필요',
              '알림 기능을 사용하려면 설정 앱에서 권한을 허용해주세요.',
              [
                { text: '취소', style: 'cancel', onPress: () => navigation.goBack() },
                { 
                  text: '설정으로 이동', 
                  onPress: () => {
                    console.log('[RequestNotificationScreen] 설정 앱으로 이동');
                    Linking.openSettings();
                  }
                }
              ]
            );
          } else {
            navigation.goBack();
          }
        }
      }
    } catch (error) {
      console.error('[RequestNotificationScreen] 권한 요청 오류:', error);
      navigation.goBack();
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
        
        // AsyncStorage 저장을 먼저 수행하여 안정성 확보
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
        // API 오류가 발생해도 사용자에게는 성공으로 처리
        await AsyncStorage.setItem('hasShownNotificationRequest', 'true');
      }
    } catch (error) {
      console.error('[RequestNotificationScreen] 푸시 토큰 가져오기 오류:', error);
      // 오류가 발생해도 사용자에게는 가능한 진행
      await AsyncStorage.setItem('hasShownNotificationRequest', 'true');
    }
  };

  const handleNotificationTypeSelect = async (type: 'HOSPITAL' | 'COMPANY') => {
    try {
      console.log(`[RequestNotificationScreen] 알림 타입 선택: ${type}`);
      
      // 현재 권한 상태 확인
      const authStatus = await messaging().hasPermission();
      const isEnabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (!isEnabled) {
        console.log('[RequestNotificationScreen] 권한 없음, 권한 요청 필요');
        
        // 권한이 이미 명시적으로 거부된 경우 설정으로 이동
        if (authStatus === messaging.AuthorizationStatus.DENIED) {
          Alert.alert(
            '알림 권한 필요',
            '알림 기능을 사용하려면 설정 앱에서 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel', onPress: () => navigation.goBack() },
              { 
                text: '설정으로 이동', 
                onPress: () => {
                  console.log('[RequestNotificationScreen] 설정 앱으로 이동');
                  Linking.openSettings();
                }
              }
            ]
          );
          return;
        }
        
        // 권한 요청 시도
        let enabled = false;
        
        try {
          if (Platform.OS === 'ios') {
            // iOS에서는 직접 requestPermission 호출
            const result = await messaging().requestPermission();
            enabled =
              result === messaging.AuthorizationStatus.AUTHORIZED ||
              result === messaging.AuthorizationStatus.PROVISIONAL;
              
            console.log('[RequestNotificationScreen] iOS 권한 요청 결과:', enabled ? '허용' : '거부');
          } else {
            // Android에서는 permission 유틸리티 사용
            const permissionResult = await requestPushNotificationPermission();
            enabled = permissionResult.enabled;
            console.log('[RequestNotificationScreen] Android 권한 요청 결과:', enabled ? '허용' : '거부');
          }
          
          if (!enabled) {
            console.log('[RequestNotificationScreen] 권한 획득 실패, 뒤로 이동');
            navigation.goBack();
            return;
          }
        } catch (permError) {
          console.error('[RequestNotificationScreen] 권한 요청 오류:', permError);
          navigation.goBack();
          return;
        }
      }
      
      // 권한이 허용된 경우 계속 진행
      console.log('[RequestNotificationScreen] 알림 권한 확인됨, 타입 설정 진행');
      
      // 알림 메시지 설정
      const message = type === 'HOSPITAL' 
        ? '병원 관련 알림 설정이 완료되었습니다.' 
        : '업체 관련 알림 설정이 완료되었습니다.';

      // FCM 토큰 가져오기
      const token = await messaging().getToken();
      
      // 토큰이 비어있는 경우 서버 호출은 건너뜀
      if (!token || token.trim() === '') {
        console.log('[RequestNotificationScreen] 토큰이 비어있어 서버 저장 취소됨');
        const notiSet = await subscribeToAllTopics(type);
        console.log('[RequestNotificationScreen] 토큰이 비어있어 서버 저장 취소됨', notiSet);

        // AsyncStorage만 설정하고 서버 호출은 하지 않음
        await AsyncStorage.setItem('hasShownNotificationRequest', 'true');
        
        // 이벤트만 발행
        try {
          console.log('[RequestNotificationScreen] notificationInitialized 이벤트만 발행');
          setTimeout(() => {
            eventEmitter.emit('notificationInitialized');
          }, 1000);
        } catch (eventError) {
          console.error('[RequestNotificationScreen] 이벤트 발행 오류:', eventError);
        }
        
        // 성공 메시지는 표시
        Alert.alert('알림 설정 완료', message, [
          { 
            text: '확인', 
            onPress: () => {
              console.log('[RequestNotificationScreen] 이전 화면으로 이동');
              navigation.goBack();
            }
          }
        ]);
        return;
      }
      
      // 업데이트할 notificationInfo 준비
      const updatedInfo = {
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
        ...createNotificationSet(getAllTopics(), type)
      };
      
      setNotificationInfo(updatedInfo);
      
      // 토픽 구독 시도 - 실패해도 계속 진행
      try {
        console.log(`[RequestNotificationScreen] 토픽 구독 시작: ${type}`); 
        await subscribeToTopic(type);
        console.log(`[RequestNotificationScreen] 토픽 구독 완료: ${type}`);
      } catch (topicError) {
        console.error(`[RequestNotificationScreen] 토픽 구독 오류: ${type}`, topicError);
        // 오류가 발생해도 계속 진행
      }
      
      // AsyncStorage에 설정 저장
      await AsyncStorage.setItem('hasShownNotificationRequest', 'true');
      
      // 서버에 설정 업데이트 시도
      try {
        console.log('[RequestNotificationScreen] 서버에 알림 설정 업데이트 시작');
        await updateNotification(updatedInfo);
        console.log('[RequestNotificationScreen] 서버에 알림 설정 업데이트 완료');
      } catch (apiError) {
        console.error('[RequestNotificationScreen] 서버 업데이트 오류:', apiError);
        // 오류가 발생해도 계속 진행
      }
      
      // 알림 초기화 이벤트 발행
      try {
        console.log('[RequestNotificationScreen] notificationInitialized 이벤트 발행 준비');
        setTimeout(() => {
          eventEmitter.emit('notificationInitialized');
          console.log('[RequestNotificationScreen] notificationInitialized 이벤트 발행 완료');
        }, 1000);
      } catch (eventError) {
        console.error('[RequestNotificationScreen] 이벤트 발행 오류:', eventError);
      }
      
      // 성공 메시지 표시
      Alert.alert('알림 설정 완료', message, [
        { 
          text: '확인', 
          onPress: () => {
            console.log('[RequestNotificationScreen] 이전 화면으로 이동');
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {      
      console.error('[RequestNotificationScreen] 알림 설정 오류:', error);
      
      // 오류 발생 시에도 AsyncStorage 설정 저장 시도
      try {
        await AsyncStorage.setItem('hasShownNotificationRequest', 'true');
      } catch (storageError) {
        console.error('[RequestNotificationScreen] AsyncStorage 저장 오류:', storageError);
      }
      
      Alert.alert('오류', '알림 설정 중 문제가 발생했습니다.', [
        { 
          text: '확인', 
          onPress: () => navigation.goBack()
        }
      ]);
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
          onPress={() => handleNotificationTypeSelect('HOSPITAL')}
        >
          <Text style={styles.buttonTitle}>병원입니다</Text>
          <Text style={styles.buttonDescription}>
            신규 장비나 변경된 의료정책 알림을 받습니다
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleNotificationTypeSelect('COMPANY')}
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
