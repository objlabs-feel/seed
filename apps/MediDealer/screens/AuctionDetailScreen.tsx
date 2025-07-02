import React, { useEffect, useState, useLayoutEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { bidAuction, getAuctionDetail, getAuctionHistory } from '../services/medidealer/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuctionItemResponseDto, AuctionItemHistoryResponseDto } from '@repo/shared';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { processImageUrl, createImageSource } from '../utils/imageHelper';

const { width } = Dimensions.get('window');

const DEFAULT_IMAGE = require('../assets/default.jpg'); // 기본 이미지 추가

// 이미지 슬라이더의 이미지 크기 설정
const IMAGE_WIDTH = width;
const IMAGE_HEIGHT = width * 0.8;

// 이미지 로딩 상태 추적을 위한 인터페이스
interface ImageLoadingState {
  [key: number]: boolean;
}

// 이미지 인터페이스 정의
interface DeviceImage {
  url: string | null;
  id?: string | number;
  description?: string;
  originalUrl?: string;
}

interface AuctionItemParams {
  id: string | number;
  // 다른 필요한 파라미터들 추가
}

interface AuctionItemProps {
  navigation: StackNavigationProp<any>;
  route: RouteProp<{ params: AuctionItemParams }, 'params'>;
}

const PreviewSection = ({ title, content }: { title: string, content: string }) => (
  <View style={styles.specContainer}>
    <Text style={styles.specLabel}>{title}</Text>
    <Text style={styles.specValue}>{content || '-'}</Text>
  </View>
);

const AuctionItemScreen: React.FC<AuctionItemProps> = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [auctionItem, setAuctionItem] = useState<AuctionItemResponseDto | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { id } = route.params;
  const [highestBid, setHighestBid] = useState(0);
  const [auctionHistory, setAuctionHistory] = useState<AuctionItemHistoryResponseDto[]>([]);
  const [isBidModalVisible, setIsBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [canAccept, setCanAccept] = useState(false);
  
  // 이미지 슬라이더 관련 상태 및 ref
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState<ImageLoadingState>({});
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevIndexRef = useRef(0);
  const [selectedImage, setSelectedImage] = useState<DeviceImage | null>(null);
  const [viewingFullScreen, setViewingFullScreen] = useState(false);
  
  // 이미지 확대 모드 토글
  const toggleFullScreenMode = useCallback((image: DeviceImage) => {
    setSelectedImage(image);
    setViewingFullScreen(true);
  }, []);

  // 특정 이미지로 스크롤하는 함수
  const scrollToImage = useCallback((index: number) => {
    // 이전 인덱스와 다를 경우에만 애니메이션 시작
    if (prevIndexRef.current !== index) {
      // 페이드 아웃
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // 스크롤 이동
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: index * IMAGE_WIDTH, animated: true });
        }
        
        // 페이드 인
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
      
      prevIndexRef.current = index;
    } else {
      // 같은 인덱스면 바로 스크롤
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: index * IMAGE_WIDTH, animated: true });
      }
    }
  }, [fadeAnim, scrollViewRef]);

  // 이미지 소스 메모이제이션
  const getImageSource = useCallback((url: string | null) => {
    if (!url) return DEFAULT_IMAGE;
    return createImageSource(url);
  }, []);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.floor(x / IMAGE_WIDTH + 0.5);
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  }, [currentImageIndex]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@MediDealer:userData');
        if (userData) {
          const { id } = JSON.parse(userData);
          setCurrentUserId(id);
        }
      } catch (error) {
        console.error('사용자 정보 로딩 중 오류:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAuctionItem = async () => {
      try {
        const data = await getAuctionDetail(id as string);
        console.log('Auction detail data:', data.data.item);  // 데이터 구조 확인
        setAuctionItem(data.data.item);
        setAuctionHistory(data.data.item.auction_item_history);
        // updateHighestBid();
      } catch (error) {
        console.error('경매 상세 정보 로딩 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionItem();
  }, [id]);

  useEffect(() => {
    updateHighestBid();
    console.log('AuctionItem?.accept_id', auctionItem?.accept_id);
    if (auctionItem?.accept_id && auctionItem?.accept_id !== 0) {      
      const acceptBid = auctionHistory.filter(bid => bid.id === auctionItem?.accept_id && bid.user_id === currentUserId);
      if (acceptBid && acceptBid.length > 0) {
        console.log('낙찰 처리');
        setCanAccept(true);
      }
    }
  }, [auctionHistory]);

  // 최고가 찾는 함수 추가
  const updateHighestBid = async () => {
    try {
      const history = auctionHistory;
      if (history && history.length > 0) {
        // 입찰 기록을 금액 기준으로 정렬하고 최고가 반환
        const highestBid = Math.max(...history.map(bid => bid.value || 0));
        setHighestBid(highestBid);
      }
    } catch (error) {
      console.error('입찰 기록 조회 중 오류:', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: auctionItem?.device?.deviceType?.name || '상세 정보',
      headerBackTitle: '뒤로',
      headerTitleAlign: 'center',
    });
  }, [navigation, auctionItem]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!auctionItem?.device) {
    return (
      <View style={styles.errorContainer}>
        <Text>경매 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const { device } = auctionItem;

  // 이미지 배열 생성
  const deviceImages: DeviceImage[] = device.images && device.images.length > 0
    ? device.images.map((img, index) => ({
        url: img.url,
        id: index,
        originalUrl: img.url
      }))
    : [{ url: null, id: 0 }];

  const isOwner = currentUserId === auctionItem?.device?.company?.owner_id;
//   const isOwner = true;

  const remainingTime = auctionItem?.auction_timeout;
  const addBid = async (amount: number) => {
    console.log('addBid', amount);
    console.log('auctionItem.id', auctionItem.id);

    // 입찰 기록에 내가 입찰한 기록이 있는지 확인
    const isMyBid = auctionHistory.some(bid => bid.user_id === currentUserId && bid.value === amount);

    if (isMyBid) {
      Alert.alert('이미 입찰한 금액입니다.');
      setBidAmount('');
      return;
    }
    
    if (amount > 0 && !isMyBid) {
      try {
        console.log('amount', amount);
        const result = await bidAuction(auctionItem.id.toString(), amount);
        console.log('result', result);
        if (result.success) {
          setAuctionHistory([result.data, ...auctionHistory]);
        }
        setIsBidModalVisible(false);
        setBidAmount('');
      } catch (error) {
        console.error('입찰 처리 중 오류:', error);
        Alert.alert('입찰 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 이미지 슬라이더 렌더링 함수
  const renderImageSlider = () => {
    return (
      <Animated.View 
        style={[
          styles.imageSliderContainer,
          { opacity: fadeAnim }
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          {deviceImages.map((image: DeviceImage, index: number) => (
            <TouchableOpacity 
              key={`image-${image.id || index}`}
              style={styles.imageContainer}
              activeOpacity={0.9}
              onPress={() => toggleFullScreenMode(image)}
            >
              {imageLoading[index] && (
                <View style={styles.imageLoadingContainer}>
                  <ActivityIndicator size="large" color="#007bff" />
                </View>
              )}
              
              {image.url ? (
                <Image
                  source={getImageSource(image.url)}
                  style={styles.deviceImage}
                  defaultSource={DEFAULT_IMAGE}
                  onLoadStart={() => {
                    setImageLoading(prev => ({ ...prev, [index]: true }));
                  }}
                  onLoadEnd={() => {
                    setImageLoading(prev => ({ ...prev, [index]: false }));
                  }}
                  onError={(e) => {
                    console.error('이미지 로딩 오류:', e.nativeEvent.error);
                    setImageLoading(prev => ({ ...prev, [index]: false }));
                  }}
                />
              ) : (
                <Image
                  source={DEFAULT_IMAGE}
                  style={styles.deviceImage}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* 이미지 인디케이터 */}
        {deviceImages.length > 1 && (
          <View style={styles.indicatorContainer}>
            {deviceImages.map((_: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.activeIndicator,
                ]}
                onPress={() => scrollToImage(index)}
              />
            ))}
          </View>
        )}

        {/* 이미지 슬라이더 좌우 버튼 (여러 개 이미지가 있을 경우에만 표시) */}
        {deviceImages.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <TouchableOpacity
                style={[styles.sliderButton, styles.sliderButtonLeft]}
                onPress={() => scrollToImage(currentImageIndex - 1)}
              >
                <Icon name="chevron-left" size={24} color="white" />
              </TouchableOpacity>
            )}
            
            {currentImageIndex < deviceImages.length - 1 && (
              <TouchableOpacity
                style={[styles.sliderButton, styles.sliderButtonRight]}
                onPress={() => scrollToImage(currentImageIndex + 1)}
              >
                <Icon name="chevron-right" size={24} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* 이미지 정보 표시 */}
        {deviceImages.length > 0 && (
          <View style={styles.imageCountContainer}>
            <Text style={styles.imageCountText}>
              {currentImageIndex + 1} / {deviceImages.length}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  // 전체 화면 이미지 뷰어 렌더링
  const renderFullScreenImageViewer = () => {
    if (!viewingFullScreen || !selectedImage) return null;
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={viewingFullScreen}
        onRequestClose={() => setViewingFullScreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.fullScreenCloseButton}
            onPress={() => setViewingFullScreen(false)}
          >
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.fullScreenImageContainer}>
            {selectedImage.url ? (
              <Image
                source={createImageSource(selectedImage.url)}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={DEFAULT_IMAGE}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={[styles.scrollView, { marginBottom: 80 }]}>
        {/* 이미지 슬라이더 */}
        {renderImageSlider()}

        {/* 기본 정보 */}
        <View style={styles.contentContainer}>
          {/* 경매 정보 헤더 */}
          <View style={styles.headerContainer}>
            <Text style={styles.deviceName}>경매번호: {auctionItem.auction_code}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>남은 시간: 00:00</Text>
            </View>
          </View>
          
          <Text style={styles.deviceModel}>
            판매자 정보: {auctionItem.device?.company?.area}
          </Text>
          
          <View style={styles.divider} />
          
          {/* 장비 스펙 */}
          <Text style={styles.sectionTitle}>장비 정보</Text>
          
          <View style={styles.specContainer}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>장비 유형</Text>
              <Text style={styles.specValue}>{device.deviceType?.name || '정보 없음'}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>진료과</Text>
              <Text style={styles.specValue}>{device.department?.name || '정보 없음'}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>제조사</Text>
              <Text style={styles.specValue}>{device.manufacturer?.name || '정보 없음'}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>제조연도</Text>
              <Text style={styles.specValue}>{device.manufacture_date ? `${device.manufacture_date}년` : '정보 없음'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* 장비 설명 */}
          <Text style={styles.sectionTitle}>설명</Text>
          <Text style={styles.description}>
            {device.description || '장비에 대한 설명이 없습니다.'}
          </Text>
          
          <View style={styles.divider} />

          {/* 경매 정보 */}
          <Text style={styles.sectionTitle}>경매 정보</Text>
          <View style={styles.specContainer}>
            {isOwner && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>현재 최고 입찰가</Text>
                <Text style={styles.specValue}>{`${highestBid || 0}원`}</Text>
              </View>
            )}
            
            {/* 내 입찰기록 */}
            {!isOwner && (                
              <>
                <Text style={styles.subSectionTitle}>내 입찰 기록</Text>
                {auctionHistory
                  .filter(bid => bid.user_id === currentUserId)
                  .map((bid, index) => (
                    <View key={index} style={styles.bidHistoryItem}>
                      <Text style={styles.bidAmount}>
                        {bid.value?.toLocaleString()}원
                      </Text>
                      <Text style={styles.bidTime}> 
                        {bid.created_at ? new Date(bid.created_at).toLocaleString() : ''}
                      </Text>
                    </View>
                  ))
                }
                {auctionHistory.filter(bid => bid.user_id === currentUserId).length === 0 && (
                  <Text style={styles.noBidsText}>아직 입찰 기록이 없습니다.</Text>
                )}
              </>
            )}
          </View>
          
          {/* 하단 여백 */}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* 전체 화면 이미지 뷰어 */}
      {renderFullScreenImageViewer()}

      {!isOwner && (
        <View style={styles.bottomButtonContainer}>
          {canAccept ? (
            <TouchableOpacity 
              style={styles.bidNextButton}
              onPress={() => navigation.navigate('AuctionBidAccept', { 
                auctionId: auctionItem.id 
              })}
            >
              <Text style={styles.bidButtonText}>인도절차 진행하기</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.bidButton}
              onPress={() => setIsBidModalVisible(true)}
            >
              <Text style={styles.bidButtonText}>입찰하기</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isOwner && (
        <View style={styles.bottomButtonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[
                styles.ownerButton, 
                styles.confirmButton,
                !highestBid && styles.disabledButton
              ]}
              disabled={!highestBid}
              onPress={() => {                
                navigation.navigate('AuctionSelectBid', { 
                  auctionId: auctionItem.id 
                });
              }}
            >
              <Text style={[
                styles.buttonText,
                !highestBid && styles.disabledButtonText,
                styles.buttonTextCenter
              ]}>낙찰하기</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.ownerButton, 
                styles.cancelButton,
              ]}
              onPress={() => {
                // 경매 취소 로직
                console.log('경매 취소');
              }}
            >
              <Text style={[styles.buttonText, styles.buttonTextCenter]}>경매 취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={isBidModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>입찰 금액 입력</Text>
            <TextInput
              style={styles.input}
              value={bidAmount}
              onChangeText={setBidAmount}
              placeholder="입찰 금액을 입력하세요"
              keyboardType="numeric"
              autoFocus={true}
            />
            <View style={styles.feeContainer}>              
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>부가세:</Text>
                <Text style={styles.feeAmount}>{parseInt(bidAmount ? bidAmount : '0') * 0.1} 원</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>수수료:</Text>
                <Text style={styles.feeAmount}>{parseInt(bidAmount ? bidAmount : '0') * 0.08} 원</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>예상 총금액:</Text>
                <Text style={styles.feeAmount}>{parseInt(bidAmount ? bidAmount : '0') + parseInt(bidAmount ? bidAmount : '0') * 0.08 + parseInt(bidAmount ? bidAmount : '0' ) * 0.1} 원</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsBidModalVisible(false);
                  setBidAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  // 입찰 처리 로직
                  console.log('입찰가격:', bidAmount);
                  // 입찰 금액이 0보다 크고 내가 입찰한 기록이 없으면 입찰 처리
                  // 입력단위는 1000원 단위로 입력
                  if (parseInt(bidAmount) > 0 && parseInt(bidAmount) % 10000 === 0) {
                    await addBid(parseInt(bidAmount));                    
                  } else {
                    Alert.alert('입찰 금액을 10,000원 단위로 입력해주세요.');
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>입찰하기</Text>
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageSliderContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  imageLoadingContainer: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  deviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    zIndex: 5,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  sliderButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sliderButtonLeft: {
    left: 10,
  },
  sliderButtonRight: {
    right: 10,
  },
  imageCountContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  imageCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImageContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  contentContainer: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 10,
    backgroundColor: '#ffc107',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  deviceModel: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
    marginTop: 5,
  },
  specContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  specLabel: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bidButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bidNextButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  ownerButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextCenter: {
    textAlign: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
  disabledButtonText: {
    color: '#999',
  },
  bidHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bidTime: {
    fontSize: 14,
    color: '#6c757d',
  },
  noBidsText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  feeContainer: {
    width: '100%',
    marginVertical: 10,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  feeLabel: {
    fontSize: 16,
    textAlign: 'left',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
});

export default AuctionItemScreen; 