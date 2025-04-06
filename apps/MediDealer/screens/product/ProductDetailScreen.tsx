import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  Animated,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getMyDevices } from '../../services/medidealer/api';
import { processImageUrl, createImageSource } from '../../utils/imageHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 기본 이미지 추가
const DEFAULT_IMAGE = require('../../assets/default.jpg');

// 화면 크기 가져오기
const { width } = Dimensions.get('window');

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

type ParamList = {
  DeviceDetail: {
    id: string;
  };
};

const ProductDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<RouteProp<ParamList, 'DeviceDetail'>>();
  const { id } = route.params;
  // ScrollView 참조 생성
  const scrollViewRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasDataChanged, setHasDataChanged] = useState(false);
  // 이미지 로딩 상태 관리
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

  // 네비게이션 헤더 설정
  useEffect(() => {
    if (device) {
      navigation.setOptions({
        headerTitle: device.name || '의료기기 상세',
        headerTitleStyle: {
          fontSize: 18,
        },
        headerBackTitle: '뒤로',
      });
    } else {
      navigation.setOptions({
        headerTitle: '의료기기 상세',
        headerBackTitle: '뒤로',
      });
    }
  }, [navigation, device]);

  // 화면을 나갈 때 변경 사항이 있었으면 목록 화면 업데이트를 트리거
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async () => {
      if (hasDataChanged) {
        try {
          // 목록 화면에 강제 새로고침을 알리는 플래그 설정
          await AsyncStorage.setItem('myDevices_forceRefresh', 'true');
          console.log('상세 화면에서 변경 사항이 감지되어 목록 화면 새로고침 플래그 설정');
        } catch (error) {
          console.error('AsyncStorage 설정 오류:', error);
        }
      }
    });

    return unsubscribe;
  }, [navigation, hasDataChanged]);

  useEffect(() => {
    fetchDeviceDetail();
  }, [id]);

  const fetchDeviceDetail = async () => {
    try {
      setLoading(true);
      // 개별 장비 조회 API가 있다면 그것을 사용, 없다면 전체 목록에서 ID로 필터링
      const response = await getMyDevices();
      const foundDevice = response.data?.find((item: any) => item.id === id);
      
      if (foundDevice) {
        // 이미지 URL 처리
        if (__DEV__) {
          console.log('원본 이미지 URL:', foundDevice.image_url);
        }
        
        // images 배열 처리
        if (foundDevice.images && foundDevice.images.length > 0) {
          if (__DEV__) {
            console.log('장치에 images 배열 존재:', foundDevice.images.length, '개 이미지');
          }
          
          // 이미지 배열 처리 (각 이미지 URL 처리)
          foundDevice.images = foundDevice.images.map((img: any, index: number) => {
            if (img.url) {
              const processedUrl = processImageUrl(img.url);
              if (__DEV__) {
                console.log(`이미지 ${index + 1} URL 처리: ${img.url} -> ${processedUrl}`);
              }
              return {
                ...img,
                url: processedUrl,
                originalUrl: img.url,
                id: img.id || index, // id가 없으면 index 사용
              };
            }
            return {
              ...img,
              id: img.id || index,
            };
          });
        } 
        // 단일 이미지 URL이 있는 경우
        else if (foundDevice.image_url) {
          // 이미지 URL 처리
          try {
            const processedUrl = processImageUrl(foundDevice.image_url);
            if (__DEV__) {
              console.log('처리된 이미지 URL:', processedUrl);
            }
            
            // 단일 URL을 images 배열로 변환
            foundDevice.images = [{
              url: processedUrl,
              originalUrl: foundDevice.image_url,
              id: 0
            }];
            
            // 기존 image_url 유지 (하위 호환성)
            foundDevice.image_url = processedUrl;
          } catch (error) {
            console.error('이미지 URL 처리 오류:', error);
          }
        }
        
        setDevice(foundDevice);
      } else {
        setError('장비 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('장비 상세 정보 조회 오류:', err);
      setError('장비 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침 핸들러 함수
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeviceDetail();
  };

  // 장비 정보 업데이트 함수 (수정 버튼에서 사용)
  const updateDeviceInfo = async () => {
    try {
      // 수정 화면으로 이동
      navigation.navigate('EditProduct', { id: id });
    } catch (error) {
      console.error('장비 정보 업데이트 오류:', error);
      Alert.alert('오류', '장비 정보 업데이트에 실패했습니다.');
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '정상';
      case 1: return '수리중';
      case 2: return '폐기';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return '#28a745'; // 초록
      case 1: return '#ffc107'; // 노랑
      case 2: return '#dc3545'; // 빨강
      default: return '#6c757d'; // 회색
    }
  };

  // 이미지 슬라이더 구현
  const renderImageSlider = () => {
    // 기본적으로 이미지가 없으면 기본 이미지 표시
    const images: DeviceImage[] = device?.images?.length > 0 
      ? device.images 
      : device?.image_url 
        ? [{ url: device.image_url, id: 0 }] 
        : [{ url: null, id: 0 }];

    // 이미지 URL 로깅 (디버깅용)
    if (__DEV__ && images.length > 0) {
      images.forEach((image: DeviceImage, index: number) => {
        console.log(`이미지 ${index+1} URL:`, image.url);
      });
    }

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
          {images.map((image: DeviceImage, index: number) => (
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
        {images.length > 1 && (
          <View style={styles.indicatorContainer}>
            {images.map((_: any, index: number) => (
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
        {images.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <TouchableOpacity
                style={[styles.sliderButton, styles.sliderButtonLeft]}
                onPress={() => scrollToImage(currentImageIndex - 1)}
              >
                <Icon name="chevron-left" size={24} color="white" />
              </TouchableOpacity>
            )}
            
            {currentImageIndex < images.length - 1 && (
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
        {images.length > 1 && (
          <View style={styles.imageCountContainer}>
            <Text style={styles.imageCountText}>
              {currentImageIndex + 1} / {images.length}
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
          
          {selectedImage.description && (
            <View style={styles.imageDescriptionContainer}>
              <Text style={styles.imageDescriptionText}>
                {selectedImage.description}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  // 스펙 항목 렌더링
  const renderSpecItem = (label: string, value: string) => (
    <View style={styles.specItem}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value || '정보 없음'}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>장비 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !device) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || '장비 정보를 찾을 수 없습니다.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeviceDetail}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
            tintColor="#007bff"
            title="새로고침 중..."
            titleColor="#6c757d"
          />
        }
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderImageSlider()}
        
        <View style={styles.contentContainer}>
          {/* 장비 기본 정보 */}
          <View style={styles.headerContainer}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(device.status) }]}>
              <Text style={styles.statusText}>{getStatusText(device.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.deviceModel}>
            {device.manufacturer?.name} {device.model}
          </Text>
          
          <View style={styles.divider} />
          
          {/* 장비 스펙 */}
          <Text style={styles.sectionTitle}>장비 정보</Text>
          
          <View style={styles.specContainer}>
            {renderSpecItem('장비 유형', device.deviceType?.name)}
            {renderSpecItem('진료과', device.department?.name)}
            {renderSpecItem('제조사', device.manufacturer?.name)}
            {renderSpecItem('모델명', device.model)}
            {renderSpecItem('구입일', device.purchase_date)}
            {renderSpecItem('일련번호', device.serial_number)}
            {renderSpecItem('위치', device.location)}
          </View>
          
          <View style={styles.divider} />
          
          {/* 장비 설명 */}
          <Text style={styles.sectionTitle}>설명</Text>
          <Text style={styles.description}>
            {device.description || '장비에 대한 설명이 없습니다.'}
          </Text>
          
          <View style={styles.divider} />
          
          {/* 장비 관리 정보 */}
          <Text style={styles.sectionTitle}>관리 정보</Text>
          <View style={styles.specContainer}>
            {renderSpecItem('마지막 점검일', device.last_checked_date)}
            {renderSpecItem('다음 점검일', device.next_check_date)}
            {renderSpecItem('관리자', device.manager)}
          </View>
          
          {/* 하단 여백 */}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
      
      {/* 전체 화면 이미지 뷰어 */}
      {renderFullScreenImageViewer()}
      
      {/* 플로팅 버튼 */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={updateDeviceInfo}
        >
          <AntDesign name="edit" size={24} color="white" />
          <Text style={styles.floatingButtonText}>장비 수정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  imageSliderContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#000', // 배경색을 검정으로 변경하여 이미지 경계를 숨김
    position: 'relative',
    overflow: 'hidden', // 이미지가 컨테이너를 벗어나지 않도록 함
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden', // 이미지가 컨테이너를 벗어나지 않도록 함
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
    resizeMode: 'cover', // contain에서 cover로 변경
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 10,
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
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  floatingButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  // 이미지 뷰어 관련 스타일
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
    resizeMode: 'contain', // 전체 화면에서는 이미지를 확대해서 보기 위해 contain 사용
  },
  imageDescriptionContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
  },
  imageDescriptionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ProductDetailScreen;
