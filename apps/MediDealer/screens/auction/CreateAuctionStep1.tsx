import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import SelectionModal from '../../components/auction/SelectionModal';
import { locations, departments, deviceTypes, manufacturers, initConstants, isConstantsInitialized } from '../../constants/data';
import ImageUploader from '../../components/common/ImageUploader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Department } from '@repo/shared/models';

const formatDate = (date: Date) => {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const CreateAuctionStep1 = ({ formData, setFormData, errors }: { formData: any, setFormData: any, errors: any }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [loading, setLoading] = useState(!isConstantsInitialized);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);

  // 해시태그 추출 함수
  const extractHashtags = (text: string) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  // 텍스트 변경 시 해시태그 추출
  const handleDescriptionChange = (text: string) => {
    const extractedHashtags = extractHashtags(text);
    setHashtags(extractedHashtags);
    setFormData((prev: any) => ({ ...prev, description: text }));
  };

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

      // 진료과 기본값 설정 (아직 선택되지 않은 경우)
      if (!updatedFormData.department && departments.length > 0) {
        updatedFormData.department = departments[0].id;
        updatedFormData.equipmentType = departments[0].deviceTypes?.[0]?.device_type_id || '';
        updated = true;
      }

      // 장비 유형 기본값 설정 (아직 선택되지 않은 경우)
      if (!updatedFormData.equipmentType && deviceTypes.length > 0) {
        updatedFormData.equipmentType = deviceTypes[0].id;
        updated = true;
      }

      // 변경된 경우에만 업데이트
      if (updated) {
        console.log('기본값 설정됨:', updatedFormData.department, updatedFormData.equipmentType);
        setFormData(updatedFormData);
      }
    };

    initializeConstants();
  }, [formData, setFormData]);

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      setFormData((prev: any) => ({ ...prev, transferDate: selectedDate }));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>지역 *</Text>
          <TouchableOpacity 
            style={[styles.selectButton, errors.location && styles.inputError]}
            onPress={() => setShowLocationModal(true)}
          >
            <Text style={formData.area ? styles.selectText : styles.placeholderText}>
              {formData.area ? 
                locations.find(item => item.name === formData.area)?.name : 
                '지역을 선택해주세요'}
            </Text>
          </TouchableOpacity>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        <View style={styles.fieldHalf}>
          <Text style={styles.label}>장비 진료과명 *</Text>
          <TouchableOpacity 
            style={[styles.selectButton, errors.department && styles.inputError]}
            onPress={() => setShowDepartmentModal(true)}
          >
            <Text style={formData.department ? styles.selectText : styles.placeholderText}>
              {formData.department ? 
                departments.find(item => item.id === formData.department)?.name : 
                '사용 진료과 선택'}
            </Text>
          </TouchableOpacity>
          {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
        </View>        
      </View>

      <View style={styles.row}>
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>장비 유형 *</Text>
          <TouchableOpacity 
            style={[styles.selectButton, errors.equipmentType && styles.inputError]}
            onPress={() => setShowEquipmentModal(true)}
          >
            <Text style={formData.equipmentType ? styles.selectText : styles.placeholderText}>
              {formData.equipmentType ? 
                deviceTypes.find(item => item.id.toString() === formData.equipmentType)?.name : 
                '유형을 선택해주세요'}
            </Text>
          </TouchableOpacity>
          {errors.equipmentType && <Text style={styles.errorText}>{errors.equipmentType}</Text>}
        </View>
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>장비 제조년 *</Text>
          <TextInput
            style={[styles.input, errors.manufacturingYear && styles.inputError]}
            placeholder="제조년도(ex. 2024)"
            keyboardType="number-pad"
            value={formData.manufacturingYear}
            onChangeText={(text) => setFormData((prev: any) => ({ ...prev, manufacturingYear: text }))}
          />
          {errors.manufacturingYear && <Text style={styles.errorText}>{errors.manufacturingYear}</Text>}
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>양도 가능일자 *</Text>
          <TouchableOpacity 
            style={[styles.selectButton, errors.transferDate && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={formData.transferDate ? styles.selectText : styles.placeholderText}>
              {formData.transferDate ? formatDate(formData.transferDate) : '양도 가능일자를 선택해주세요'}
            </Text>
          </TouchableOpacity>
          {errors.transferDate && <Text style={styles.errorText}>{errors.transferDate}</Text>}
        </View>
      </View>

      {/* <View style={styles.row}>        
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>수량 *</Text>
          <TextInput
            style={[styles.input, errors.quantity && styles.inputError]}
            placeholder="수량을 입력해주세요"
            keyboardType="number-pad"
            value={formData.quantity}
            onChangeText={(text) => setFormData((prev: any) => ({ ...prev, quantity: text }))}
          />
          {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
        </View>
        
      </View> */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>설명 *</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, errors.description && styles.inputError]}
          placeholder="#제조사 #모델명 #특이사항(또는 설명)을 양식에 맞게 입력해주세요"
          value={formData.description}
          onChangeText={handleDescriptionChange}
          multiline={true}
          numberOfLines={3}
          maxLength={1000}
          textAlignVertical="top"
        />
        {hashtags.length > 0 && (
          <View style={styles.hashtagContainer}>
            <Text style={styles.hashtagLabel}>추출된 태그:</Text>
            <View style={styles.hashtagList}>
              {hashtags.map((tag, index) => (
                <View key={index} style={styles.hashtagItem}>
                  <Text style={styles.hashtagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <ImageUploader
          images={formData.images || []}
          setImages={(images: any) => setFormData((prev: any) => ({ ...prev, images }))}
          onImagesChange={(images: any) => setFormData((prev: any) => ({ ...prev, images }))}
          maxImages={10}
          label="사진 (최대 10장) *"
          error={errors.images}
        />
      </View>

      <SelectionModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(item) => {
          setFormData((prev: any) => ({ ...prev, area: item.id }));
        }}
        items={locations}
        title="지역 선택"
      />

      <SelectionModal
        visible={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSelect={(item) => {
          setFormData((prev: any) => ({ ...prev, department: item.id }));
          setFormData((prev: any) => ({ ...prev, equipmentType: item.deviceTypes?.[0]?.device_type_id || '' }));
          setSelectedDepartment(item);
        }}
        items={departments}
        title="진료과 선택"
      />

      <SelectionModal
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        onSelect={(item) => {
          setFormData((prev: any) => ({ ...prev, equipmentType: item.id }));
        }}
        items={selectedDepartment?.deviceTypes?.map(item => ({ id: item.device_type_id.toString(), name: item.deviceType?.name })) || []}
        title="장비 유형 선택"
      />

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={datePickerDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
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
                minimumDate={new Date()}
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
                    setFormData((prev: any) => ({ ...prev, transferDate: datePickerDate }));
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {    
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
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
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 5,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldRatio2: {
    flex: 2,
  },
  fieldRatio4: {
    flex: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: '#6c757d',
  },
  multilineInput: {
    minHeight: 80,     // 약 3줄 높이에 해당하는 값
    maxHeight: 400,    // 약 20줄까지 표시 가능한 높이
    textAlignVertical: 'top',
    paddingTop: 10,
    paddingBottom: 10,
  },
  hashtagContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  hashtagLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  hashtagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagItem: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hashtagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CreateAuctionStep1; 