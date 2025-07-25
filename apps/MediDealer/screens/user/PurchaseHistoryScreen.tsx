import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 구매 상품 상태 정의
enum PurchaseStatus {
  ALL = '전체',
  BIDDING = '입찰중',
  SUCCESSFUL = '낙찰',
  PROGRESS = '진행중',
  COMPLETED = '거래완료'
}

// 구매 상품 타입 정의
interface PurchaseItem {
  id: number;
  title: string;
  price: number;
  bid_price: number;
  status: string;
  image_url?: string;
  created_at: string;
  seller?: string;
  end_date?: string;
}

const PurchaseHistoryScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PurchaseStatus>(PurchaseStatus.ALL);

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  useEffect(() => {
    // 상태에 따라 아이템 필터링
    if (selectedStatus === PurchaseStatus.ALL) {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.status === selectedStatus));
    }
  }, [selectedStatus, items]);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 임시 데이터로 대체
      setTimeout(() => {
        const mockData: PurchaseItem[] = [
          {
            id: 1,
            title: 'CT 스캐너 소형',
            price: 25000000,
            bid_price: 22500000,
            status: PurchaseStatus.BIDDING,
            created_at: '2024-04-03T09:30:00Z',
            seller: '서울대학교병원',
            end_date: '2024-04-10T23:59:59Z',
            image_url: 'https://via.placeholder.com/100'
          },
          {
            id: 2,
            title: '초음파 진단기기',
            price: 3800000,
            bid_price: 3600000,
            status: PurchaseStatus.SUCCESSFUL,
            created_at: '2024-03-28T14:25:00Z',
            seller: '연세의료원',
            image_url: 'https://via.placeholder.com/100'
          },
          {
            id: 3,
            title: '혈액분석기',
            price: 1200000,
            bid_price: 1080000,
            status: PurchaseStatus.PROGRESS,
            created_at: '2024-03-20T11:15:00Z',
            seller: '삼성서울병원',
            image_url: 'https://via.placeholder.com/100'
          },
          {
            id: 4,
            title: '환자 모니터링 시스템',
            price: 5500000,
            bid_price: 5200000,
            status: PurchaseStatus.COMPLETED,
            created_at: '2024-02-15T16:00:00Z',
            seller: '가천대 길병원',
            image_url: 'https://via.placeholder.com/100'
          },
          {
            id: 5,
            title: '의료용 침대',
            price: 4200000,
            bid_price: 3800000,
            status: PurchaseStatus.COMPLETED,
            created_at: '2024-01-25T13:40:00Z',
            seller: '세브란스병원',
            image_url: 'https://via.placeholder.com/100'
          }
        ];
        
        setItems(mockData);
        setFilteredItems(mockData);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('구매 이력 조회 중 오류 발생:', err);
      setError('구매 이력을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case PurchaseStatus.BIDDING:
        return styles.biddingBadge;
      case PurchaseStatus.SUCCESSFUL:
        return styles.successfulBadge;
      case PurchaseStatus.PROGRESS:
        return styles.progressBadge;
      case PurchaseStatus.COMPLETED:
        return styles.completedBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const renderItem = ({ item }: { item: PurchaseItem }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('AuctionDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.itemContent}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>판매가: {formatPrice(item.price)}</Text>
            <Text style={styles.bidPrice}>입찰가: {formatPrice(item.bid_price)}</Text>
          </View>
          <View style={styles.itemMeta}>
            <Text style={styles.itemDate}>등록일: {formatDate(item.created_at)}</Text>
            <Text style={styles.sellerName} numberOfLines={1}>판매자: {item.seller}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      {Object.values(PurchaseStatus).map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            selectedStatus === status && styles.filterButtonActive
          ]}
          onPress={() => setSelectedStatus(status as PurchaseStatus)}
        >
          <Text style={[
            styles.filterButtonText,
            selectedStatus === status && styles.filterButtonTextActive
          ]}>
            {status}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>구매 이력을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPurchaseHistory}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>구매 이력</Text>
      </View>
      
      {renderStatusFilter()}
      
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedStatus === PurchaseStatus.ALL 
              ? '등록된 구매 이력이 없습니다.' 
              : `${selectedStatus} 상태인 상품이 없습니다.`}
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('AuctionSearch' as never)}
          >
            <Text style={styles.emptyButtonText}>상품 구매하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f1f3f5',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 12,
    color: '#adb5bd',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  priceContainer: {
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#6c757d',
    textDecorationLine: 'line-through',
  },
  bidPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  sellerName: {
    fontSize: 12,
    color: '#6c757d',
    maxWidth: 120,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  biddingBadge: {
    backgroundColor: '#ffc107',
  },
  successfulBadge: {
    backgroundColor: '#28a745',
  },
  progressBadge: {
    backgroundColor: '#17a2b8',
  },
  completedBadge: {
    backgroundColor: '#007bff',
  },
  defaultBadge: {
    backgroundColor: '#6c757d',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PurchaseHistoryScreen;
