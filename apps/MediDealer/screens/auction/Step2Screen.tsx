import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Modal,
  TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import SelectionModal from '../../components/auction/SelectionModal';
import ImageUploader from '../../components/common/ImageUploader';
import { deviceTypes } from '../../constants/data';

const formatDate = (date: any) => {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const Step2Screen = ({ formData, setFormData, errors }: { formData: any, setFormData: any, errors: any }) => {
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());

  const onDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      setFormData((prev: any) => ({ ...prev, transferDate: selectedDate }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>장비 유형 *</Text>
        <TouchableOpacity 
          style={[styles.selectButton, errors.equipmentType && styles.inputError]}
          onPress={() => setShowEquipmentModal(true)}
        >
          <Text style={formData.equipmentType ? styles.selectText : styles.placeholderText}>
            {formData.equipmentType ? 
              deviceTypes.find(item => item.id === formData.equipmentType)?.name : 
              '장비 유형을 선택해주세요'}
          </Text>
        </TouchableOpacity>
        {errors.equipmentType && <Text style={styles.errorText}>{errors.equipmentType}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>장비 제조년 *</Text>
        <TextInput
          style={[styles.input, errors.manufacturingYear && styles.inputError]}
          placeholder="제조년도를 입력해주세요"
          keyboardType="number-pad"
          value={formData.manufacturingYear}
          onChangeText={(text: any) => setFormData((prev: any) => ({ ...prev, manufacturingYear: text }))}
        />
        {errors.manufacturingYear && <Text style={styles.errorText}>{errors.manufacturingYear}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>수량 *</Text>
        <TextInput
          style={[styles.input, errors.quantity && styles.inputError]}
          placeholder="수량을 입력해주세요"
          keyboardType="number-pad"
          value={formData.quantity}
          onChangeText={(text: any) => setFormData((prev: any) => ({ ...prev, quantity: text }))}
        />
        {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
      </View>

      <View style={styles.inputGroup}>
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

      <View style={styles.inputGroup}>
        <ImageUploader
          images={formData.images || []}
          setImages={(images: any) => setFormData((prev: any) => ({ ...prev, images }))}
          onImagesChange={(images: any) => setFormData((prev: any) => ({ ...prev, images }))}
          maxImages={10}
          label="장비 사진 (최대 10장) *"
          error={errors.images}
        />
      </View>

      <SelectionModal
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        onSelect={(item: any) => {
          setFormData((prev: any) => ({ ...prev, equipmentType: item.id }));
        }}
        items={deviceTypes}
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
});

export default Step2Screen; 