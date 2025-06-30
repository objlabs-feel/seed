import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { getNotification, updateNotification, getAuctionCount, getMySaleList, getMyBuyList } from '../services/medidealer/api';
import notifee, { EventType } from '@notifee/react-native';
import { getDeviceType, getOSVersion } from '../utils/device';
import { eventEmitter } from '../utils/eventEmitter';
import AntDesign from 'react-native-vector-icons/AntDesign';

type RootStackParamList = {
  Home: undefined;
  RequestNotification: undefined;
  AuctionRegistration: undefined;
  AuctionSearch: undefined;
  AuctionDetail: { id: string };
  AuctionSelectBid: { id: string };
  AuctionBidAccept: { id: string };
  Notifications: undefined;
  Settings: undefined;
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
  const [activeTab, setActiveTab] = useState('sell'); // 'sell' 또는 'buy'
  const [sellItems, setSellItems] = useState<any[]>([]);
  const [buyItems, setBuyItems] = useState<any[]>([]);
  const [isLoadingSell, setIsLoadingSell] = useState(false);
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);

  useEffect(() => {
    console.log('[HomeScreen] 마운트됨');
    // checkNotificationStatus();
    
    let isMounted = true;
    
    const initializeNotifications = async () => {
      try {
        const cleanup = await initializePushNotifications();
        if (isMounted && cleanup) {
          // 클린업 함수 저장
        }
      } catch (error) {
        console.error('알림 초기화 오류:', error);
      }
    };

    initializeNotifications();

    const notificationListener = eventEmitter.addListener(
      'notificationInitialized',
      handleNotificationInitialized
    );

    const fetchAuctionCount = async () => {
      try {
        const response = await getAuctionCount();
        setAuctionCount(response.count);
      } catch (error) {
        console.error('Error fetching auction count:', error);
      }
    };

    fetchAuctionCount();

    // 포그라운드 메시지 핸들러
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      try {
        if (remoteMessage.notification) {
          await notifee.displayNotification({
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            data: remoteMessage.data,
            android: {
              channelId: 'default',
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              foregroundPresentationOptions: {
                badge: true,
                sound: true,
                banner: true,
                list: true,
              },
            },
          });
        }
      } catch (error) {
        console.error('알림 표시 중 오류:', error);
      }
    });

    // 백그라운드 메시지 핸들러
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      if (remoteMessage.notification) {
        await notifee.displayNotification({
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          data: remoteMessage.data,
        });
      }
    });

    // 알림 이벤트 리스너
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('알림이 닫혔습니다:', detail.notification);
          break;
        case EventType.PRESS:
          console.log('알림을 눌렀습니다:', detail.notification);
          // 알림 클릭 시 처리 로직
          break;
      }
    });

    // 네비게이션 헤더 설정
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign name="home" size={20} color="#333" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>메디딜러</Text>
        </View>
      ),
      headerLeft: () => null,
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerIconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <AntDesign name="bells" size={20} color="#333" />
          <Text style={styles.headerIconText}>알림</Text>
        </TouchableOpacity>
      ),
    });

    return () => {
      console.log('[HomeScreen] 언마운트됨, 리소스 정리');
      isMounted = false;
      notificationListener.remove();
      unsubscribe();
      unsubscribeNotifee();
    };
  }, [navigation]);
  
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
      
      // FCM 권한 확인
      const authStatus = await messaging().hasPermission();
      console.log(`[HomeScreen] 권한 상태: ${authStatus} (NOT_DETERMINED=${messaging.AuthorizationStatus.NOT_DETERMINED}, DENIED=${messaging.AuthorizationStatus.DENIED}, AUTHORIZED=${messaging.AuthorizationStatus.AUTHORIZED})`);
      
      // 사용자가 이전에 권한 요청을 본 적이 있는지 확인
      const hasShownNotificationRequest = await AsyncStorage.getItem('hasShownNotificationRequest');
      console.log(`[HomeScreen] 이전에 권한 요청을 보여줬는지 여부: ${hasShownNotificationRequest}`);
      
      // 권한이 결정되지 않은 상태이거나, 
      // Android에서 DENIED 상태이지만 아직 한 번도 권한 요청을 본 적이 없는 경우
      // (Android에서는 초기 상태가 NOT_DETERMINED가 아닌 DENIED임)
      if (authStatus === messaging.AuthorizationStatus.NOT_DETERMINED || 
          (authStatus === messaging.AuthorizationStatus.DENIED && hasShownNotificationRequest !== 'true')) {
        console.log('[HomeScreen] 권한 요청이 필요한 상태입니다. RequestNotification 화면으로 이동합니다.');
        navigation.navigate('RequestNotification');
        return null;
      }
      
      // 기존 로직 계속 진행
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
        // 권한이 없는 경우에는 NotificationScreen으로 이동하지 않음
        // 이미 거부된 경우 사용자 경험을 위해 알림 화면을 다시 보여주지 않음
        return null;
      }
    } catch (error) {
      console.error('[HomeScreen] 알림 초기화 오류:', error);
      return null;
    }
  };

  // 판매 상품 목록 로드 함수
  const loadSellingItems = async () => {
    try {
      setIsLoadingSell(true);
      
      const response = await getMySaleList(1, 10);
      console.log('My sale list:', response);
      
      // API 응답 데이터를 화면에 맞는 형태로 변환
      const transformedItems = response.data?.map((item: any) => ({
        id: item.id,
        salesType: item.salesType,
        title: item.item?.device?.deviceType?.name || item.salesType?.name || '제목 없음',
        price: item.item?.auction_item_history?.[0]?.value || 0,
        status: item.status === 1 ? '판매중' : item.status === 2 ? '낙찰' : '완료',
        date: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
        bid_count: item.item?.auction_item_history?.length || 0,
        image_url: item.item?.device?.images?.[0] || null,
        deadline: item.item?.auction_timeout || null
      })) || [];
      
      console.log('Transformed items:', transformedItems);
      
      setSellItems(transformedItems);
      setIsLoadingSell(false);
    } catch (error) {
      console.error('판매 상품 로드 오류:', error);
      setIsLoadingSell(false);
    }
  };

  // 구매/입찰 상품 목록 로드 함수
  const loadBuyingItems = async () => {
    try {
      setIsLoadingBuy(true);
      
      const response = await getMyBuyList(1, 10);
      console.log('My buy list:', response);
      
      // API 응답 데이터를 화면에 맞는 형태로 변환
      const transformedItems = response.data?.map((item: any) => ({
        id: item.id,
        title: item.item?.device?.deviceType?.name || '제목 없음',
        status: item.status === 1 ? '입찰중' : item.status === 2 ? '낙찰' : '완료',
        bid: item.item?.auction_item_history?.[0]?.value?.toLocaleString() + '원' || '0원',
        date: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
        price: item.item?.auction_item_history?.[0]?.value || 0
      })) || [];
      
      console.log('Transformed buy items:', transformedItems);
      
      setBuyItems(transformedItems);
      setIsLoadingBuy(false);
    } catch (error) {
      console.error('구매 상품 로드 오류:', error);
      setIsLoadingBuy(false);
    }
  };

  // 탭 변경 시 관련 데이터 로드
  useEffect(() => {
    if (activeTab === 'sell') {
      loadSellingItems();
    } else {
      loadBuyingItems();
    }
  }, [activeTab]);

  // 판매 아이템 렌더링 함수
  const renderSellItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.listItemContainer}
      onPress={() => {
        // salesType.code에 따라 다른 화면으로 이동
        console.log('item.salesType?.code:', item.salesType?.code);
        if (item.salesType?.code === 'AUCTION') {
          navigation.navigate('AuctionDetail', { id: item.id.toString() });
        } else {
          // 다른 salesType에 대한 처리 (추후 확장 가능)
          console.log('다른 salesType:', item.salesType?.code);
        }
      }}
    >
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          item.status === '판매중' ? styles.statusOngoing : styles.statusCompleted
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.listItemDetails}>
        <Text style={styles.listItemPrice}>{item.price?.toLocaleString()}원</Text>
        <Text style={styles.listItemDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  // 구매 아이템 렌더링 함수
  const renderBuyItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.listItemContainer}
      onPress={() => {
        // salesType.code에 따라 다른 화면으로 이동
        if (item.salesType?.code === 'AUCTION') {
          navigation.navigate('AuctionDetail', { id: item.id.toString() });
        } else {
          // 다른 salesType에 대한 처리 (추후 확장 가능)
          console.log('다른 salesType:', item.salesType?.code);
        }
      }}
    >
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTitle}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          item.status === '입찰중' ? styles.statusOngoing : styles.statusCompleted
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.listItemDetails}>
        <Text style={styles.listItemPrice}>입찰가: {item.bid}</Text>
        <Text style={styles.listItemDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Total 통계 영역 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>누적 경매 건수</Text>
            <Text style={styles.statNumber}>{2100 + auctionCount}</Text>
          </View>
        </View>

        {/* 탭 메뉴 영역 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'sell' && styles.activeTabButton]}
            onPress={() => setActiveTab('sell')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'sell' && styles.activeTabButtonText]}>판매하기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'buy' && styles.activeTabButton]}
            onPress={() => setActiveTab('buy')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'buy' && styles.activeTabButtonText]}>구매하기</Text>
          </TouchableOpacity>
        </View>

        {/* 탭 컨텐츠 영역 */}
        <View style={styles.tabContentContainer}>
          {/* 상단 버튼 영역 (공통) */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => 
                activeTab === 'sell' 
                  ? navigation.navigate('AuctionRegistration') 
                  : navigation.navigate('AuctionSearch')
              }
            >
              <Text style={styles.actionButtonText}>중고경매</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>새의료기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>나눔하기</Text>
            </TouchableOpacity>
          </View>
          
          {/* 하단 현황 영역 (탭에 따라 다름) */}
          {activeTab === 'sell' ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>내 판매현황</Text>
              {isLoadingSell ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007bff" />
                  <Text style={styles.loadingText}>판매 정보를 불러오는 중...</Text>
                </View>
              ) : sellItems.length > 0 ? (
                <FlatList
                  data={sellItems}
                  renderItem={renderSellItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>등록된 판매 상품이 없습니다.</Text>
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('AuctionRegistration')}
                  >
                    <Text style={styles.emptyButtonText}>의료기기 판매하기</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>내 구매현황</Text>
              {isLoadingBuy ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007bff" />
                  <Text style={styles.loadingText}>구매 정보를 불러오는 중...</Text>
                </View>
              ) : buyItems.length > 0 ? (
                <FlatList
                  data={buyItems}
                  renderItem={renderBuyItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>입찰 중인 상품이 없습니다.</Text>
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('AuctionSearch')}
                  >
                    <Text style={styles.emptyButtonText}>의료기기 구매하기</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#007bff',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabButtonText: {
    color: 'white',
  },
  tabContentContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  statusContainer: {
    marginTop: 16,
    minHeight: 200,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#343a40',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  emptyButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  listItemContainer: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusOngoing: {
    backgroundColor: '#28a745',
  },
  statusCompleted: {
    backgroundColor: '#6c757d',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  listItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listItemPrice: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  listItemDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  headerIconButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 5,
  },
  headerIconText: {
    fontSize: 10,
    marginTop: 2,
    color: '#333',
  },
});

export default HomeScreen; 