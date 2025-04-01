import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, SafeAreaView, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../services/medidealer/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_image?: string;
  hospital_name?: string;
  company_name?: string;
}

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [appVersion, setAppVersion] = useState('1.0.0');

  useEffect(() => {
    fetchUserProfile();
    getAppVersion();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setProfile(userData);
    } catch (error) {
      console.error('프로필 정보 조회 오류:', error);
      Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getAppVersion = async () => {
    // 실제 앱에서는 Device Info 라이브러리 등을 사용하여 앱 버전을 가져옵니다.
    // 여기서는 예시로 하드코딩합니다.
    setAppVersion('1.0.0');
  };

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: async () => {
            try {
              // 로그아웃 처리
              await AsyncStorage.removeItem('@MediDealer:authToken');
              await AsyncStorage.removeItem('@MediDealer:userData');
              
              // 로그인 화면으로 이동
              navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' as never }],
              });
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>프로필 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>프로필 정보</Text>
          <View style={styles.infoBox}>
            {profile?.name && (
              <Text style={styles.infoText}>이름: {profile.name}</Text>
            )}
            {profile?.email && (
              <Text style={styles.infoText}>이메일: {profile.email}</Text>
            )}
            {profile?.phone && (
              <Text style={styles.infoText}>전화번호: {profile.phone}</Text>
            )}
            {profile?.hospital_name && (
              <Text style={styles.infoText}>병원: {profile.hospital_name}</Text>
            )}
            {profile?.company_name && (
              <Text style={styles.infoText}>업체: {profile.company_name}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>앱 버전: {appVersion}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>로그아웃</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#e9ecef',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default SettingsScreen;
