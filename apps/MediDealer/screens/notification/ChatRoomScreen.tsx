import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView as SafeAreaViewContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getNotificationByGroupId } from '../../services/medidealer/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

// 타입 정의
interface ChatRoomParams {
  groupId: string;
}

interface ChatRoomProps {
  navigation: StackNavigationProp<any>;
  route: RouteProp<{ params: ChatRoomParams }, 'params'>;
}

// 알림 메시지 타입
interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  data?: {
    type?: string;
    auction_id?: string;
    [key: string]: any;
  };
  created_at: string;
  read_at?: string;
  user_id?: string;
}

// 채팅 메시지 컴포넌트
const ChatMessage = ({ message, isOwn }: { message: NotificationMessage; isOwn: boolean }) => {
  const messageTime = new Date(message.created_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
          {message.body}
        </Text>
        <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
          {messageTime}
        </Text>
      </View>
    </View>
  );
};

const ChatRoomScreen: React.FC<ChatRoomProps> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;
  
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const getCurrentUserId = async () => {
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

    getCurrentUserId();
  }, []);

  // group_id로 알림 목록 가져오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getNotificationByGroupId(groupId);
        console.log('Chat room messages:', response);
        
        if (response.success && response.data) {
          // 알림을 시간순으로 정렬 (최신 메시지가 아래에 오도록)
          const sortedMessages = response.data.sort((a: NotificationMessage, b: NotificationMessage) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          setMessages(sortedMessages);
        } else {
          setError('메시지를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('채팅방 메시지 로딩 중 오류:', error);
        setError('메시지를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId) {
      fetchMessages();
    }
  }, [groupId]);

  // 알림 메시지는 모두 상대방이 보낸 것으로 처리
  const isOwnMessage = (message: NotificationMessage) => {
    return false; // 모든 메시지를 상대방이 보낸 것으로 표시
  };

  // 메시지 렌더링
  const renderMessage = ({ item }: { item: NotificationMessage }) => {
    return <ChatMessage message={item} isOwn={isOwnMessage(item)} />;
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>채팅방</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>채팅방</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              // 다시 로드
            }}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>채팅방</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 메시지가 없을 때 */}
      {messages.length === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <Icon name="chat-bubble-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>아직 메시지가 없습니다.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#007bff',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
    textAlign: 'left',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
});

export default ChatRoomScreen;
