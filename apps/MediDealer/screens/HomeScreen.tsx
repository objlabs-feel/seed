import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { getNotification, updateNotification, getAuctionCount } from '../services/medidealer/api';
import notifee from '@notifee/react-native';
import { getDeviceType, getOSVersion } from '../utils/device';
import { eventEmitter } from '../utils/eventEmitter';

type RootStackParamList = {
  Home: undefined;
  RequestNotification: undefined;
  AuctionRegistration: undefined;
  AuctionSearch: undefined;
  AuctionDetail: { id: string };
  AuctionSelectBid: { id: string };
  AuctionBidAccept: { id: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// FCM 구독 정리 함수 타입 정의
interface NotificationCleanup {
  unsubscribeToken: () => void;
  unsubscribeMessage: () => void;
  unsubscribeNotificationOpen: () => void;
}

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [auctionCount, setAuctionCount] = useState(0);

  useEffect(() => {
    console.log('[HomeScreen] 마운트됨');
    // checkNotificationStatus();
    
    // 구독 및 토큰 변수 - 클린업을 위해 사용
    let cleanupFunctions: NotificationCleanup | null = null;
    
    // 알림 초기화 함수 호출
    initializePushNotifications()
      .then((cleanup) => {
        // 클린업 함수가 반환되면 저장
        if (cleanup) {
          cleanupFunctions = cleanup;
        }
      })
      .catch(console.error);
    
    // 알림 초기화 이벤트 리스너 등록
    const notificationInitializedListener = eventEmitter.addListener(
      'notificationInitialized',
      handleNotificationInitialized
    );
    
    console.log('[HomeScreen] 이벤트 리스너 등록됨');
    
    const fetchAuctionCount = async () => {
      try {
        const response = await getAuctionCount();
        setAuctionCount(response.count);
      } catch (error) {
        console.error('Error fetching auction count:', error);
      }
    };

    fetchAuctionCount();

    return () => {
      console.log('[HomeScreen] 언마운트됨, 리소스 정리');
      // 이벤트 리스너 제거
      notificationInitializedListener.remove();
      
      // FCM 이벤트 리스너 제거
      if (cleanupFunctions) {
        cleanupFunctions.unsubscribeToken();
        cleanupFunctions.unsubscribeMessage();
        cleanupFunctions.unsubscribeNotificationOpen();
      }
    };
  }, []);
  
  // 알림 초기화 이벤트 처리 함수
  const handleNotificationInitialized = () => {
    console.log('[HomeScreen] 알림 초기화 이벤트 수신됨');
    
    // 알림 초기화 함수를 약간 지연시켜 호출 - 이벤트 처리 시 경쟁 상태 방지
    setTimeout(() => {
      // 알림 초기화 함수 다시 호출
      initializePushNotifications()
        .then((cleanup) => {
          console.log('[HomeScreen] 알림 초기화 재실행 완료', cleanup ? '(클린업 함수 반환됨)' : '(클린업 함수 없음)');
          // 여기서는 기존 클린업 함수를 교체할 필요가 없음
          // useEffect에서 이미 관리하고 있으므로 무시
        })
        .catch((error) => {
          console.error('[HomeScreen] 알림 초기화 재실행 오류:', error);
        });
    }, 1000); // 1초 지연
  };

  const initializePushNotifications = async (): Promise<NotificationCleanup | null> => {
    try {
      console.log('[HomeScreen] 알림 초기화 시작');
      // FCM 권한 확인 (requestPermission 대신 hasPermission 사용)
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('[HomeScreen] 알림 권한 상태:', enabled ? '허용' : '거부');

      if (enabled) {
        // FCM 토큰 가져오기
        const fcmToken = await messaging().getToken();
        console.log('[HomeScreen] FCM 토큰:', fcmToken);
        
        try {
          // 서버에 토큰 정보 확인 및 업데이트
          console.log('[HomeScreen] 서버에서 알림 설정 조회');
          const notificationInfo = await getNotification();
          console.log('[HomeScreen] 서버에서 알림 설정 조회 성공:', notificationInfo);

          if (notificationInfo.device_token !== fcmToken) {
            console.log('[HomeScreen] 토큰 불일치, 서버 업데이트 필요');
            // 새로운 토큰을 서버에 업데이트
            await updateNotification({
              device_token: fcmToken,
              device_type: getDeviceType(), // 유틸리티 함수 사용
              device_os: getOSVersion(), // 유틸리티 함수 사용
              permission_status: 1,
              noti_notice: 1,
              noti_event: 1,
              noti_sms: 1,
            });
            console.log('[HomeScreen] 서버 업데이트 완료');
          }
        } catch (apiError: any) {
          console.error('[HomeScreen] 알림 API 오류:', apiError);
          
          // 서버에서 404 오류가 반환되면 알림 설정이 서버에 없는 것이므로
          // RequestNotification 화면으로 이동하여 초기 설정을 할 수 있도록 함
          if (apiError.response && apiError.response.status === 404) {
            console.log('[HomeScreen] 알림 설정이 서버에 없음, 초기 설정 필요');
            navigation.navigate('RequestNotification');
            return null;
          }
        }
        
        // 토큰 리프레시 이벤트 처리
        console.log('[HomeScreen] 토큰 리프레시 이벤트 리스너 등록');
        const unsubscribeToken = messaging().onTokenRefresh(token => {
          console.log('[HomeScreen] 새 FCM 토큰:', token);
          updateNotification({
            device_token: token,
            device_type: getDeviceType(), // 유틸리티 함수 사용
            device_os: getOSVersion(), // 유틸리티 함수 사용
            permission_status: 1,
            noti_notice: 1,
            noti_event: 1,
            noti_sms: 1,
          });
        });

        // 포그라운드 상태에서 알림 수신 처리
        console.log('[HomeScreen] 포그라운드 메시지 리스너 등록');
        const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
          console.log('[HomeScreen] 포그라운드 메시지 수신:', remoteMessage);
          // 포그라운드 알림 표시
          if (remoteMessage.notification) {
            await notifee.displayNotification({
              title: remoteMessage.notification.title,
              body: remoteMessage.notification.body,
              data: remoteMessage.data,
            });
          }
        });

        // 알림 클릭 처리
        console.log('[HomeScreen] 알림 클릭 이벤트 리스너 등록');
        const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('[HomeScreen] 알림으로 앱 실행:', remoteMessage);
          const screenName = remoteMessage.data?.screen as keyof RootStackParamList;
          const screenId = remoteMessage.data?.targetId as string;
          
          switch(screenName) {
            case 'AuctionDetail':
            case 'AuctionSelectBid':
            case 'AuctionBidAccept':
              navigation.navigate('AuctionDetail', { id: screenId });
              break;
            default:
              navigation.navigate(screenName);
          }
        });

        // 종료된 상태에서 알림으로 앱 실행 처리
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log('Initial notification:', initialNotification);
          if (initialNotification.data?.screen && initialNotification.data?.id) {
            const screenName = initialNotification.data?.screen as keyof RootStackParamList;
            const screenId = initialNotification.data?.targetId as string;
            
            switch(screenName) {
              case 'AuctionDetail':
              case 'AuctionSelectBid':
              case 'AuctionBidAccept':
                navigation.navigate('AuctionDetail', { id: screenId });
                break;
              default:
                navigation.navigate(screenName);
            }
            // navigation.navigate(initialNotification.data.screen as keyof RootStackParamList, {
            //   id: initialNotification.data.id
            // });
          }
        }

        // 클린업 함수 반환
        console.log('[HomeScreen] 알림 초기화 완료, 클린업 함수 반환');
        return {
          unsubscribeToken,
          unsubscribeMessage,
          unsubscribeNotificationOpen
        };
      } else {
        console.log('[HomeScreen] 알림 권한 없음');
        // 권한이 없는 경우에만 알림 요청 화면으로 이동
        checkNotificationStatus();
        return null;
      }
    } catch (error) {
      console.error('[HomeScreen] 알림 초기화 오류:', error);
      // 오류 발생 시 알림 요청 화면으로 이동
      checkNotificationStatus();
      return null;
    }
  };

  const checkNotificationStatus = async () => {
    try {
      console.log('[HomeScreen] 알림 권한 상태 확인 시작');
      
      // 현재 권한 상태 확인
      const authStatus = await messaging().hasPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      console.log('[HomeScreen] 현재 권한 상태:', enabled ? '허용됨' : '거부됨', authStatus);
      
      // AsyncStorage에서 알림 요청을 이미 보여줬는지 확인
      const hasShownNotificationRequest = await AsyncStorage.getItem('hasShownNotificationRequest');
      
      // 권한이 없을 때만 RequestNotification 화면으로 이동
      if (!enabled) {
        // 이미 거부됨 상태인지 확인
        if (authStatus === messaging.AuthorizationStatus.DENIED) {
          console.log('[HomeScreen] 알림 권한이 명시적으로 거부됨');
          
          // 이전에 요청을 보여줬는지에 따라 다른 행동
          if (hasShownNotificationRequest === 'true') {
            console.log('[HomeScreen] 이미 알림 요청을 보여줬으므로 무시');
            return;
          }
        }
        
        console.log('[HomeScreen] RequestNotification 화면으로 이동');
        navigation.navigate('RequestNotification');
        
        // 요청을 보여줬다고 표시
        await AsyncStorage.setItem('hasShownNotificationRequest', 'true');
      } else {
        console.log('[HomeScreen] 이미 알림 권한이 허용되어 있습니다.');
      }
    } catch (error) {
      console.error('[HomeScreen] 알림 상태 확인 오류:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Total 통계 영역 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>누적 경매 건수</Text>
            <Text style={styles.statNumber}>{2100 + auctionCount}</Text>
          </View>
          {/* <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total 구매</Text>
            <Text style={styles.statNumber}>1,857</Text>
          </View> */}
        </View>

        {/* 팔기/사기 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.sellButton]}
            onPress={() => navigation.navigate('AuctionRegistration')}
          >
            <Text style={styles.buttonText}>팔기</Text>
            <Text style={styles.buttonSubtext}>의료기기 등록</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.buyButton]}
            onPress={() => navigation.navigate('AuctionSearch')}
          >
            <Text style={styles.buttonText}>사기</Text>
            <Text style={styles.buttonSubtext}>의료기기 구매</Text>
          </TouchableOpacity>
        </View>

        {/* MOU 체결 현황 */}
        <View style={styles.mouContainer}>
          <Text style={styles.sectionTitle}>MOU 체결 현황</Text>
          <View style={styles.mouContent}>
            <Text style={styles.mouText}>전국 500여 개 병원과 MOU 체결</Text>
            <Text style={styles.mouSubtext}>안전한 의료기기 거래를 위한 파트너십</Text>
          </View>
        </View>

        {/* 광고 영역 */}
        <View style={styles.adContainer}>
          <Text style={styles.sectionTitle}>공지사항</Text>
          <View style={styles.adContent}>
            <Text style={styles.adTitle}>의료기기 거래 수수료 0%</Text>
            <Text style={styles.adText}>2025년 상반기 프로모션</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#dee2e6',
    marginHorizontal: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  sellButton: {
    backgroundColor: '#4CAF50',
  },
  buyButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  mouContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  mouContent: {
    marginTop: 8,
  },
  mouText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  mouSubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  adContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  adContent: {
    marginTop: 8,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  adText: {
    fontSize: 14,
    color: '#6c757d',
  },
});

export default HomeScreen; 