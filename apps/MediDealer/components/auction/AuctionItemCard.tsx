import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const DEFAULT_IMAGE = require('../../assets/default.jpg');  // 기본 이미지 추가

interface AuctionItemCardProps {
  thumbnail: string;
  equipmentType: string;
  auction_code: string;
  remainingTime: string;
  area: string;
  onPress: () => void;
}

const AuctionItemCard: React.FC<AuctionItemCardProps> = ({
  thumbnail,
  equipmentType,
  auction_code,
  remainingTime,
  area,
  onPress
}) => {
  // remainingTime을 문자열로 변환
  const formattedTime = typeof remainingTime === 'object' 
    ? JSON.stringify(remainingTime) 
    : remainingTime;

  console.log('thumbnail:', thumbnail);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={thumbnail ? { 
            uri: thumbnail,
            // 캐시 정책 추가
            cache: 'reload',
            // 헤더 추가
            headers: {
              Pragma: 'no-cache'
            }
          } : DEFAULT_IMAGE} 
          style={styles.image}
          resizeMode="cover"
          defaultSource={DEFAULT_IMAGE}
          // 에러 핸들링 추가
          onError={(e) => {
            console.error('Image loading error:', e.nativeEvent.error);
          }}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.type}>{equipmentType || '장비 유형 없음'} | {auction_code || '경매 고유번호 없음'}</Text>
        <Text style={styles.time}>{area || '지역 정보 없음'} | {formattedTime || '시간 정보 없음'}</Text>
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
});

export default AuctionItemCard; 