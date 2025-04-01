import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';

const ConsultClosureScreen = () => {
  const navigation = useNavigation();
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [medicalDeviceCount, setMedicalDeviceCount] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [urgentConsult, setUrgentConsult] = useState(false);

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      setPreferredDate(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const submitConsultation = () => {
    if (!hospitalName.trim()) {
      Alert.alert('알림', '의료기관명을 입력해주세요.');
      return;
    }

    if (!address.trim()) {
      Alert.alert('알림', '주소를 입력해주세요.');
      return;
    }

    if (!contact.trim()) {
      Alert.alert('알림', '연락처를 입력해주세요.');
      return;
    }

    // 여기에 실제 데이터 전송 로직이 들어갈 예정
    Alert.alert(
      '상담 신청 완료',
      '폐업 상담 신청이 완료되었습니다. 담당자가 빠른 시일 내에 연락드릴 예정입니다.',
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
            <Text style={styles.headerTitle}>폐업 상담하기</Text>
            <Text style={styles.headerSubtitle}>
              의료기관 폐업 절차 및 의료기기 처분에 관한 전문적인 상담을 제공해 드립니다.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>의료기관 정보</Text>
            
            <Text style={styles.label}>의료기관명</Text>
            <TextInput
              style={styles.input}
              value={hospitalName}
              onChangeText={setHospitalName}
              placeholder="의료기관명을 입력해주세요"
              placeholderTextColor="#adb5bd"
            />

            <Text style={styles.label}>주소</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="의료기관 주소를 입력해주세요"
              placeholderTextColor="#adb5bd"
            />

            <Text style={styles.label}>보유 의료기기 수량 (선택)</Text>
            <TextInput
              style={styles.input}
              value={medicalDeviceCount}
              onChangeText={setMedicalDeviceCount}
              placeholder="대략적인 보유 의료기기 수량"
              placeholderTextColor="#adb5bd"
              keyboardType="number-pad"
            />
            
            <Text style={styles.sectionTitle}>상담 정보</Text>

            <Text style={styles.label}>선호하는 상담 날짜 (선택)</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                {preferredDate ? formatDate(preferredDate) : '날짜 선택하기'}
              </Text>
              <AntDesign name="calendar" size={20} color="#6c757d" />
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>긴급 상담 요청</Text>
              <Switch
                trackColor={{ false: '#ccc', true: '#4dabf7' }}
                thumbColor={urgentConsult ? '#007bff' : '#f4f3f4'}
                onValueChange={setUrgentConsult}
                value={urgentConsult}
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

            <Text style={styles.label}>추가 요청사항 (선택)</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="추가적인 요청사항이나 문의사항을 작성해주세요"
              placeholderTextColor="#adb5bd"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={submitConsultation}
            >
              <Text style={styles.submitButtonText}>상담 신청하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 날짜 선택기 */}
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
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancelText}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>날짜 선택</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalConfirmText}>확인</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={datePickerDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
                locale="ko-KR"
              />
            </View>
          </View>
        </Modal>
      )}
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
  datePickerButton: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#212529',
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
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6c757d',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
});

export default ConsultClosureScreen; 