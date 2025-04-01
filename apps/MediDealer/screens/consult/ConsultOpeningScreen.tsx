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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const ConsultOpeningScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [medicalDepartment, setMedicalDepartment] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedConsultType, setSelectedConsultType] = useState<string | null>(null);

  const consultTypes = [
    { id: 'full', name: '종합 개업 상담' },
    { id: 'location', name: '입지 선정 상담' },
    { id: 'equipment', name: '의료장비 구입 상담' },
    { id: 'licensing', name: '인허가 절차 상담' },
  ];

  const submitConsultation = () => {
    if (!name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    if (!contact.trim()) {
      Alert.alert('알림', '연락처를 입력해주세요.');
      return;
    }

    if (!selectedConsultType) {
      Alert.alert('알림', '상담 유형을 선택해주세요.');
      return;
    }

    // 여기에 실제 데이터 전송 로직이 들어갈 예정
    Alert.alert(
      '상담 신청 완료',
      '개업 상담 신청이 완료되었습니다. 담당자가 빠른 시일 내에 연락드릴 예정입니다.',
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
            <Text style={styles.headerTitle}>개업 상담하기</Text>
            <Text style={styles.headerSubtitle}>
              의료기관 개업에 필요한 모든 정보와 전문적인 조언을 제공해 드립니다.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>상담 유형</Text>
            <View style={styles.consultTypeContainer}>
              {consultTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.consultTypeButton,
                    selectedConsultType === type.id && styles.selectedConsultType,
                  ]}
                  onPress={() => setSelectedConsultType(type.id)}
                >
                  <Text
                    style={[
                      styles.consultTypeText,
                      selectedConsultType === type.id && styles.selectedConsultTypeText,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>기본 정보</Text>
            
            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력해주세요"
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

            <Text style={styles.sectionTitle}>개업 계획 정보 (선택)</Text>

            <Text style={styles.label}>개업 희망 지역</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="개업 희망 지역 (예: 서울 강남구, 대구 중구 등)"
              placeholderTextColor="#adb5bd"
            />

            <Text style={styles.label}>진료과목</Text>
            <TextInput
              style={styles.input}
              value={medicalDepartment}
              onChangeText={setMedicalDepartment}
              placeholder="개원 예정 진료과목"
              placeholderTextColor="#adb5bd"
            />

            <Text style={styles.label}>예상 예산</Text>
            <TextInput
              style={styles.input}
              value={budget}
              onChangeText={setBudget}
              placeholder="예상 개업 예산 (단위: 만원)"
              placeholderTextColor="#adb5bd"
              keyboardType="number-pad"
            />

            <Text style={styles.label}>추가 문의사항</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="추가적인 문의사항이나 요청사항을 작성해주세요"
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

          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoTitle}>
              <AntDesign name="infocirlce" size={16} color="#495057" style={{ marginRight: 5 }} />
              개업 상담 진행 절차
            </Text>
            <View style={styles.stepContainer}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>상담 신청서 제출</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>전문 상담사 배정 (1-2일 소요)</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>전화 또는 방문 상담 진행</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>맞춤형 개업 계획 제안</Text>
              </View>
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
  consultTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  consultTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
  },
  consultTypeText: {
    color: '#495057',
    fontWeight: '500',
  },
  selectedConsultType: {
    backgroundColor: '#007bff',
  },
  selectedConsultTypeText: {
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
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContainer: {
    paddingHorizontal: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4dabf7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#495057',
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e9ecef',
    marginLeft: 14,
  },
});

export default ConsultOpeningScreen; 