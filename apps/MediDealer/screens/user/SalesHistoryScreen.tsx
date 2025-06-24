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
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 판매 상품 상태 정의
enum SaleStatus {
  ALL = '전체',
  SELLING = '판매중',
  COMPLETED = '판매완료',
  CANCELED = '취소됨'
}

// 판매 상품 타입 정의
interface SaleItem {
  id: number;
  title: string;
  price: number;
  status: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  bid_count: number;
  deadline?: string;
}

const SalesHistoryScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SaleStatus>(SaleStatus.ALL);

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  useEffect(() => {
    // 상태에 따라 아이템 필터링
    if (selectedStatus === SaleStatus.ALL) {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.status === selectedStatus));
    }
  }, [selectedStatus, items]);

  const fetchSalesHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 임시 데이터로 대체
      setTimeout(() => {
        const mockData: SaleItem[] = [
          {
            id: 1,
            title: '초음파 진단기 GE Logiq P5',
            price: 1500000,
            status: SaleStatus.SELLING,
            created_at: '2024-04-01T10:30:00Z',
            updated_at: '2024-04-01T10:30:00Z',
            bid_count: 3,
            deadline: '2024-04-15T23:59:59Z',
            image_url: 'https://via.placeholder.com/100'
          },
          {
            id: 2,
            title: 'X-Ray 촬영장비 Philips',
            price: 3200000,
            status: SaleStatus.COMPLETED,
            created_at: '2024-03-15T09:20:00Z',
            updated_at: '2024-03-28T14:45:00Z',
            bid_count: 5,
            image_url: 'https://via.placeholder.com/100'
          },
          {
            id: 3,
            title: '혈압계 세트',
            price: 450000,
            status: SaleStatus.CANCELED,
            created_at: '2024-03-10T16:40:00Z',
            updated_at: '2024-03-12T11:30:00Z',
            bid_count: 0,
            image_url: 'https://via.placeholder.com/100'
          },
          {
            id: 4,
            title: '치과용 유닛체어',
            price: 2800000,
            status: SaleStatus.SELLING,
            created_at: '2024-04-02T08:15:00Z',
            updated_at: '2024-04-02T08:15:00Z',
            bid_count: 1,
            deadline: '2024-04-16T23:59:59Z',
            image_url: 'https://via.placeholder.com/100'
          },
          {
            id: 5,
            title: 'CT 스캐너 Siemens',
            price: 8500000,
            status: SaleStatus.COMPLETED,
            created_at: '2024-02-20T13:40:00Z',
            updated_at: '2024-03-05T09:10:00Z',
            bid_count: 8,
            image_url: 'https://via.placeholder.com/100'
          }
        ];
        
        setItems(mockData);
        setFilteredItems(mockData);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('판매 이력 조회 중 오류 발생:', err);
      setError('판매 이력을 불러오는데 실패했습니다.');
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
      case SaleStatus.SELLING:
        return styles.sellingBadge;
      case SaleStatus.COMPLETED:
        return styles.completedBadge;
      case SaleStatus.CANCELED:
        return styles.canceledBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const renderItem = ({ item }: { item: SaleItem }) => (
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
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemDate}>등록일: {formatDate(item.created_at)}</Text>
            <Text style={styles.itemBidCount}>입찰수: {item.bid_count}</Text>
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
      {Object.values(SaleStatus).map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            selectedStatus === status && styles.filterButtonActive
          ]}
          onPress={() => setSelectedStatus(status as SaleStatus)}
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
        <Text style={styles.loadingText}>판매 이력을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSalesHistory}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>판매 이력</Text>
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
            {selectedStatus === SaleStatus.ALL 
              ? '등록된 판매 이력이 없습니다.' 
              : `${selectedStatus} 상태인 상품이 없습니다.`}
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('AuctionRegistration' as never)}
          >
            <Text style={styles.emptyButtonText}>판매 등록하기</Text>
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
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
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
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  itemBidCount: {
    fontSize: 12,
    color: '#6c757d',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sellingBadge: {
    backgroundColor: '#28a745',
  },
  completedBadge: {
    backgroundColor: '#007bff',
  },
  canceledBadge: {
    backgroundColor: '#6c757d',
  },
  defaultBadge: {
    backgroundColor: '#ffc107',
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

export default SalesHistoryScreen;
