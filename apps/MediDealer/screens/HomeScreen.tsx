import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { getNotification, updateNotification } from '../services/medidealer/api';
import notifee from '@notifee/react-native';

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

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    console.log('HomeScreen mounted');
    // checkNotificationStatus();
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // FCM 권한 요청
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // FCM 토큰 가져오기
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);
        
        // TODO: FCM 토큰을 서버에 업데이트하는 API 호출 필요
        const notificationInfo = await getNotification();
        console.log('notificationInfo', notificationInfo);

        if (notificationInfo.device_token !== fcmToken) {
          // TODO: 새로운 토큰을 서버에 업데이트하는 API 호출 필요 
          checkNotificationStatus();
        }
        // 토큰 리프레시 이벤트 처리
        const unsubscribeToken = messaging().onTokenRefresh(token => {
          console.log('New FCM Token:', token);
          // TODO: 새로운 토큰을 서버에 업데이트하는 API 호출 필요 
          updateNotification({
            device_token: token,
            permission_status: 1,
            noti_notice: 1,
            noti_event: 1,
            noti_sms: 1,
          });
        });

        // 포그라운드 상태에서 알림 수신 처리
        const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
          console.log('Foreground message:', remoteMessage);
          // TODO: 포그라운드 알림 표시 로직 추가
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
        const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification opened app:', remoteMessage);
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
        return () => {
          unsubscribeToken();
          unsubscribeMessage();
          unsubscribeNotificationOpen();
        };
      } else {
        console.log('Push notification not enabled');        
        checkNotificationStatus();        
      }
    } catch (error) {
      console.error('Push notification initialization error:', error);      
      checkNotificationStatus();
    }
  };

  const checkNotificationStatus = async () => {
    try {
      navigation.navigate('RequestNotification');
      // const hasShownNotificationRequest = await AsyncStorage.getItem('hasShownNotificationRequest');
      // console.log('hasShownNotificationRequest:', hasShownNotificationRequest);
      // if (hasShownNotificationRequest === null) {
      //   navigation.navigate('RequestNotification');
      // }
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Total 통계 영역 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statNumber}>2,138</Text>
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
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.buyButton]}
            onPress={() => navigation.navigate('AuctionSearch')}
          >
            <Text style={styles.buttonText}>사기</Text>
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
            <Text style={styles.adText}>2024년 상반기 프로모션</Text>
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
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
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
  sellButton: {
    backgroundColor: '#28a745',
  },
  buyButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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