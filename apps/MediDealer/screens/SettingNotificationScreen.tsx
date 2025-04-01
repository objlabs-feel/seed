import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Linking, Platform, Modal } from 'react-native';
import { getNotification, updateNotification, setNotification } from '../services/medidealer/api';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceType, getOSVersion } from '../utils/device';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { eventEmitter } from '../utils/eventEmitter';
import { INotificationInfo } from '@repo/shared';
import { deviceTypes, initConstants } from '../constants/data';
import { subscribeToAllTopics } from '../services/notification';
import { getAllTopics } from '../utils/notification';

interface NotificationSettings {
  permission_status: number;
  device_token?: string;
  noti_notice: number;
  noti_event: number;
  noti_sms: number;
  noti_email: number;
}

interface TopicSubscription {
  topic: string;
  isSubscribed: boolean;
}

const SettingNotificationScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // 화면 포커스 상태 감지 훅
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [notiSet, setNotiSet] = useState<INotificationInfo['noti_set'] | null>(null);
  const [userInfo, setUserInfo] = useState<'HOSPITAL' | 'COMPANY'>('HOSPITAL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devicePermissionEnabled, setDevicePermissionEnabled] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [lastFocusTime, setLastFocusTime] = useState(0); // 마지막 포커스 시간 추적
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);
  const [topicSubscriptions, setTopicSubscriptions] = useState<TopicSubscription[]>([]);

  useEffect(() => {
    // 첫 렌더링 시 권한 상태 확인 및 상수 데이터 초기화
    checkDevicePermissionStatus();
  }, []);

  // 화면이 포커스될 때마다 실행
  useEffect(() => {
    if (isFocused) {
      const now = Date.now();
      // 마지막 포커스 시간과 현재 시간의 차이가 500ms 이상인 경우에만 실행 (중복 호출 방지)
      if (now - lastFocusTime > 500) {
        console.log('[SettingNotificationScreen] 화면 포커스 감지, 권한 상태 다시 확인');
        setLastFocusTime(now);
        checkDevicePermissionStatus();
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (devicePermissionEnabled) {
      // settings가 없을 때만 서버에서 데이터를 가져옴
      if (!settings) {
        fetchNotificationSettings();
      }
    }
  }, [devicePermissionEnabled]);

  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      console.log('[SettingNotificationScreen] 알림 설정 조회 시작');
      const response = await getNotification();
      console.log('[SettingNotificationScreen] 알림 설정 조회 성공:', response);

      setNotiSet(response.noti_set || { topics: [], user_type: 'HOSPITAL' });
      const newSettings: NotificationSettings = {
        permission_status: response.permission_status || 0,
        device_token: response.device_token,
        noti_notice: response.noti_notice || 0,
        noti_event: response.noti_event || 0,
        noti_sms: response.noti_sms || 0,
        noti_email: response.noti_email || 0
      };
      
      setSettings(newSettings);

      setUserInfo(response.noti_set.user_type || 'HOSPITAL');
      
      // 설정을 가져온 후 실제 권한 상태 확인
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      setDevicePermissionEnabled(enabled);
      
      // 기기 권한과 서버 상태가 다른 경우 서버 값을 업데이트
      if ((enabled && newSettings.permission_status === 0) || 
          (!enabled && newSettings.permission_status === 1)) {
        console.log('[SettingNotificationScreen] 권한 상태 불일치 감지, 서버에 업데이트 필요');
        const updatedSettings: NotificationSettings = { 
          ...newSettings, 
          permission_status: enabled ? 1 : 0 
        };
        setSettings(updatedSettings);
        
        // 서버에 업데이트
        await updateNotification({
          ...updatedSettings,
          device_type: getDeviceType(),
          device_os: getOSVersion(),
        });
        console.log('[SettingNotificationScreen] 서버 업데이트 완료');
      }
      
      setError(null);
      setIsNewUser(false);
    } catch (err: any) {
      console.error('[SettingNotificationScreen] 알림 설정 조회 오류:', err);
      
      // 404 오류 처리 - 서버에 알림 정보가 없는 경우
      if (err.response && err.response.status === 404) {
        console.log('[SettingNotificationScreen] 알림 설정 데이터 없음 (404)');
        setIsNewUser(true);
        // 사용자에게 알림 초기 설정이 필요하다는 안내
        showNotificationSetupPrompt();
      } else {
        setError('알림 설정을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 알림 설정 초기화 안내 메시지 표시
  const showNotificationSetupPrompt = () => {
    Alert.alert(
      '알림 설정 필요',
      '알림 설정을 사용하려면 먼저 알림 권한을 허용하고 초기 설정을 완료해야 합니다.',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => navigation.goBack()
        },
        {
          text: '설정하기',
          onPress: initializeNotificationSettings
        }
      ]
    );
  };

  // 알림 설정 초기화
  const initializeNotificationSettings = async () => {
    try {
      console.log('[SettingNotificationScreen] 알림 초기화 시작');
      
      // 현재 권한 상태 먼저 확인
      const currentAuthStatus = await messaging().hasPermission();
      const currentlyEnabled =
        currentAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        currentAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      console.log('[SettingNotificationScreen] 현재 권한 상태:', currentlyEnabled ? '허용됨' : '거부됨');
      
      // 이미 거부된 상태라면 설정 앱으로 이동 유도
      if (!currentlyEnabled && (currentAuthStatus === messaging.AuthorizationStatus.DENIED)) {
        console.log('[SettingNotificationScreen] 권한 이미 거부된 상태, 설정으로 이동 필요');
        Alert.alert(
          '알림 권한 필요',
          '알림 권한이 거부되어 있습니다. 설정 앱에서 알림 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            { 
              text: '설정으로 이동', 
              onPress: () => {
                console.log('[SettingNotificationScreen] 설정 앱으로 이동');
                Linking.openSettings();
              }
            }
          ]
        );
        return;
      }
      
      // 권한 요청 (이미 허용된 경우에도 호출해도 무방)
      console.log('[SettingNotificationScreen] 알림 권한 요청');
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('[SettingNotificationScreen] 권한 요청 결과:', enabled ? '허용됨' : '거부됨');

      if (enabled) {
        console.log('[SettingNotificationScreen] 알림 권한 획득 성공');
        // 권한 허용됨
        setDevicePermissionEnabled(true);
        
        // FCM 토큰 가져오기
        const fcmToken = await messaging().getToken();
        console.log('[SettingNotificationScreen] FCM 토큰:', fcmToken);
        
        // 서버에 알림 정보 생성
        const notificationData = {
          device_token: fcmToken,
          device_type: getDeviceType(),
          device_os: getOSVersion(),
          permission_status: 1,
          noti_notice: 1,
          noti_event: 1,
          noti_sms: 1,
          noti_email: 1,
          noti_auction: 1,
          noti_favorite: 1,
        };
        
        console.log('[SettingNotificationScreen] 알림 설정 서버에 저장 시작:', notificationData);
        await setNotification(notificationData);
        console.log('[SettingNotificationScreen] 알림 설정 서버에 저장 완료');
        
        // 이벤트 발행 - HomeScreen의 initializePushNotifications 함수를 다시 실행하도록 알림
        console.log('[SettingNotificationScreen] notificationInitialized 이벤트 발행');
        
        // 이벤트 발행을 약간 지연시켜 안정성 확보
        setTimeout(() => {
          eventEmitter.emit('notificationInitialized');
          console.log('[SettingNotificationScreen] 이벤트 발행 완료');
          
          // 알림 설정을 다시 불러오기
          fetchNotificationSettings();
        }, 500);
      } else {
        console.log('[SettingNotificationScreen] 알림 권한 획득 실패');
        
        // 권한이 거부된 경우 - 처음 거부한 것인지 이미 영구적으로 거부한 것인지 확인
        if (authStatus === messaging.AuthorizationStatus.DENIED) {
          // 설정 앱으로 이동 유도
          Alert.alert(
            '알림 권한 필요',
            '알림 기능을 사용하려면 설정 앱에서 알림 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              { 
                text: '설정으로 이동', 
                onPress: () => {
                  console.log('[SettingNotificationScreen] 설정 앱으로 이동');
                  Linking.openSettings();
                }
              }
            ]
          );
        } else {
          // 일반적인 거부 상황
          navigation.navigate('RequestNotification' as never);
        }
      }
    } catch (error) {
      console.error('[SettingNotificationScreen] 알림 초기화 오류:', error);
      setError('알림 설정을 초기화하는데 실패했습니다.');
    }
  };

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    
    try {
      // 알림 권한 토글일 경우
      if (key === 'permission_status') {
        if (value) {
          // 알림 권한 활성화 요청
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          
          if (!enabled) {
            // 권한이 거부된 경우
            Alert.alert(
              '알림 권한 필요',
              '앱 알림을 받으려면 알림 권한을 허용해야 합니다. 설정에서 권한을 변경할 수 있습니다.',
              [
                { text: '취소', style: 'cancel' },
                { 
                  text: '설정으로 이동', 
                  onPress: () => Linking.openSettings() 
                }
              ]
            );
            return;
          }
          
          setDevicePermissionEnabled(enabled);
        } else {
          // 알림 비활성화 (시스템 설정으로 이동)
          Alert.alert(
            '알림 권한 비활성화',
            '기기 설정에서 알림 권한을 비활성화할 수 있습니다. 설정으로 이동하시겠습니까?',
            [
              { text: '취소', style: 'cancel' },
              { 
                text: '설정으로 이동', 
                onPress: () => Linking.openSettings() 
              }
            ]
          );
          return;
        }
      }
      
      const numValue = value ? 1 : 0;
      const updatedSettings = { ...settings, [key]: numValue };
      setSettings(updatedSettings);
      
      // 알림 설정 업데이트
      await updateNotification({
        ...updatedSettings,
        device_type: getDeviceType(),
        device_os: getOSVersion(),
      });
      
      // 알림 설정 상세 팝업 표시 (알림 권한 제외)
      if (value && key !== 'permission_status') {
        showSettingDetails(key);
      }
    } catch (err) {
      console.error('알림 설정 업데이트 오류:', err);
      Alert.alert('오류', '알림 설정 업데이트에 실패했습니다.');
      
      // 에러 발생 시 원래 값으로 복원
      setSettings(settings);
      await checkDevicePermissionStatus(); // 실제 권한 상태 다시 확인
    }
  };

  const showSettingDetails = (key: keyof NotificationSettings) => {
    let title = '';
    let message = '';
    
    switch (key) {
      case 'noti_notice':
        title = '기본 알림 설정';
        message = '공지사항, 업데이트, 중요 정보 등 기본적인 알림을 수신합니다.';
        break;
      case 'noti_event':
        title = '정보 알림 설정';
        message = '이벤트, 프로모션, 할인 정보 등의 마케팅 알림을 수신합니다.';
        break;
      case 'noti_sms':
        title = 'SMS 알림 설정';
        message = '중요 알림을 SMS로 수신합니다. 추가 요금이 발생할 수 있습니다.';
        break;
      case 'noti_email':
        title = '이메일 알림 설정';
        message = '주요 알림과 리포트를 이메일로 수신합니다.';
        break;
      default:
        return;
    }
    
    Alert.alert(
      title,
      message,
      [{ text: '확인', style: 'default' }]
    );
  };

  // 실제 기기의 알림 권한 상태 확인
  const checkDevicePermissionStatus = async () => {
    try {
      console.log('[SettingNotificationScreen] 기기 알림 권한 상태 확인 시작');
      
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      console.log('[SettingNotificationScreen] 현재 권한 상태:', enabled ? '허용됨' : '거부됨', authStatus);
      setDevicePermissionEnabled(enabled);
      
      // 권한이 없는 경우 알림 허용 요청
      if (!enabled) {
        console.log('[SettingNotificationScreen] 권한 없음, 팝업 표시');
        showPermissionRequest(authStatus);
      } else {
        // 권한이 있는 경우 설정 로드
        console.log('[SettingNotificationScreen] 권한 있음, 설정 로드');
        fetchNotificationSettings();
      }
      
      // 서버 값이 로드된 후에 실행되어야 하므로 settings가 없으면 업데이트하지 않음
      if (settings && ((enabled && settings.permission_status === 0) || 
          (!enabled && settings.permission_status === 1))) {
        console.log('[SettingNotificationScreen] 서버 상태와 실제 권한 상태 불일치, 업데이트 필요');
        const updatedSettings: NotificationSettings = { 
          ...settings, 
          permission_status: enabled ? 1 : 0 
        };
        setSettings(updatedSettings);
        
        // 서버에 업데이트
        await updateNotification({
          ...updatedSettings,
          device_type: getDeviceType(),
          device_os: getOSVersion(),
        });
        console.log('[SettingNotificationScreen] 서버 업데이트 완료');
      }
    } catch (err) {
      console.error('[SettingNotificationScreen] 알림 권한 확인 오류:', err);
    }
  };

  // 알림 권한 요청 다이얼로그 표시
  const showPermissionRequest = (authStatus: number) => {
    console.log('[SettingNotificationScreen] 권한 요청 팝업 표시, 상태:', authStatus);
    
    // iOS와 Android에서 권한 요청 방식 차이 고려
    if (Platform.OS === 'ios') {
      // iOS의 경우 DENIED와 NOT_DETERMINED를 구분하여 처리
      if (authStatus === messaging.AuthorizationStatus.DENIED) {
        // 이미 명시적으로 거부된 경우 설정 앱으로 이동
        Alert.alert(
          '알림 권한 필요',
          '알림 설정을 관리하려면 알림 권한이 필요합니다. 설정 앱에서 권한을 허용해주세요.',
          [
            {
              text: '취소',
              style: 'cancel',
              onPress: () => navigation.goBack()
            },
            {
              text: '설정으로 이동',
              onPress: () => {
                console.log('[SettingNotificationScreen] 설정 앱으로 이동');
                Linking.openSettings();
              }
            }
          ]
        );
      } else {
        // iOS에서는 권한이 NOT_DETERMINED 상태이거나 다른 상태일 때도 RequestNotification 화면으로 이동
        // iOS는 두 번째 requestPermission()이 시스템 권한 팝업을 표시하지 않기 때문
        console.log('[SettingNotificationScreen] iOS 권한 요청을 위해 RequestNotification 화면으로 이동');
        navigation.navigate('RequestNotification' as never);
      }
    } else {
      // Android의 경우
      if (authStatus === messaging.AuthorizationStatus.DENIED) {
        // 이미 거부된 경우 설정으로 이동
        Alert.alert(
          '알림 권한 필요',
          '알림 설정을 관리하려면 알림 권한이 필요합니다. 설정 앱에서 권한을 허용해주세요.',
          [
            {
              text: '취소',
              style: 'cancel',
              onPress: () => navigation.goBack()
            },
            {
              text: '설정으로 이동',
              onPress: () => {
                console.log('[SettingNotificationScreen] 설정 앱으로 이동');
                Linking.openSettings();
              }
            }
          ]
        );
      } else if (authStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
        // 아직 결정되지 않은 경우 - RequestNotification 화면으로 이동
        console.log('[SettingNotificationScreen] 권한 아직 결정되지 않음, RequestNotification 화면으로 이동');
        navigation.navigate('RequestNotification' as never);
      } else {
        // 그 외 상태 - 일반 권한 요청 다이얼로그 표시
        Alert.alert(
          '알림 권한 필요',
          '알림 설정을 관리하려면 알림 권한이 필요합니다. 알림을 허용하시겠습니까?',
          [
            {
              text: '취소',
              style: 'cancel',
              onPress: () => navigation.goBack()
            },
            {
              text: '허용하기',
              onPress: () => {
                console.log('[SettingNotificationScreen] RequestNotification 화면으로 이동');
                navigation.navigate('RequestNotification' as never);
              }
            }
          ]
        );
      }
    }
  };

  const handleTopicPress = () => {
    setShowTopicModal(true);
  };

  const handleTopicToggle = async (topic: string, isSubscribed: boolean) => {
    try {
      // 토픽 구독 상태 업데이트
      const updatedSubscriptions = topicSubscriptions.map(sub => 
        sub.topic === topic ? { ...sub, isSubscribed } : sub
      );
      setTopicSubscriptions(updatedSubscriptions);

      // 기본 알림 토픽인 경우 settings도 업데이트
      if (topic === 'NOTICE' || topic === 'UPDATE') {
        const hasAnyBasicTopic = updatedSubscriptions.some(sub => 
          (sub.topic === 'NOTICE' || sub.topic === 'UPDATE') && sub.isSubscribed
        );
        
        if (settings) {
          const updatedSettings = {
            ...settings,
            noti_notice: hasAnyBasicTopic ? 1 : 0
          };
          setSettings(updatedSettings);
          await updateNotification(updatedSettings);
        }
      } else {
        // 장비 유형 토픽인 경우
        if (settings && notiSet) {
          const updatedTopics = isSubscribed
            ? notiSet.topics.filter(t => t !== topic)
            : [...notiSet.topics, topic];
          
          const updatedNotiSet = { ...notiSet, topics: updatedTopics };
          setNotiSet(updatedNotiSet);
          
          await updateNotification({
            ...settings,
            device_type: getDeviceType(),
            device_os: getOSVersion(),
            noti_set: updatedNotiSet
          });
        }
      }
    } catch (error) {
      console.error('토픽 구독 상태 업데이트 오류:', error);
      Alert.alert('오류', '토픽 구독 상태 업데이트에 실패했습니다.');
    }
  };

  const getTopicDisplayName = (topic: string) => {
    switch (topic) {
      case 'NOTICE':
        return '공지사항';
      case 'UPDATE':
        return '업데이트';
      default:
        const deviceType = deviceTypes.find(dt => dt.code === topic);
        return deviceType ? deviceType.name : topic;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>알림 설정을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNotificationSettings}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 알림 권한이 없거나 초기 설정이 필요한 경우
  if (!devicePermissionEnabled || isNewUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>알림 설정을 사용하려면 알림 권한이 필요합니다.</Text>
        <TouchableOpacity 
          style={styles.setupButton} 
          onPress={isNewUser ? initializeNotificationSettings : () => navigation.navigate('RequestNotification' as never)}
        >
          <Text style={styles.setupButtonText}>
            {isNewUser ? '알림 설정 초기화하기' : '알림 권한 허용하기'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 권한</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>앱 알림 허용</Text>
              <Text style={styles.settingDescription}>
                {devicePermissionEnabled 
                  ? '앱의 기본 푸시 알림이 허용되어 있습니다.'
                  : '앱의 알림을 받으려면 권한을 허용해야 합니다.'}
              </Text>
            </View>
            <Switch
              value={devicePermissionEnabled}
              onValueChange={(value) => handleToggle('permission_status', value)}
              trackColor={{ false: '#e9ecef', true: '#007bff' }}
              thumbColor="#ffffff"
            />
          </View>
          
          {!devicePermissionEnabled && (
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.permissionButtonText}>시스템 설정에서 권한 변경</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 알림 정보</Text>
          <View style={styles.userTypeContainer}>
            <View style={[
              styles.userTypeItem,
              userInfo === 'HOSPITAL' && styles.userTypeItemSelected
            ]}>
              <Text style={[
                styles.userTypeText,
                userInfo === 'HOSPITAL' && styles.userTypeTextSelected
              ]}>병원</Text>
            </View>
            <View style={[
              styles.userTypeItem,
              userInfo === 'COMPANY' && styles.userTypeItemSelected,
              { borderRightWidth: 0 }
            ]}>
              <Text style={[
                styles.userTypeText,
                userInfo === 'COMPANY' && styles.userTypeTextSelected
              ]}>업체</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 유형 설정</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>기본 알림</Text>
                <TouchableOpacity 
                  style={styles.detailButton}
                  onPress={handleTopicPress}
                >
                  <Text style={styles.detailButtonText}>상세구독설정</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.settingDescription}>공지사항, 업데이트 등 기본 알림</Text>
            </View>
            <Switch
              value={settings?.noti_notice === 1}
              onValueChange={(value) => handleToggle('noti_notice', value)}
              trackColor={{ false: '#e9ecef', true: '#007bff' }}
              thumbColor="#ffffff"
              disabled={!devicePermissionEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>정보 알림</Text>
              <Text style={styles.settingDescription}>이벤트, 프로모션 등 정보 알림</Text>
            </View>
            <Switch
              value={settings?.noti_event === 1}
              onValueChange={(value) => handleToggle('noti_event', value)}
              trackColor={{ false: '#e9ecef', true: '#007bff' }}
              thumbColor="#ffffff"
              disabled={!devicePermissionEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>SMS 알림</Text>
              <Text style={styles.settingDescription}>중요 알림을 SMS로 수신</Text>
            </View>
            <Switch
              value={settings?.noti_sms === 1}
              onValueChange={(value) => handleToggle('noti_sms', value)}
              trackColor={{ false: '#e9ecef', true: '#007bff' }}
              thumbColor="#ffffff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>이메일 알림</Text>
              <Text style={styles.settingDescription}>주요 알림과 리포트를 이메일로 수신</Text>
            </View>
            <Switch
              value={settings?.noti_email === 1}
              onValueChange={(value) => handleToggle('noti_email', value)}
              trackColor={{ false: '#e9ecef', true: '#007bff' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>알림 설정 안내</Text>
          <Text style={styles.infoDescription}>
            알림 설정은 언제든지 변경할 수 있습니다. 중요 알림은 기본 알림 설정과 관계없이 발송될 수 있습니다.
            {!devicePermissionEnabled && '\n\n현재 알림 권한이 비활성화되어 있어 푸시 알림을 받을 수 없습니다. 알림을 받으려면 상단의 스위치를 켜세요.'}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showTopicModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTopicModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>구독 토픽 설정</Text>
            
            <ScrollView style={styles.filterOptions}>
              <Text style={styles.filterSectionTitle}>기본 알림</Text>
              <View style={styles.filterOptionsList}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    notiSet?.topics.includes('NOTICE') && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    if (settings && notiSet) {
                      const updatedTopics = notiSet.topics.includes('NOTICE')
                        ? notiSet.topics.filter(t => t !== 'NOTICE')
                        : [...notiSet.topics, 'NOTICE'];
                      
                      const updatedNotiSet = { ...notiSet, topics: updatedTopics };
                      setNotiSet(updatedNotiSet);
                      updateNotification({
                        ...settings,
                        device_type: getDeviceType(),
                        device_os: getOSVersion(),
                        noti_set: updatedNotiSet
                      });
                    }
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    notiSet?.topics.includes('NOTICE') && styles.filterOptionTextSelected
                  ]}>
                    공지사항
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    notiSet?.topics.includes('UPDATE') && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    if (settings && notiSet) {
                      const updatedTopics = notiSet.topics.includes('UPDATE')
                        ? notiSet.topics.filter(t => t !== 'UPDATE')
                        : [...notiSet.topics, 'UPDATE'];
                      
                      const updatedNotiSet = { ...notiSet, topics: updatedTopics };
                      setNotiSet(updatedNotiSet);
                      updateNotification({
                        ...settings,
                        device_type: getDeviceType(),
                        device_os: getOSVersion(),
                        noti_set: updatedNotiSet
                      });
                    }
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    notiSet?.topics.includes('UPDATE') && styles.filterOptionTextSelected
                  ]}>
                    업데이트
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.filterSectionTitle}>장비 유형</Text>
              <View style={styles.filterOptionsList}>
                {deviceTypes.map(type => {
                  const isSelected = notiSet?.topics.includes(type.code || '');
                  return (
                    <TouchableOpacity
                      key={`type-${type.id}`}
                      style={[
                        styles.filterOption,
                        isSelected && styles.filterOptionSelected
                      ]}
                      onPress={() => {
                        if (settings && notiSet) {
                          const updatedTopics = isSelected
                            ? notiSet.topics.filter(t => t !== type.code)
                            : [...notiSet.topics, type.code || ''];
                          
                          const updatedNotiSet = { ...notiSet, topics: updatedTopics };
                          setNotiSet(updatedNotiSet);
                          updateNotification({
                            ...settings,
                            device_type: getDeviceType(),
                            device_os: getOSVersion(),
                            noti_set: updatedNotiSet
                          });
                        }
                      }}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        isSelected && styles.filterOptionTextSelected
                      ]}>
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={async () => {
                  if (settings) {
                    try {
                      // 사용자 타입에 따라 전체 구독 실행
                      const userType = userInfo;
                      await subscribeToAllTopics(userType);
                      
                      // 모든 토픽 설정
                      setNotiSet({ 
                        topics: getAllTopics(),
                        user_type: userType
                      });
                      
                      // 로컬 상태 업데이트
                      setSettings({
                        ...settings,
                        noti_notice: 1,
                        noti_event: 1,
                        noti_sms: 1,
                        noti_email: 1
                      });
                    } catch (error) {
                      console.error('전체 구독 설정 실패:', error);
                      Alert.alert('오류', '전체 구독 설정에 실패했습니다.');
                    }
                  }
                }}
              >
                <Text style={styles.resetButtonText}>전체 구독</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => {
                  if (settings && notiSet) {
                    updateNotification({
                      ...settings,
                      device_type: getDeviceType(),
                      device_os: getOSVersion(),
                      noti_set: notiSet
                    });
                  }
                  setShowTopicModal(false);
                }}
              >
                <Text style={styles.resetButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6c757d',
  },
  infoBox: {
    backgroundColor: '#e9ecef',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: '#e7f5ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0c63e4',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#3b73b9',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  setupButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    width: '80%',
    alignItems: 'center',
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    width: '80%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterOptions: {
    maxHeight: 400,
  },
  filterOptionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  filterOptionSelected: {
    backgroundColor: '#e7f5ff',
    borderColor: '#007bff',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#495057',
  },
  filterOptionTextSelected: {
    color: '#007bff',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    marginRight: 8,
  },
  resetButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '500',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e7f5ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  detailButtonText: {
    fontSize: 13,
    color: '#007bff',
    fontWeight: '500',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    overflow: 'hidden',
  },
  userTypeItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  userTypeItemSelected: {
    backgroundColor: '#e7f5ff',
  },
  userTypeText: {
    fontSize: 16,
    color: '#6c757d',
  },
  userTypeTextSelected: {
    color: '#007bff',
    fontWeight: '500',
  },
});

export default SettingNotificationScreen;
