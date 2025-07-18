import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, Alert, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { locations, departments, deviceTypes, manufacturers, initConstants, isConstantsInitialized } from '../../constants/data';
import ImageUploader from '../../components/common/ImageUploader';
import SelectionModal from '../../components/auction/SelectionModal';
import { setMyDevice } from '../../services/medidealer/api';

// 날짜 포맷팅 함수
const formatDate = (date: Date) => {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const AddMyDeviceScreen = ({ navigation }: { navigation: any }) => {
  const [formData, setFormData] = useState({
    // 병원/업체 정보
    location: locations[0]?.id || '',
    hospitalName: '',
    name: '',
    phone: '',
    
    // 의료기 정보
    department: departments[0]?.id || '',
    deviceType: deviceTypes[0]?.id || '',
    manufacturer: manufacturers[0]?.id || '',
    model: '',
    manufacturingYear: '',
    purchaseDate: new Date(),
    description: '',
    images: [],
    status: 0, // 0: 정상, 1: 수리중, 2: 폐기
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!isConstantsInitialized);
  const [submitting, setSubmitting] = useState(false);
  
  // 모달 상태
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDeviceTypeModal, setShowDeviceTypeModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());

  // 컴포넌트 마운트 시 상수 데이터 초기화
  useEffect(() => {
    const initializeConstants = async () => {
      // 이미 초기화되었으면 로딩 스킵
      if (isConstantsInitialized && departments.length > 0 && deviceTypes.length > 0) {
        console.log('이미 초기화됨, 기본값 설정 진행');
        setDefaultValues();
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 상수 데이터 초기화
        const success = await initConstants();
        
        if (success) {
          console.log('상수 데이터 초기화 성공, 기본값 설정');
          setDefaultValues();
        } else {
          console.error('상수 데이터 초기화 실패');
        }
      } catch (error) {
        console.error('상수 초기화 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    // 초기값 설정 함수
    const setDefaultValues = () => {
      // 기존 formData 복사
      const updatedFormData = { ...formData };
      let updated = false;

      // 지역 기본값 설정 (아직 선택되지 않은 경우)
      if (!updatedFormData.location && locations.length > 0) {
        updatedFormData.location = locations[0].id;
        updated = true;
      }

      // 진료과 기본값 설정 (아직 선택되지 않은 경우)
      if (!updatedFormData.department && departments.length > 0) {
        updatedFormData.department = departments[0].id;
        updated = true;
      }

      // 장비 유형 기본값 설정 (아직 선택되지 않은 경우)
      if (!updatedFormData.deviceType && deviceTypes.length > 0) {
        updatedFormData.deviceType = deviceTypes[0].id;
        updated = true;
      }

      // 제조사 기본값 설정 (아직 선택되지 않은 경우)
      if (!updatedFormData.manufacturer && manufacturers.length > 0) {
        updatedFormData.manufacturer = manufacturers[0].id;
        updated = true;
      }

      // 변경된 경우에만 업데이트
      if (updated) {
        console.log('기본값 설정됨');
        setFormData(updatedFormData);
      }
    };

    initializeConstants();
  }, []);

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      setFormData((prev) => ({ ...prev, purchaseDate: selectedDate }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 병원/업체 정보 검증
    if (!formData.location) newErrors.location = '지역을 선택해주세요';
    if (!formData.hospitalName) newErrors.hospitalName = '병원/업체명을 입력해주세요';
    if (!formData.name) newErrors.name = '담당자명을 입력해주세요';
    if (!formData.phone) newErrors.phone = '연락처를 입력해주세요';
    
    // 의료기 정보 검증
    if (!formData.department) newErrors.department = '진료과를 선택해주세요';
    if (!formData.deviceType) newErrors.deviceType = '장비 유형을 선택해주세요';
    if (!formData.manufacturer) newErrors.manufacturer = '제조사를 선택해주세요';
    if (!formData.model) newErrors.model = '모델명을 입력해주세요';
    if (!formData.manufacturingYear) newErrors.manufacturingYear = '제조년도를 입력해주세요';
    if (!formData.purchaseDate) newErrors.purchaseDate = '구입일자를 선택해주세요';
    if (!formData.description) newErrors.description = '설명을 입력해주세요';
    if (!formData.images || formData.images.length === 0) newErrors.images = '최소 1장 이상의 사진을 업로드해주세요';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await setMyDevice(formData);
      console.log('의료기 등록 성공:', response);
      Alert.alert('성공', '의료기가 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('의료기 등록 오류:', error);
      Alert.alert('오류', '의료기 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 병원/업체 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>병원/업체 정보</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>지역 선택 *</Text>
            <TouchableOpacity 
              style={[styles.selectButton, errors.location && styles.inputError]}
              onPress={() => setShowLocationModal(true)}
            >
              <Text style={formData.location ? styles.selectText : styles.placeholderText}>
                {formData.location ? 
                  locations.find(item => item.id === formData.location)?.name : 
                  '지역을 선택해주세요'}
              </Text>
            </TouchableOpacity>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>병원명(업체명) *</Text>
            <TextInput
              style={[styles.input, errors.hospitalName && styles.inputError]}
              placeholder="병원명(업체명)을 입력해주세요"
              value={formData.hospitalName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, hospitalName: text }))}
            />
            {errors.hospitalName && <Text style={styles.errorText}>{errors.hospitalName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>대표자명 *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="대표자명을 입력해주세요"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>휴대전화 *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="휴대전화 번호를 입력해주세요"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
        </View>

        {/* 의료기 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>의료기 정보</Text>
          
          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>진료과 *</Text>
              <TouchableOpacity 
                style={[styles.selectButton, errors.department && styles.inputError]}
                onPress={() => setShowDepartmentModal(true)}
              >
                <Text style={formData.department ? styles.selectText : styles.placeholderText}>
                  {formData.department ? 
                    departments.find(item => item.id === formData.department)?.name : 
                    '진료과 선택'}
                </Text>
              </TouchableOpacity>
              {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
            </View>

            <View style={styles.fieldHalf}>
              <Text style={styles.label}>장비 유형 *</Text>
              <TouchableOpacity 
                style={[styles.selectButton, errors.deviceType && styles.inputError]}
                onPress={() => setShowDeviceTypeModal(true)}
              >
                <Text style={formData.deviceType ? styles.selectText : styles.placeholderText}>
                  {formData.deviceType ? 
                    deviceTypes.find(item => item.id === formData.deviceType)?.name : 
                    '장비 유형 선택'}
                </Text>
              </TouchableOpacity>
              {errors.deviceType && <Text style={styles.errorText}>{errors.deviceType}</Text>}
            </View>
          </View>

          {/* <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>제조사 *</Text>
              <TouchableOpacity 
                style={[styles.selectButton, errors.manufacturer && styles.inputError]}
                onPress={() => setShowManufacturerModal(true)}
              >
                <Text style={formData.manufacturer ? styles.selectText : styles.placeholderText}>
                  {formData.manufacturer ? 
                    manufacturers.find(item => item.id === formData.manufacturer)?.name : 
                    '제조사 선택'}
                </Text>
              </TouchableOpacity>
              {errors.manufacturer && <Text style={styles.errorText}>{errors.manufacturer}</Text>}
            </View>

            <View style={styles.fieldHalf}>
              <Text style={styles.label}>모델명 *</Text>
              <TextInput
                style={[styles.input, errors.model && styles.inputError]}
                placeholder="모델명을 입력해주세요"
                value={formData.model}
                onChangeText={(text) => setFormData(prev => ({ ...prev, model: text }))}
              />
              {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
            </View>
          </View> */}

          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>제조년도 *</Text>
              <TextInput
                style={[styles.input, errors.manufacturingYear && styles.inputError]}
                placeholder="제조년도(ex. 2024)"
                keyboardType="number-pad"
                value={formData.manufacturingYear}
                onChangeText={(text) => setFormData(prev => ({ ...prev, manufacturingYear: text }))}
              />
              {errors.manufacturingYear && <Text style={styles.errorText}>{errors.manufacturingYear}</Text>}
            </View>

            <View style={styles.fieldHalf}>
              <Text style={styles.label}>구입일자 *</Text>
              <TouchableOpacity 
                style={[styles.selectButton, errors.purchaseDate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={formData.purchaseDate ? styles.selectText : styles.placeholderText}>
                  {formData.purchaseDate ? formatDate(formData.purchaseDate) : '구입일자를 선택해주세요'}
                </Text>
              </TouchableOpacity>
              {errors.purchaseDate && <Text style={styles.errorText}>{errors.purchaseDate}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>설명 *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, errors.description && styles.inputError]}
              placeholder="특이사항 또는 설명을 입력해주세요"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline={true}
              numberOfLines={3}
              maxLength={1000}
              textAlignVertical="top"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <ImageUploader
              images={formData.images || []}
              setImages={(images: any) => setFormData(prev => ({ ...prev, images }))}
              onImagesChange={(images: any) => setFormData(prev => ({ ...prev, images }))}
              maxImages={10}
              label="사진 (최대 10장) *"
              error={errors.images}
            />
          </View>
        </View>
      </ScrollView>

      {/* 등록 버튼 */}
      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity> */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>등록하기</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 모달 컴포넌트 */}
      <SelectionModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, location: item.id }));
        }}
        items={locations}
        title="지역 선택"
      />

      <SelectionModal
        visible={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, department: item.id }));
        }}
        items={departments}
        title="진료과 선택"
      />

      <SelectionModal
        visible={showDeviceTypeModal}
        onClose={() => setShowDeviceTypeModal(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, deviceType: item.id }));
        }}
        items={deviceTypes}
        title="장비 유형 선택"
      />

      <SelectionModal
        visible={showManufacturerModal}
        onClose={() => setShowManufacturerModal(false)}
        onSelect={(item) => {
          setFormData(prev => ({ ...prev, manufacturer: item.id }));
        }}
        items={manufacturers}
        title="제조사 선택"
      />

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={datePickerDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <DateTimePicker
                value={datePickerDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                style={styles.datePicker}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, purchaseDate: datePickerDate }));
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 10,
    backgroundColor: 'white',
  },
  selectText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fieldHalf: {
    width: '48%',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#6c757d',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 4,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  datePicker: {
    height: 200,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#6c757d',
  },
  modalButtonConfirm: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddMyDeviceScreen;
