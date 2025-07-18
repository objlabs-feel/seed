import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Linking, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyProfile } from '../services/medidealer/api';
import { APP_VERSION } from '../constants/app';
import { OPEN_SOURCE_LIST } from '../constants/opensource';
import { IUserProfile } from '@repo/shared';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { StackNavigationProp } from '@react-navigation/stack';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOpenSourceModal, setShowOpenSourceModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [businessNumber, setBusinessNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchProfile();
    
    // 네비게이션 헤더 설정
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AntDesign name="setting" size={20} color="#333" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>설정</Text>
        </View>
      ),
      headerLeft: () => null,
      headerRight: () => null
    });
  }, [navigation]);

  const fetchProfile = async () => {
    try {
      const userProfile = await getMyProfile();
      console.log('userProfile', userProfile);
      setProfile(userProfile.data.profile);
    } catch (error) {
      console.error('프로필 조회 중 오류:', error);
      Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async () => {
    Alert.alert(
      '연결정보 삭제',
      '모든 연결정보가 삭제됩니다. 계속하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'authToken',
                'userData',
                'deviceToken'
              ]);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              });
            } catch (error) {
              console.error('연결정보 삭제 중 오류:', error);
              Alert.alert('오류', '연결정보 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleRecoverRequest = async () => {
    if (!businessNumber || !phoneNumber) {
      Alert.alert('알림', '사업자등록번호와 전화번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsVerifying(true);
      // TODO: 인증번호 발송 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 딜레이
      setIsVerificationSent(true);
      Alert.alert('알림', '인증번호가 발송되었습니다.');
    } catch (error) {
      console.error('인증번호 발송 중 오류:', error);
      Alert.alert('오류', '인증번호 발송 중 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      Alert.alert('알림', '인증번호를 입력해주세요.');
      return;
    }

    try {
      setIsVerifying(true);
      // TODO: 인증번호 확인 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 딜레이
      Alert.alert('알림', '인증이 완료되었습니다.');
      setShowRecoverModal(false);
      // TODO: 연결정보 복구 API 호출
    } catch (error) {
      console.error('인증 중 오류:', error);
      Alert.alert('오류', '인증 중 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>프로필 정보</Text>
          <View style={styles.profileContainer}>
            <View style={styles.profileHeader}>              
              <View style={styles.profileMainInfo}>
              <Text style={styles.profileName}>사용자명: {profile?.name || '익명사용자' + profile?.id}</Text>
                <Text style={styles.profileType}>
                  유형구분 : {profile?.company?.company_type === 0 ? '병원' : '업체'}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>이메일</Text>
                <Text style={styles.detailValue}>{profile?.email}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>전화번호</Text>
                <Text style={styles.detailValue}>{profile?.mobile}</Text>
              </View>

              <View style={styles.profileHeader}></View>
              {profile?.company?.secret_info && (
                <>                
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>업체명</Text>
                    <Text style={styles.detailValue}>{profile.company?.name}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>사업자번호</Text>
                    <Text style={styles.detailValue}>{profile.company?.secret_info?.business_number}</Text>
                  </View>                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>주소</Text>
                    <Text style={styles.detailValue}>{profile.company?.secret_info?.address}</Text>
                  </View>
                </>
              )}

              <View style={styles.detailItem}>
                <TouchableOpacity 
                  style={styles.recoverButton}
                  onPress={() => {
                    Alert.alert(
                      '연결정보 복구',
                      '사업자등록정보를 이용하여 이전 연결정보를 복구합니다.',
                      [
                        {
                          text: '취소',
                          style: 'cancel'
                        },
                        {
                          text: '복구',
                          onPress: () => setShowRecoverModal(true)
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.recoverButtonText}>연결정보 복구</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이력보기</Text>
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => navigation.navigate('SalesHistory' as never)}
          >
            <Text style={styles.historyButtonText}>판매이력 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => navigation.navigate('PurchaseHistory' as never)}
          >
            <Text style={styles.historyButtonText}>구매이력 보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>앱 버전: {APP_VERSION}</Text>
          </View>
          <TouchableOpacity 
            style={styles.openSourceButton}
            onPress={() => setShowOpenSourceModal(true)}
          >
            <Text style={styles.openSourceButtonText}>오픈소스 사용정보</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연결정보 관리</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteConnection}
          >
            <Text style={styles.deleteButtonText}>연결정보 삭제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showOpenSourceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOpenSourceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>오픈소스 사용정보</Text>
              <TouchableOpacity 
                onPress={() => setShowOpenSourceModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.openSourceList}>
              {OPEN_SOURCE_LIST.map((item, index) => (
                <View key={index} style={styles.openSourceItem}>
                  <Text style={styles.openSourceName}>{item.name}</Text>
                  <Text style={styles.openSourceVersion}>버전: {item.version}</Text>
                  <Text style={styles.openSourceLicense}>라이선스: {item.license}</Text>
                  <Text style={styles.openSourceDescription}>{item.description}</Text>
                  {item.link && (
                    <TouchableOpacity 
                      onPress={() => Linking.openURL(item.link!)}
                      style={styles.linkButton}
                    >
                      <Text style={styles.linkButtonText}>GitHub 링크</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRecoverModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecoverModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>연결정보 복구</Text>
              <TouchableOpacity 
                onPress={() => setShowRecoverModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.recoverForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>사업자등록번호</Text>
                <TextInput
                  style={styles.input}
                  value={businessNumber}
                  onChangeText={setBusinessNumber}
                  placeholder="사업자등록번호를 입력하세요"
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>전화번호</Text>
                <View style={styles.phoneInputContainer}>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="전화번호를 입력하세요"
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.verifyButton,
                      isVerificationSent && styles.verifyButtonDisabled
                    ]}
                    onPress={handleRecoverRequest}
                    disabled={isVerificationSent || isVerifying}
                  >
                    <Text style={styles.verifyButtonText}>
                      {isVerificationSent ? '재발송' : '인증번호 발송'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isVerificationSent && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>인증번호</Text>
                  <View style={styles.verificationContainer}>
                    <TextInput
                      style={[styles.input, styles.verificationInput]}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="인증번호를 입력하세요"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <TouchableOpacity 
                      style={styles.verifyButton}
                      onPress={handleVerification}
                      disabled={isVerifying}
                    >
                      <Text style={styles.verifyButtonText}>확인</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  userTypeContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  userTypeItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  selectedUserType: {
    backgroundColor: '#007bff',
  },
  userTypeText: {
    fontSize: 16,
    color: '#495057',
  },
  selectedUserTypeText: {
    color: 'white',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#212529',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
  },
  openSourceButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  openSourceButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#6c757d',
    fontSize: 16,
  },
  openSourceList: {
    maxHeight: 500,
  },
  openSourceItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  openSourceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  openSourceVersion: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  openSourceLicense: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  openSourceDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e7f5ff',
    borderRadius: 4,
  },
  linkButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  profileContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileMainInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  profileDetails: {
    gap: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    textAlign: 'right',
    paddingRight: 10,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
  },
  recoverButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  recoverButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  recoverForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  phoneInput: {
    flex: 1,
  },
  verificationContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  verificationInput: {
    flex: 1,
  },
  verifyButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  historyButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  historyButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '500',
  },
  headerIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerIconText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default SettingsScreen;
