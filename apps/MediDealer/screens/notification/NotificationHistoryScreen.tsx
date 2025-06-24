import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  RefreshControl,
  Alert 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getNotificationList, setReadAllNotification } from '../../services/medidealer/api';
import { INotificationMessage } from '@repo/shared';

const NotificationHistoryScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<INotificationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotificationList();
      setNotifications(data);
    } catch (error) {
      console.error('알림 목록 조회 오류:', error);
      setError('알림 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 화면 진입 시 알림 목록 조회
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  // 알림 헤더 설정
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign name="bells" size={20} color="#333" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>알림 목록</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.headerButtonText}>모두 읽음</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 새로고침 처리
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // 전체 읽음 처리
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await setReadAllNotification();
      Alert.alert('알림', '모든 알림을 읽음 처리했습니다.');
      fetchNotifications();
    } catch (error) {
      console.error('전체 읽음 처리 오류:', error);
      Alert.alert('오류', '읽음 처리 중 오류가 발생했습니다.');
    }
  }, [fetchNotifications]);

  // 날짜 형식 변환
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  // 각 알림 항목 렌더링
  const renderNotificationItem = ({ item }: { item: INotificationMessage }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        item.is_read ? styles.readNotification : styles.unreadNotification
      ]}
      onPress={() => {
        // 알림 상세 내용이나 관련 화면으로 이동하는 로직 추가 가능
        Alert.alert(item.title, item.content);
      }}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {!item.is_read && <View style={styles.unreadIndicator} />}
      </View>
      <Text style={styles.notificationContent} numberOfLines={2}>{item.content}</Text>
      <Text style={styles.notificationDate}>{formatDate(item.created_at)}</Text>
    </TouchableOpacity>
  );

  // 빈 목록 표시
  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <AntDesign name="inbox" size={50} color="#ccc" />
        <Text style={styles.emptyText}>알림이 없습니다</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007bff']}
              tintColor="#007bff"
            />
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
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  readNotification: {
    backgroundColor: '#f8f9fa',
  },
  unreadNotification: {
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
    marginLeft: 8,
  },
  notificationContent: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#adb5bd',
  },
});

export default NotificationHistoryScreen;
