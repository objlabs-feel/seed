import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import AuctionItemCard from '../components/auction/AuctionItemCard';
import { searchAuction } from '../services/medidealer/api';
import { IAuctionItem } from '@repo/shared';
import { useNavigation } from '@react-navigation/native';
import { deviceTypes, locations, departments, SelectionItem, initConstants } from '../constants/data';

const ITEMS_PER_PAGE = 10;

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

const AuctionSearchScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [searchResults, setSearchResults] = useState<IAuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDeviceTypes, setSelectedDeviceTypes] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const handleSearch = async (page: number = 1) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await searchAuction({
        deviceTypes: selectedDeviceTypes,
        areas: selectedAreas,
        departments: selectedDepartments,
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (response) {
        if (page === 1) {
          setSearchResults(response.items);
        } else {
          setSearchResults(prev => [...prev, ...response.items]);
        }
        setTotalItems(response.total);
        setHasMore(page < response.totalPages);
        setCurrentPage(page);
      } else {
        setSearchResults([]);
        setTotalItems(0);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalItems(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 초기 검색 실행
  useEffect(() => {
    handleSearch(1);
  }, []);

  // 필터 변경 시 검색 결과 초기화
  useEffect(() => {
    setCurrentPage(1);
    handleSearch(1);
  }, [selectedDeviceTypes, selectedAreas, selectedDepartments]);

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedDeviceTypes([]);
    setSelectedAreas([]);
    setSelectedDepartments([]);
  };

  // 필터 적용
  const handleApplyFilters = () => {
    setShowFilterModal(false);
  };

  // 필터 토글 함수들
  const handleFilterToggle = (type: string, isSelected: boolean, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (isSelected) {
      setter(prev => prev.filter(t => t !== type));
    } else {
      setter(prev => [...prev, type]);
    }
  };

  const renderItem = ({ item }: { item: IAuctionItem }) => (
    <View style={styles.listItem}>
      <AuctionItemCard
        thumbnail={item.medical_device?.images?.[0]?.url || ''}
        equipmentType={item.medical_device?.deviceType?.name || ''}
        auction_code={item.auction_code || ''}
        remainingTime={item.start_timestamp}
        area={item.medical_device?.company?.area || ''}
        status={item.status}
        onPress={() => navigation.navigate('AuctionDetail', { id: item.id })}
      />
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      handleSearch(currentPage + 1);
    }
  };

  const totalSelectedFilters = selectedDeviceTypes.length + selectedAreas.length + selectedDepartments.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.resultCount}>
          검색 결과 {totalItems}건
        </Text>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            totalSelectedFilters > 0 && styles.filterButtonActive
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={[
            styles.filterButtonText,
            totalSelectedFilters > 0 && styles.filterButtonTextActive
          ]}>
            필터 {totalSelectedFilters > 0 && `(${totalSelectedFilters})`}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>필터</Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>초기화</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptions}>
              <Text style={styles.filterSectionTitle}>장비 유형</Text>
              <View style={styles.filterOptionsList}>
                {deviceTypes.length === 0 ? (
                  <Text style={styles.emptyText}>장비 유형 정보를 불러오는 중입니다...</Text>
                ) : (
                  deviceTypes.map(type => {
                    const isSelected = selectedDeviceTypes.includes(type.name);
                    return (
                      <TouchableOpacity
                        key={`type-${type.id}`}
                        style={[
                          styles.filterOption,
                          isSelected && styles.filterOptionSelected
                        ]}
                        onPress={() => handleFilterToggle(type.name, isSelected, setSelectedDeviceTypes)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          isSelected && styles.filterOptionTextSelected
                        ]}>
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <Text style={styles.filterSectionTitle}>지역</Text>
              <View style={styles.filterOptionsList}>
                {locations.map(location => {
                  const isSelected = selectedAreas.includes(location.name);
                  return (
                    <TouchableOpacity
                      key={`area-${location.id}`}
                      style={[
                        styles.filterOption,
                        isSelected && styles.filterOptionSelected
                      ]}
                      onPress={() => handleFilterToggle(location.name, isSelected, setSelectedAreas)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        isSelected && styles.filterOptionTextSelected
                      ]}>
                        {location.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.filterSectionTitle}>진료과</Text>
              <View style={styles.filterOptionsList}>
                {departments.map(dept => {
                  const isSelected = selectedDepartments.includes(dept.name);
                  return (
                    <TouchableOpacity
                      key={`dept-${dept.id}`}
                      style={[
                        styles.filterOption,
                        isSelected && styles.filterOptionSelected
                      ]}
                      onPress={() => handleFilterToggle(dept.name, isSelected, setSelectedDepartments)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        isSelected && styles.filterOptionTextSelected
                      ]}>
                        {dept.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.resetButton, styles.closeButton]} 
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 14,
    color: '#666666',
  },
  listContainer: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  filterOptions: {
    maxHeight: 400,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
  },
  filterOptionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#333333',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  listItem: {
    padding: 16,
  },
});

export default AuctionSearchScreen; 