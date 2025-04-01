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

const ConsultFeatureScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'bug', name: '버그 신고' },
    { id: 'improvement', name: '기능 개선 요청' },
    { id: 'question', name: '사용법 문의' },
    { id: 'other', name: '기타 문의' },
  ];

  const submitInquiry = () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    // 여기에 실제 데이터 전송 로직이 들어갈 예정
    Alert.alert(
      '문의 등록 완료',
      '문의가 성공적으로 등록되었습니다. 빠른 시일 내에 답변 드리겠습니다.',
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
            <Text style={styles.headerTitle}>기능 건의/문의하기</Text>
            <Text style={styles.headerSubtitle}>
              메디딜러 플랫폼에 대한 문의나 건의사항을 남겨주세요.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <View style={styles.categoryContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="제목을 입력해주세요"
              placeholderTextColor="#adb5bd"
            />

            <Text style={styles.label}>내용</Text>
            <TextInput
              style={styles.textArea}
              value={content}
              onChangeText={setContent}
              placeholder="문의하실 내용을 상세히 작성해주세요"
              placeholderTextColor="#adb5bd"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <Text style={styles.label}>연락처 (선택)</Text>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              placeholder="연락 가능한 이메일 또는 전화번호"
              placeholderTextColor="#adb5bd"
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.submitButton} onPress={submitInquiry}>
              <Text style={styles.submitButtonText}>문의 등록하기</Text>
            </TouchableOpacity>
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#495057',
    fontWeight: '500',
  },
  selectedCategory: {
    backgroundColor: '#007bff',
  },
  selectedCategoryText: {
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
    height: 150,
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
});

export default ConsultFeatureScreen; 