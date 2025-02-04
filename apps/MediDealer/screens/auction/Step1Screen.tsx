import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import SelectionModal from '../../components/auction/SelectionModal';
import { departments, locations } from '../../constants/data';

const Step1Screen = ({ formData, setFormData, errors }) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  return (
    <ScrollView style={styles.container}>
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
          placeholder="병원명을 입력해주세요"
          value={formData.hospitalName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, hospitalName: text }))}
        />
        {errors.hospitalName && <Text style={styles.errorText}>{errors.hospitalName}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>성함(대표자명) *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="성함을 입력해주세요"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>휴대폰 번호 *</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="휴대폰 번호를 입력해주세요"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>장비 진료과명 *</Text>
        <TouchableOpacity 
          style={[styles.selectButton, errors.department && styles.inputError]}
          onPress={() => setShowDepartmentModal(true)}
        >
          <Text style={formData.department ? styles.selectText : styles.placeholderText}>
            {formData.department ? 
              departments.find(item => item.id === formData.department)?.name : 
              '사용했던 진료과를 선택해주세요'}
          </Text>
        </TouchableOpacity>
        {errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
      </View>

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
});

export default Step1Screen; 