import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import AuctionItemCard from '../components/auction/AuctionItemCard';
import { searchAuction } from '../services/medidealer/api';
import { AuctionItem } from '@repo/shared/models';

const AuctionSearchScreen = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AuctionItem[]>([]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await searchAuction(searchQuery);
      console.log('API Response:', response);  // 응답 데이터 확인
      
      if (response) {
        setResults(response);
        console.log('Set Results:', response);  // 상태 업데이트 확인
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: AuctionItem }) => {
    console.log('Rendering item:', item);  // 각 아이템 렌더링 확인
    
    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => navigation.navigate('AuctionDetail', { id: item.id })}
      >
        <AuctionItemCard
          thumbnail={item.medical_device?.images?.[0]?.url || ''}
          equipmentType={item.medical_device?.deviceType?.name || ''}
          auction_code={item.auction_code || ''}
          remainingTime={item.start_timestamp}
          area={item.medical_device?.company?.area || ''}
          onPress={() => navigation.navigate('AuctionDetail', { id: item.id })}
        />
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="의료장비를 검색하세요"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
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
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default AuctionSearchScreen; 