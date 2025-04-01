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
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

// 검사원 종류
const inspectorTypes = [
  { id: 'safety', name: '안전 검사원', description: '의료기기 안전성 검사 및 인증' },
  { id: 'performance', name: '성능 검사원', description: '의료기기 성능 및 정밀도 검사' },
  { id: 'maintenance', name: '정기 점검원', description: '정기적인 의료기기 점검 및 유지보수' },
  { id: 'certification', name: '인증 검사원', description: '의료기기 인증 및 규제 준수 확인' },
];

// 검사 희망 날짜 (현재 날짜로부터 7일)
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // 주말 제외 (0: 일요일, 6: 토요일)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      dates.push({
        id: i.toString(),
        date,
        dateString: `${date.getMonth() + 1}월 ${date.getDate()}일 (${getDayOfWeek(date)})`
      });
    }
  }
  
  return dates;
};

// 요일 표시
const getDayOfWeek = (date: Date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

const ConsultInspectorScreen = () => {
  const navigation = useNavigation();
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contact, setContact] = useState('');
  const [deviceCount, setDeviceCount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [regularInspection, setRegularInspection] = useState(false);
  
  const availableDates = getAvailableDates();

  const validateForm = () => {
    if (!hospitalName.trim()) {
      Alert.alert('알림', '의료기관명을 입력해주세요.');
      return false;
    }
    
    if (!address.trim()) {
      Alert.alert('알림', '주소를 입력해주세요.');
      return false;
    }
    
    if (!contactPerson.trim()) {
      Alert.alert('알림', '담당자명을 입력해주세요.');
      return false;
    }
    
    if (!contact.trim()) {
      Alert.alert('알림', '연락처를 입력해주세요.');
      return false;
    }
    
    if (!selectedType) {
      Alert.alert('알림', '검사원 종류를 선택해주세요.');
      return false;
    }
    
    if (!selectedDate) {
      Alert.alert('알림', '희망 방문일을 선택해주세요.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // 여기에 실제 데이터 전송 로직이 들어갈 예정
      Alert.alert(
        '신청 완료',
        '검사원 방문 신청이 완료되었습니다. 담당자가 확인 후 연락드릴 예정입니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>검사원 온라인 신청</Text>
            <Text style={styles.headerSubtitle}>
              의료기기 검사 및 점검을 위한 전문 검사원 방문을 온라인으로 신청하세요.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>검사원 종류</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.inspectorTypesContainer}
            >
              {inspectorTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.inspectorTypeCard,
                    selectedType === type.id && styles.selectedTypeCard,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Text style={[
                    styles.inspectorTypeName,
                    selectedType === type.id && styles.selectedTypeText,
                  ]}>
                    {type.name}
                  </Text>
                  <Text style={[
                    styles.inspectorTypeDescription,
                    selectedType === type.id && styles.selectedTypeText,
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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

            <Text style={styles.label}>담당자명</Text>
            <TextInput
              style={styles.input}
              value={contactPerson}
              onChangeText={setContactPerson}
              placeholder="담당자 이름을 입력해주세요"
              placeholderTextColor="#adb5bd"
            />

            <Text style={styles.label}>연락처</Text>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              placeholder="연락 가능한 전화번호"
              placeholderTextColor="#adb5bd"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>보유 의료기기 수량 (선택)</Text>
            <TextInput
              style={styles.input}
              value={deviceCount}
              onChangeText={setDeviceCount}
              placeholder="검사 받을 의료기기 수량"
              placeholderTextColor="#adb5bd"
              keyboardType="number-pad"
            />

            <Text style={styles.sectionTitle}>방문 희망일</Text>
            <View style={styles.datesContainer}>
              {availableDates.map(dateItem => (
                <TouchableOpacity
                  key={dateItem.id}
                  style={[
                    styles.dateButton,
                    selectedDate === dateItem.id && styles.selectedDateButton,
                  ]}
                  onPress={() => setSelectedDate(dateItem.id)}
                >
                  <Text 
                    style={[
                      styles.dateText,
                      selectedDate === dateItem.id && styles.selectedDateText,
                    ]}
                  >
                    {dateItem.dateString}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>정기 검사 신청</Text>
              <Switch
                trackColor={{ false: '#ccc', true: '#4dabf7' }}
                thumbColor={regularInspection ? '#007bff' : '#f4f3f4'}
                onValueChange={setRegularInspection}
                value={regularInspection}
              />
            </View>
            {regularInspection && (
              <Text style={styles.regularInspectionNote}>
                * 정기 검사는 3개월 주기로 자동 신청됩니다.
              </Text>
            )}

            <Text style={styles.label}>추가 요청사항 (선택)</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="추가 요청사항이나 특이사항을 입력해주세요"
              placeholderTextColor="#adb5bd"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>검사원 신청하기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              <AntDesign name="infocirlce" size={16} color="#495057" />
              {' '}검사원 방문 안내
            </Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoItem}>• 신청 후 1~2일 이내 담당자 확인 연락</Text>
              <Text style={styles.infoItem}>• 검사원 방문 시 담당자 필수 대기</Text>
              <Text style={styles.infoItem}>• 의료기기 관련 서류 준비 필요</Text>
              <Text style={styles.infoItem}>• 검사 및 점검 기본 비용: 장비당 5만원~</Text>
              <Text style={styles.infoItem}>• 정기 검사 신청 시 10% 할인 혜택</Text>
            </View>
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
  inspectorTypesContainer: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  inspectorTypeCard: {
    width: 200,
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    marginBottom: 10,
  },
  selectedTypeCard: {
    backgroundColor: '#339af0',
  },
  inspectorTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 6,
  },
  inspectorTypeDescription: {
    fontSize: 13,
    color: '#6c757d',
  },
  selectedTypeText: {
    color: 'white',
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
  datesContainer: {
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedDateButton: {
    backgroundColor: '#339af0',
  },
  dateText: {
    fontSize: 16,
    color: '#343a40',
  },
  selectedDateText: {
    color: 'white',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
  },
  regularInspectionNote: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 16,
    paddingHorizontal: 4,
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
  infoCard: {
    backgroundColor: '#e7f5ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 12,
  },
  infoContent: {
    paddingHorizontal: 5,
  },
  infoItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default ConsultInspectorScreen; 