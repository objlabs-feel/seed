import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const consultOptions = [
  {
    id: 'feature',
    title: '기능 건의/문의하기',
    description: '메디딜러 플랫폼 기능에 대한 문의 및 건의사항을 등록합니다.',
    iconName: 'question',
    screen: 'ConsultFeature',
    emoji: '❓',
  },
  {
    id: 'closure',
    title: '폐업 상담하기',
    description: '의료기관 폐업에 관한 전문적인 상담을 받을 수 있습니다.',
    iconName: 'closecircle',
    screen: 'ConsultClosure',
    emoji: '🚫',
  },
  {
    id: 'opening',
    title: '개업 상담하기',
    description: '의료기관 개업에 필요한 정보와 상담을 받을 수 있습니다.',
    iconName: 'home',
    screen: 'ConsultOpening',
    emoji: '🏥',
  },
  {
    id: 'repair',
    title: '의료기 수리 상담하기',
    description: '보유한 의료기기의 수리 및 유지보수에 관한 상담을 받을 수 있습니다.',
    iconName: 'tool',
    screen: 'ConsultRepair',
    emoji: '🔧',
  },
  {
    id: 'inspector',
    title: '검사원 온라인 신청',
    description: '의료기기 검사를 위한 신청을 온라인으로 신청할 수 있습니다.',
    iconName: 'solution1',
    screen: 'ConsultInspector',
    emoji: '📋',
  },
];

// 로그 정보를 저장할 상태
const MyConsultScreen = () => {
  const navigation = useNavigation();
  const [fontInfo, setFontInfo] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadIconInfo();
  }, []);

  const loadIconInfo = () => {
    // 컴포넌트 마운트시 아이콘 정보 수집
    try {
      const fontFamily = AntDesign.getFontFamily();
      const glyphMap = AntDesign.getRawGlyphMap() || {};
      const availableIcons = Object.keys(glyphMap).slice(0, 15).join(', ');
      const doesIconExist = (name: string) => glyphMap[name] ? '있음' : '없음';
      
      setFontInfo(
        `폰트: ${fontFamily || '없음'}\n` +
        `아이콘 예시: ${availableIcons}\n` +
        `question 아이콘: ${doesIconExist('question')}\n` +
        `closecircle 아이콘: ${doesIconExist('closecircle')}\n` +
        `shop 아이콘: ${doesIconExist('shop')}\n` +
        `tool 아이콘: ${doesIconExist('tool')}`
      );
    } catch (error: any) {
      setFontInfo(`오류: ${error.message || '알 수 없는 오류'}`);
    }
  };

  // 새로고침 처리 함수
  const onRefresh = () => {
    setRefreshing(true);
    
    // 실제 데이터를 다시 로드하는 로직
    loadIconInfo();
    
    // 새로고침 효과를 위해 약간의 지연 추가
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // const renderIcons = () => {
  //   return ['home', 'setting', 'user'].map(name => (
  //     <View key={name} style={{flexDirection: 'row', alignItems: 'center', margin: 5}}>
  //       <AntDesign name={name} size={24} color="#000" style={{width: 24, height: 24, textAlign: 'center'}} />
  //       <Text style={{marginLeft: 10}}>{name}</Text>
  //     </View>
  //   ));
  // };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
            tintColor="#007bff"
            title="새로고침 중..."
            titleColor="#6c757d"
          />
        }
      >
        {/* 디버깅 정보 표시 */}
        {/* <View style={{padding: 10, backgroundColor: '#f0f0f0', marginBottom: 10}}>
          <Text style={{fontSize: 12}}>{fontInfo}</Text>
          <Text style={{fontSize: 14, marginTop: 5}}>기본 아이콘 테스트:</Text>
          {renderIcons()}
        </View> */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>어떤 상담이 필요하신가요?</Text>
          <Text style={styles.headerSubtitle}>메디딜러와 함께 의료기기 관련 다양한 상담을 진행하세요.</Text>
        </View>

        <View style={styles.optionsContainer}>
          {consultOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => navigation.navigate(option.screen as never)}
            >
              <View style={styles.optionIconContainer}>
                <AntDesign 
                  name={option.iconName} 
                  size={30} 
                  color="#007bff" 
                  style={{width: 30, height: 30, textAlign: 'center'}}
                />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>더 긴급한 상담이 필요하신가요?</Text>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callButtonText}>고객센터 연결하기</Text>
          </TouchableOpacity>
          <Text style={styles.operatingHours}>운영시간: 평일 9:00 - 18:00 (공휴일 제외)</Text>
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
  optionsContainer: {
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIcon: {
    width: 30,
    height: 30,
    tintColor: '#007bff',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  supportSection: {
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  callButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  operatingHours: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
  },
  emojiIcon: {
    fontSize: 30,
    textAlign: 'center',
  },
});

export default MyConsultScreen;
