import React, { useEffect, useState, useLayoutEffect } from 'react';
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
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { bidAuction, getAuctionDetail, getAuctionHistory } from '../services/medidealer/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DEFAULT_IMAGE = require('../assets/default.jpg'); // 기본 이미지 추가

interface AuctionDetailParams {
  id: string | number;
  // 다른 필요한 파라미터들 추가
}

interface AuctionDetailProps {
  navigation: StackNavigationProp<any>;
  route: RouteProp<{ params: AuctionDetailParams }, 'params'>;
}

// AuctionHistory 타입 정의
interface AuctionHistory {
  id: string | number;
  auction_item_id: string | number;
  user_id: string | number;
  value: number;
  created_at: string;
}

interface AuctionDetail {
  id: string | number;
  medical_device_id: string | number;
  auction_code: string;
  quantity: number;
  status: number;
  start_timestamp: string;
  expired_count: number;
  created_at: string;
  updated_at: string;
  medical_device: {
    id: string | number;
    company_id: number;
    department_id: number;
    device_type_id: number;
    manufacturer_id: number | null;
    manufacture_date: string | null;
    manufacture_year: number | null;
    images: string[];
    description: string | null;
    created_at: string;
    updated_at: string;
    department: {
      name: string;
    };
    deviceType: {
      name: string;
    };
    manufacturer: {
      name: string;
    } | null;
    company: {
      name: string;
    };
  };
  auction_item_history: AuctionHistory[];
}

const PreviewSection = ({ title, content }: { title: string, content: string }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionContent}>{content || '-'}</Text>
  </View>
);

const AuctionDetailScreen: React.FC<AuctionDetailProps> = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [auctionDetail, setAuctionDetail] = useState<AuctionDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { id } = route.params;
  const [highestBid, setHighestBid] = useState(0);
  const [auctionHistory, setAuctionHistory] = useState<AuctionHistory[]>([]);
  const [isBidModalVisible, setIsBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

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
    const fetchAuctionDetail = async () => {
      try {
        const data = await getAuctionDetail(id as string);
        console.log('Auction detail data:', data);  // 데이터 구조 확인
        setAuctionDetail(data);
        setAuctionHistory(data.auction_item_history);
        // updateHighestBid();
      } catch (error) {
        console.error('경매 상세 정보 로딩 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionDetail();
  }, [id]);

  useEffect(() => {
    updateHighestBid();
  }, [auctionHistory]);

  // 최고가 찾는 함수 추가
  const updateHighestBid = async () => {
    try {
      const history = auctionHistory;
      if (history && history.length > 0) {
        // 입찰 기록을 금액 기준으로 정렬하고 최고가 반환
        const highestBid = Math.max(...history.map(bid => bid.value));
        setHighestBid(highestBid);
      }
    } catch (error) {
      console.error('입찰 기록 조회 중 오류:', error);
    }
  };

  useLayoutEffect(() => {
    if (auctionDetail?.medical_device?.deviceType?.name) {
      navigation.setOptions({
        title: auctionDetail.medical_device.deviceType.name,
        headerBackTitle: '뒤로',
      });
    }
  }, [navigation, auctionDetail]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!auctionDetail?.medical_device) {
    return (
      <View style={styles.errorContainer}>
        <Text>경매 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const { medical_device } = auctionDetail;

  const isOwner = currentUserId === auctionDetail?.medical_device.company.owner_id;
//   const isOwner = true;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={[styles.scrollView, { marginBottom: 80 }]}>
        {/* 이미지 슬라이더 */}
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.imageSlider}
        >
          {medical_device.images && medical_device.images.length > 0 ? (
            medical_device.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image.url }}
                style={styles.sliderImage}
                resizeMode="cover"
              />
            ))
          ) : (
            <Image
              source={DEFAULT_IMAGE}
              style={styles.sliderImage}
              resizeMode="contain"
            />
          )}
        </ScrollView>

        {/* 이미지 인디케이터 */}
        <View style={styles.imageIndicator}>
          <Text style={styles.imageCount}>
            {medical_device.images?.length || 0}장의 사진
          </Text>
        </View>

        {/* 기본 정보 */}
        <View style={styles.infoContainer}>
          {/* 판매자 정보 */}
          <View style={styles.sellerInfo}>
            <Text style={styles.sectionTitle}>경매고유번호: {auctionDetail.auction_code} | 남은 경매시간: 00:00</Text>
            <Text style={styles.sellerTitle}>판매자 정보: {auctionDetail.medical_device.company.name} | {auctionDetail.medical_device.company.area}</Text>            
          </View>

          {/* 장비 정보 */}
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentTitle}>장비정보</Text>
            <Text style={styles.equipmentInfo}>
            장비유형: {medical_device.deviceType?.name || '장비명 없음'}
            </Text>
            <Text style={styles.equipmentInfo}>
            진료과: {medical_device.department?.name}
            </Text>
            <Text style={styles.equipmentInfo}>
            제조사: {medical_device.manufacturer?.name} | 제조연도: {medical_device.manufacture_year ? `${medical_device.manufacture_year}년` : '-'}
            </Text>
            <Text style={styles.equipmentInfo}>
            상세 설명: {medical_device.description || '-'}            
            </Text>
          </View>

          {/* 경매 정보 */}
          <View style={styles.auctionInfo}>
            <Text style={styles.auctionTitle}>경매 정보</Text>
            {isOwner && (
              <>                
                <PreviewSection 
                  title="현재 최고 입찰가" 
                  content={`${highestBid || 0}원`} 
                />
              </>
            )}
            <View style={styles.divider} />
            {/* 내 입찰기록 */}
            {!isOwner && (                
              <>
                <Text style={styles.sectionTitle}>내 입찰 기록</Text>
                {auctionHistory
                  .filter(bid => bid.user_id === currentUserId)
                  .map((bid, index) => (
                    <View key={index} style={styles.bidHistoryItem}>
                      <Text style={styles.bidAmount}>
                        {bid.value.toLocaleString()}원
                      </Text>
                      <Text style={styles.bidTime}>
                        {new Date(bid.created_at).toLocaleString()}
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
        </View>
      </ScrollView>

      {!isOwner && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.bidButton}
            onPress={() => setIsBidModalVisible(true)}
          >
            <Text style={styles.bidButtonText}>입찰하기</Text>
          </TouchableOpacity>
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
                // 낙찰 처리 로직
                console.log('낙찰 처리');
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
                onPress={() => {
                  // 입찰 처리 로직
                  console.log('입찰가격:', bidAmount);
                  if (parseInt(bidAmount) > 0) {
                    bidAuction(id, parseInt(bidAmount));
                    setIsBidModalVisible(false);
                    setBidAmount('');
                  } else {
                    Alert.alert('입찰 금액을 입력해주세요.');
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
  imageSlider: {
    height: width,
  },
  sliderImage: {
    width: width,
    height: width,
  },
  imageIndicator: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  imageCount: {
    color: '#fff',
    fontSize: 12,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  sellerInfo: {
    marginBottom: 0,
  },
  sellerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  auctionInfo: {
    marginBottom: 10,
  },
  auctionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  equipmentInfo: {
    marginBottom: 10,
  },
  equipmentTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
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
    borderBottomColor: '#eee',
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bidTime: {
    fontSize: 14,
    color: '#666',
  },
  noBidsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default AuctionDetailScreen; 