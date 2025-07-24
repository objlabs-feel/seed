import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const DEFAULT_IMAGE = require('../../assets/default.jpg');

interface AuctionItemCardProps {
  thumbnail: string;
  equipmentType: string;
  auction_code: string;
  remainingTime: string;
  area: string;
  status?: number;
  onPress: () => void;
}

const AuctionItemCard: React.FC<AuctionItemCardProps> = ({
  thumbnail,
  equipmentType,
  auction_code,
  remainingTime,
  area,
  status = 0,
  onPress,
}) => {
  const getFormattedTime = () => {
    if (remainingTime) {
      console.log('remainingTime', remainingTime);
      const timeout = new Date(remainingTime);
      const now = new Date();
      const diff = timeout.getTime() - now.getTime();
      
      if (diff <= 0) return '만료됨';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days}일 ${hours}시간`;
      } else if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
      } else if (minutes > 0) {
        return `${minutes}분`;
      } else if (seconds > 0) {
        return '1분 미만';
      }
    }
    return remainingTime || '시간 정보 없음';
  };

  const getStatusStyle = () => {
    switch (status) {
      case 0: return styles.statusPending;
      case 1: return styles.statusActive;
      case 2: return styles.statusCompleted;      
      default: return {};
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={thumbnail ? { 
            uri: thumbnail,
            cache: 'reload',
            headers: {
              Pragma: 'no-cache'
            }
          } : DEFAULT_IMAGE} 
          style={styles.image}
          resizeMode="cover"
          defaultSource={DEFAULT_IMAGE}
          onError={(e) => {
            console.error('Image loading error:', e.nativeEvent.error);
          }}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.type}>
          {equipmentType || '장비 유형 없음'} | {auction_code}
        </Text>
        <Text style={[styles.time, getStatusStyle()]}>
          {area || '지역 정보 없음'} | {getFormattedTime()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  imageContainer: {
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 12,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  statusPending: {
    color: '#ffc107',
  },
  statusActive: {
    color: '#28a745',
  },
  statusCompleted: {
    color: '#6c757d',
  },
});

export default AuctionItemCard;