import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  Dimensions 
} from 'react-native';
import { locations, departments, deviceTypes } from '../../constants/data';

const { width } = Dimensions.get('window');

const PreviewSection = ({ title, content }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionContent}>{content}</Text>
  </View>
);

const Step3Screen = ({ formData }) => {
  const location = locations.find(item => item.id === formData.location)?.name || '';
  const department = departments.find(item => item.id === formData.department)?.name || '';
  const equipmentType = deviceTypes.find(item => item.id === formData.equipmentType)?.name || '';

  return (
    <ScrollView style={styles.container}>
      {/* 이미지 슬라이더 */}
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        style={styles.imageSlider}
      >
        {formData.images?.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image.uri }}
            style={styles.sliderImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* 이미지 인디케이터 */}
      <View style={styles.imageIndicator}>
        <Text style={styles.imageCount}>
          {formData.images?.length || 0}장의 사진
        </Text>
      </View>

      {/* 기본 정보 */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{equipmentType} 장비</Text>
        
        <View style={styles.divider} />

        {/* 판매자 정보 */}
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerTitle}>판매자 정보</Text>
          <PreviewSection title="병원명" content={formData.hospitalName} />
          <PreviewSection title="지역" content={location} />
          <PreviewSection title="진료과" content={department} />
          <PreviewSection title="담당자" content={formData.name} />
          <PreviewSection title="연락처" content={formData.phone} />
        </View>

        <View style={styles.divider} />

        {/* 장비 정보 */}
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentTitle}>장비 정보</Text>
          <PreviewSection title="장비 유형" content={equipmentType} />
          <PreviewSection title="제조년" content={formData.manufacturingYear} />
          <PreviewSection title="수량" content={formData.quantity} />
          <PreviewSection 
            title="양도 가능일" 
            content={formData.transferDate ? 
              formData.transferDate.toLocaleDateString() : ''} 
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginVertical: 20,
  },
  sellerInfo: {
    marginBottom: 20,
  },
  sellerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  equipmentInfo: {
    marginBottom: 20,
  },
  equipmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
});

export default Step3Screen; 