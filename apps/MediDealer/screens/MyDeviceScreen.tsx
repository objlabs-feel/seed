import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, SafeAreaView, Button, Modal, ScrollView, Alert, Platform, Animated } from 'react-native';
import { useNavigation, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getMyDevices, getConstants } from '../services/medidealer/api';
import { IMedicalDevice } from '@repo/shared';
import { processImageUrl, createImageSource } from '../utils/imageHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// MyDevice 인터페이스를 IMedicalDevice 기반으로 정의
interface MyDevice extends IMedicalDevice {
  // 필요한 추가 필드가 있으면 여기에 정의
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FilterOption {
  id: number;
  name: string;
}

// 기본 이미지 추가
const DEFAULT_IMAGE = require('../assets/default.jpg');

// 디버깅 정보 컴포넌트 (개발 중에만 사용, 프로덕션에서는 제거)
const DebugInfo = ({ item }: { item: any }) => {
  if (!__DEV__) return null; // 개발 모드에서만 표시
  
  return (
    <View style={styles.debugContainer}>
      <Text 
        style={styles.debugText} 
        numberOfLines={2} 
        ellipsizeMode="middle"
      >
        이미지 URL: {item.image_url || '없음'}
      </Text>
    </View>
  );
};

// 이미지 로딩 컴포넌트
const DeviceImage = ({ imageUrl }: { imageUrl?: string }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false); // 기본값을 false로 변경
  const [isError, setIsError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [processedUrl, setProcessedUrl] = useState<string | undefined>(undefined);
  // 이미지 소스 객체 메모이제이션
  const [imageSource, setImageSource] = useState<any>(undefined);
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 이미지 URL 처리 (URL이 변경될 때만 실행)
  useEffect(() => {
    if (imageUrl) {
      // 이미지 URL 처리
      const processed = processImageUrl(imageUrl);
      
      setProcessedUrl(processed);
      
      // 이미지 소스 객체 생성 및 저장 (한 번만 생성)
      setImageSource(createImageSource(processed));
      
      setIsLoading(true); // 여기서만 true로 설정
      setIsError(false);
      // 이미지가 로드되기 전에 투명도 리셋
      fadeAnim.setValue(0);
    } else {
      setProcessedUrl(undefined);
      setImageSource(undefined);
      setIsLoading(false); // URL이 없으면 로딩 상태를 false로 설정
    }
  }, [imageUrl, fadeAnim]);

  // 이미지 로드 완료 시 페이드인 효과
  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // 5번까지만 재시도
  const handleRetry = useCallback(() => {
    if (retryCount < 5) {
      console.log('DeviceImage - 이미지 로딩 재시도:', retryCount + 1);
      setRetryCount(prev => prev + 1);
      setIsError(false);
      setIsLoading(true);
      fadeAnim.setValue(0);
      
      // 재시도 시 이미지 소스 객체 재생성
      if (processedUrl) {
        setImageSource(createImageSource(processedUrl));
      }
    }
  }, [retryCount, processedUrl, fadeAnim]);

  // 이미지가 있을 때 실행
  return (
    <View style={styles.deviceImageContainer}>
      {isLoading && processedUrl && (
        <View style={styles.imageLoadingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
        </View>
      )}
      
      {!isError && processedUrl ? (
        <Animated.Image 
          source={imageSource}
          style={[
            styles.deviceImage,
            { opacity: fadeAnim }
          ]}
          resizeMode="cover"
          defaultSource={DEFAULT_IMAGE}
          onLoadStart={() => processedUrl && setIsLoading(true)}
          onLoadEnd={handleLoadEnd}
          onError={(e) => {
            console.error('이미지 로딩 오류:', e.nativeEvent.error);
            setIsLoading(false);
            setIsError(true);
          }}
        />
      ) : (
        // 기본 이미지 (URL이 없거나 오류 발생 시)
        <Image 
          source={DEFAULT_IMAGE} 
          style={styles.deviceImage} 
          resizeMode="cover"
          // 기본 이미지에는 로딩 상태 관리 없음
        />
      )}
      
      {processedUrl && isError && retryCount < 5 && (
        <TouchableOpacity 
          style={styles.retryButtonContainer}
          onPress={handleRetry}
        >
          <Text style={styles.retryText}>새로고침</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const MyDeviceScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const [devices, setDevices] = useState<IMedicalDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터링 관련 상태
  const [deviceTypes, setDeviceTypes] = useState<FilterOption[]>([]);
  const [departments, setDepartments] = useState<FilterOption[]>([]);
  const [manufacturers, setManufacturers] = useState<FilterOption[]>([]);
  
  // 선택된 필터
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState<number | undefined>(undefined);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<number | undefined>(undefined);
  
  // 필터 모달 상태
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // 페이지네이션 관련 상태
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // 마지막 데이터 업데이트 시간
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  // 수동 새로고침 요청 여부
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
  // FlatList 참조 저장
  const flatListRef = useRef<FlatList<IMedicalDevice>>(null);
  // 마지막 스크롤 위치 저장
  const scrollPositionRef = useRef<number>(0);

  // 데이터 업데이트가 필요한지 확인하는 함수
  const shouldUpdateData = async (): Promise<boolean> => {
    try {
      // 마지막 업데이트로부터 5분(300000ms) 이상 지났거나, 수동 새로고침 요청이 있는 경우 업데이트
      const currentTime = Date.now();
      const timeElapsed = currentTime - lastUpdateTime;
      
      if (needsRefresh) {
        // 수동 새로고침 요청 플래그 초기화
        setNeedsRefresh(false);
        return true;
      }
      
      // 처음 로드하는 경우 (lastUpdateTime이 0)
      if (lastUpdateTime === 0) {
        return true;
      }

      // 마지막 업데이트로부터 5분 이상 지난 경우
      if (timeElapsed > 300000) {
        return true;
      }

      // AsyncStorage에서 강제 새로고침 플래그 확인
      const forceRefresh = await AsyncStorage.getItem('myDevices_forceRefresh');
      if (forceRefresh === 'true') {
        await AsyncStorage.removeItem('myDevices_forceRefresh');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('업데이트 확인 오류:', error);
      // 오류 발생 시 안전하게 false 반환
      return false;
    }
  };

  // useFocusEffect 수정 - 필요한 경우에만 데이터 로드
  useFocusEffect(
    useCallback(() => {
      const checkAndUpdate = async () => {
        const needsUpdate = await shouldUpdateData();
        
        if (needsUpdate) {
          fetchConstants();
          fetchMyDevices();
        } else {
          // 데이터 업데이트가 필요 없으면 로딩 상태 해제
          setLoading(false);
          
          // 스크롤 위치 복원 (약간의 지연 적용)
          if (scrollPositionRef.current > 0 && flatListRef.current) {
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToOffset({
                  offset: scrollPositionRef.current,
                  animated: false
                });
                console.log('스크롤 위치 복원:', scrollPositionRef.current);
              }
            }, 100); // 100ms 후 위치 복원 (렌더링 후)
          }
        }
      };
      
      checkAndUpdate();
      
      return () => {
        // 화면에서 나갈 때 현재 스크롤 위치 저장
        if (scrollPositionRef.current > 0) {
          console.log('스크롤 위치 저장:', scrollPositionRef.current);
        }
      };
    }, [needsRefresh])
  );

  // 기존 useEffect 유지 (초기 로드)
  useEffect(() => {
    fetchConstants();
    fetchMyDevices();
  }, []);

  // 스크롤 이벤트 핸들러
  const handleScroll = (event: any) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  };

  // 강제 새로고침 요청
  const forceRefresh = () => {
    setNeedsRefresh(true);
    // 첫 페이지로 스크롤 위치 초기화 (의도적인 새로고침이므로)
    scrollPositionRef.current = 0;
    fetchMyDevices(1);
  };

  // 상수 데이터(필터 옵션) 가져오기
  const fetchConstants = async () => {
    try {
      const response = await getConstants();
      setDeviceTypes(response.deviceTypes || []);
      setDepartments(response.departments || []);
      setManufacturers(response.manufacturers || []);
    } catch (err) {
      console.error('상수 데이터 조회 오류:', err);
    }
  };

  const fetchMyDevices = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      }
      
      const response = await getMyDevices({
        deviceTypeId: selectedDeviceTypeId,
        departmentId: selectedDepartmentId,
        manufacturerId: selectedManufacturerId,
        page: page,
        limit: pagination.limit
      });
      
      // 응답 데이터 로깅 (개발용)
      if (__DEV__ && response.data && response.data.length > 0) {
        console.log('fetchMyDevices - 응답 데이터 샘플:', 
          JSON.stringify(response.data[0], null, 2).substring(0, 200) + '...'
        );
      }
      
      // 이미지 URL 수정 및 검사
      let processedData = response.data;
      if (processedData && processedData.length > 0) {
        // 이미지 URL 처리
        processedData = processedData.map((device: any) => {
          // images 배열이 있는 경우 처리
          if (device.images && device.images.length > 0) {
            // 첫 번째 이미지의 url을 image_url로 설정
            const firstImageUrl = device.images[0].url;
            if (__DEV__) {
              console.log(`장치 ${device.id} 이미지 처리: images 배열에서 URL 추출`);
            }
            
            // 이미지 URL 처리
            return {
              ...device,
              image_url: firstImageUrl, // URL 처리는 DeviceImage 컴포넌트에서 수행
            };
          } else if (device.image_url) {
            return device; // URL 처리는 DeviceImage 컴포넌트에서 수행
          }
          return device;
        });
      }
      
      if (isLoadMore && page > 1) {
        // 기존 데이터에 새 데이터 추가 (무한 스크롤)
        setDevices(prevDevices => [...prevDevices, ...(processedData || [])]);
      } else {
        // 첫 페이지 또는 새로고침일 경우 데이터 덮어쓰기
        setDevices(processedData || []);
      }
      
      setPagination(response.pagination || {
        page: page,
        limit: pagination.limit,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
      
      // 마지막 업데이트 시간 설정
      setLastUpdateTime(Date.now());
      
      setError(null);
    } catch (err) {
      console.error('내 의료기 조회 오류:', err);
      setError('의료기 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터 적용
  const applyFilters = () => {
    setFilterModalVisible(false);
    setPagination(prev => ({ ...prev, page: 1 })); // 필터 변경 시 첫 페이지로 돌아가기
    fetchMyDevices(1);
  };

  // 필터 초기화
  const resetFilters = () => {
    setSelectedDeviceTypeId(undefined);
    setSelectedDepartmentId(undefined);
    setSelectedManufacturerId(undefined);
  };

  // 페이지 변경
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMyDevices(newPage);
    }
  };

  // 다음 페이지 로드
  const loadNextPage = () => {
    if (pagination.hasNextPage && !loading) {
      fetchMyDevices(pagination.page + 1, true);
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

  // 아이템 키 추출기 메모이제이션
  const keyExtractor = useCallback((item: any) => String(item.id), []);

  // renderDevice 함수 메모이제이션
  const renderDevice = useCallback(({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.deviceItem}
        onPress={() => navigation.navigate('DeviceDetail', { id: item.id })}
      >
        <View style={styles.deviceImageWrapper}>
          <DeviceImage imageUrl={item.image_url} />
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <Text style={styles.deviceModel} numberOfLines={1} ellipsizeMode="tail">
            {item.manufacturer?.name} {item.model}
          </Text>
          <Text style={styles.deviceCategory} numberOfLines={1} ellipsizeMode="tail">
            {item.deviceType?.name} • {item.department?.name}
          </Text>
          <Text style={styles.devicePurchaseDate}>구입일: {item.purchase_date}</Text>
          
          {__DEV__ && <DebugInfo item={item} />}
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  // 빈 목록 컴포넌트 메모이제이션
  const EmptyListComponentMemo = useCallback(() => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyText}>등록된 의료기가 없습니다.</Text>
      <TouchableOpacity 
        style={styles.addDeviceButton}
        onPress={() => navigation.navigate('AddDevice')}
      >
        <Text style={styles.addDeviceButtonText}>의료기 등록하기</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  // FlatList 푸터 컴포넌트 메모이제이션
  const ListFooterComponentMemo = useCallback(() => {
    if (loading && devices.length > 0) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.loadingMoreText}>더 불러오는 중...</Text>
        </View>
      );
    } 
    
    if (pagination.hasNextPage) {
      return (
        <TouchableOpacity 
          style={styles.loadMoreButton}
          onPress={loadNextPage}
        >
          <Text style={styles.loadMoreButtonText}>더 보기</Text>
        </TouchableOpacity>
      );
    } 
    
    if (devices.length > 0) {
      return <Text style={styles.endOfListText}>모든 의료기를 불러왔습니다</Text>;
    }
    
    return null;
  }, [loading, devices.length, pagination.hasNextPage, loadNextPage]);

  // 필터 모달
  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>필터 선택</Text>
          
          <ScrollView style={styles.filterOptions}>
            <Text style={styles.filterSectionTitle}>장비 유형</Text>
            <View style={styles.filterOptionsList}>
              {deviceTypes.map(type => (
                <TouchableOpacity
                  key={`type-${type.id}`}
                  style={[
                    styles.filterOption,
                    selectedDeviceTypeId === type.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedDeviceTypeId(
                    selectedDeviceTypeId === type.id ? undefined : type.id
                  )}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedDeviceTypeId === type.id && styles.filterOptionTextSelected
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.filterSectionTitle}>부서</Text>
            <View style={styles.filterOptionsList}>
              {departments.map(dept => (
                <TouchableOpacity
                  key={`dept-${dept.id}`}
                  style={[
                    styles.filterOption,
                    selectedDepartmentId === dept.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedDepartmentId(
                    selectedDepartmentId === dept.id ? undefined : dept.id
                  )}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedDepartmentId === dept.id && styles.filterOptionTextSelected
                  ]}>
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.filterSectionTitle}>제조사</Text>
            <View style={styles.filterOptionsList}>
              {manufacturers.map(mfr => (
                <TouchableOpacity
                  key={`mfr-${mfr.id}`}
                  style={[
                    styles.filterOption,
                    selectedManufacturerId === mfr.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedManufacturerId(
                    selectedManufacturerId === mfr.id ? undefined : mfr.id
                  )}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedManufacturerId === mfr.id && styles.filterOptionTextSelected
                  ]}>
                    {mfr.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 필터 버튼 */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>
            필터 
            {(selectedDeviceTypeId || selectedDepartmentId || selectedManufacturerId) ? 
              ' (설정됨)' : ''}
          </Text>
        </TouchableOpacity>
        
        {/* 총 아이템 수 표시 */}
        {devices.length > 0 && (
          <Text style={styles.totalCountText}>
            총 {pagination.totalCount}개 중 {devices.length}개 표시 중
          </Text>
        )}
      </View>
      
      {loading && devices.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>의료기 목록을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchMyDevices(1)}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={devices}
          renderItem={renderDevice}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContainer, 
            devices.length === 0 ? styles.emptyListContentContainer : null
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={forceRefresh}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={EmptyListComponentMemo}
          ListFooterComponent={ListFooterComponentMemo}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.3}
          windowSize={5}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
      
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterBar: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterButton: {
    backgroundColor: '#f1f3f5',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
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
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 15,
  },
  addDeviceButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addDeviceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  deviceItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'flex-start',
  },
  deviceImageWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  deviceImageContainer: {
    width: 95,
    height: 95,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  deviceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageLoadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    zIndex: 1,
  },
  imageErrorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  retryButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#6c757d',
  },
  deviceInfo: {
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: 95,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 2,
  },
  deviceModel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 2,
  },
  deviceCategory: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 2,
  },
  devicePurchaseDate: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterOptions: {
    maxHeight: 400,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#343a40',
  },
  filterOptionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
  },
  filterOptionSelected: {
    backgroundColor: '#339af0',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#495057',
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#495057',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#339af0',
    paddingVertical: 12,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  // 페이지네이션 스타일
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  pageButton: {
    backgroundColor: '#339af0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  pageButtonDisabled: {
    backgroundColor: '#dee2e6',
  },
  pageButtonText: {
    color: 'white',
    fontSize: 14,
  },
  pageInfo: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#495057',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 5,
    fontSize: 14,
    color: '#6c757d',
  },
  totalCountText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
    textAlign: 'right',
  },
  loadMoreButton: {
    backgroundColor: '#f1f3f5',
    padding: 15,
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
  },
  loadMoreButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '500',
  },
  endOfListText: {
    textAlign: 'center',
    color: '#6c757d',
    padding: 20,
    fontSize: 14,
  },
  debugContainer: {
    marginTop: 5,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#dee2e6',
  },
  debugText: {
    fontSize: 10,
    color: '#6c757d',
    marginBottom: 0,
  },
});

export default MyDeviceScreen;
