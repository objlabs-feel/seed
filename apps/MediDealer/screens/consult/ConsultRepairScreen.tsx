import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { launchImageLibrary } from 'react-native-image-picker';
import { getMyDevices } from '../../services/medidealer/api';

// 이미지 픽커 타입 정의
interface ImageItem {
  uri: string;
  type?: string;
  name?: string;
}

// 기본 이미지 추가
const DEFAULT_IMAGE = require('../../assets/default.jpg');

const ConsultRepairScreen = () => {
  const navigation = useNavigation();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceName, setDeviceName] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [contact, setContact] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [preferVisit, setPreferVisit] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyDevices();
  }, []);

  const fetchMyDevices = async () => {
    try {
      setLoading(true);
      const response = await getMyDevices();
      setDevices(response.data || []);
    } catch (error) {
      console.error('내 의료기기 목록 조회 오류:', error);
      Alert.alert('오류', '의료기기 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
    // 이미지 선택 옵션
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 1200,
      maxWidth: 1200,
      selectionLimit: 3, // 최대 3장
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('사용자가 이미지 선택을 취소했습니다');
      } else if (response.errorCode) {
        console.error('이미지 선택 오류:', response.errorMessage);
        Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
      } else if (response.assets && response.assets.length > 0) {
        // 기존 이미지 배열에 새 이미지 추가 (최대 3장까지만)
        const newImages = response.assets.map(asset => ({
          uri: asset.uri || '',
          type: asset.type,
          name: asset.fileName,
        }));
        
        setImages(prevImages => {
          const combined = [...prevImages, ...newImages];
          return combined.slice(0, 3); // 최대 3장까지만
        });
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleDeviceSelect = (id: string) => {
    setDeviceId(id === deviceId ? null : id);
    if (id !== deviceId) {
      const selectedDevice = devices.find(device => device.id === id);
      if (selectedDevice) {
        setDeviceName(selectedDevice.name + ' ' + (selectedDevice.model || ''));
      }
    } else {
      setDeviceName('');
    }
  };

  const renderDeviceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.deviceItem, deviceId === item.id && styles.selectedDeviceItem]}
      onPress={() => handleDeviceSelect(item.id)}
    >
      <View style={styles.deviceImageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.deviceImage}
            defaultSource={DEFAULT_IMAGE}
          />
        ) : (
          <Image
            source={DEFAULT_IMAGE}
            style={styles.deviceImage}
          />
        )}
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceModel}>{item.manufacturer?.name} {item.model}</Text>
      </View>
      {deviceId === item.id && (
        <View style={styles.checkmark}>
          <AntDesign name="check" size={20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  const submitConsultation = () => {
    if (!deviceId && !deviceName.trim()) {
      Alert.alert('알림', '의료기기를 선택하거나 직접 입력해주세요.');
      return;
    }

    if (!problemDescription.trim()) {
      Alert.alert('알림', '문제점을 자세히 설명해주세요.');
      return;
    }

    if (!contact.trim()) {
      Alert.alert('알림', '연락처를 입력해주세요.');
      return;
    }

    // 여기에 실제 데이터 전송 로직이 들어갈 예정
    Alert.alert(
      '상담 신청 완료',
      '수리 상담 신청이 완료되었습니다. 담당자가 빠른 시일 내에 연락드릴 예정입니다.',
      [{ text: '확인', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>의료기 수리 상담</Text>
            <Text style={styles.headerSubtitle}>
              보유하신 의료기기의 수리 및 유지보수에 관한 상담을 도와드립니다.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>내 의료기기 선택</Text>
            
            <Text style={styles.label}>등록된 의료기기 목록</Text>
            <FlatList
              data={devices}
              renderItem={renderDeviceItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.deviceList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>등록된 의료기기가 없습니다.</Text>
              }
            />

            <Text style={styles.orText}>또는</Text>

            <Text style={styles.label}>의료기기명 직접 입력</Text>
            <TextInput
              style={styles.input}
              value={deviceName}
              onChangeText={setDeviceName}
              placeholder="의료기기 이름 및 모델명"
              placeholderTextColor="#adb5bd"
            />

            <Text style={styles.sectionTitle}>문제 설명</Text>
            
            <Text style={styles.label}>어떤 문제가 있나요?</Text>
            <TextInput
              style={styles.textArea}
              value={problemDescription}
              onChangeText={setProblemDescription}
              placeholder="문제 증상을 최대한 자세히 설명해주세요"
              placeholderTextColor="#adb5bd"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Text style={styles.label}>사진 첨부 (선택, 최대 3장)</Text>
            <View style={styles.imageUploadSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <AntDesign name="closecircle" size={22} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 3 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
                    <AntDesign name="plus" size={28} color="#6c757d" />
                    <Text style={styles.addImageText}>사진 추가</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>긴급 수리 요청</Text>
              <Switch
                trackColor={{ false: '#ccc', true: '#4dabf7' }}
                thumbColor={isUrgent ? '#007bff' : '#f4f3f4'}
                onValueChange={setIsUrgent}
                value={isUrgent}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>방문 상담 희망</Text>
              <Switch
                trackColor={{ false: '#ccc', true: '#4dabf7' }}
                thumbColor={preferVisit ? '#007bff' : '#f4f3f4'}
                onValueChange={setPreferVisit}
                value={preferVisit}
              />
            </View>

            <Text style={styles.label}>연락처</Text>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              placeholder="연락 가능한 전화번호"
              placeholderTextColor="#adb5bd"
              keyboardType="phone-pad"
            />

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={submitConsultation}
            >
              <Text style={styles.submitButtonText}>상담 신청하기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoTitle}>
              <AntDesign name="infocirlce" size={16} color="#495057" />
              {' '}수리 상담 안내
            </Text>
            <Text style={styles.infoText}>
              • 상담 신청 후 1~2일 내로 전문 상담사가 연락드립니다.{'\n'}
              • 긴급 수리의 경우 당일 연락을 드립니다.{'\n'}
              • 방문 상담은 지역에 따라 일정이 조율됩니다.{'\n'}
              • 사진 첨부를 통해 더 정확한 진단이 가능합니다.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
    marginBottom: 16,
    height: 120,
  },
  deviceList: {
    paddingVertical: 10,
  },
  deviceItem: {
    width: 120,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedDeviceItem: {
    backgroundColor: '#e7f5ff',
    borderColor: '#339af0',
    borderWidth: 2,
  },
  deviceImageContainer: {
    width: 100,
    height: 80,
    marginBottom: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  deviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  deviceModel: {
    fontSize: 12,
    color: '#6c757d',
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#339af0',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
    marginVertical: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  imageUploadSection: {
    marginBottom: 16,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addImageText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  additionalInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});

export default ConsultRepairScreen; 