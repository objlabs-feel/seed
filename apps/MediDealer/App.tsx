/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { enableScreens } from 'react-native-screens';
import AuctionRegistrationScreen from './screens/AuctionRegistrationScreen';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import AuctionSearchScreen from './screens/AuctionSearchScreen';
import HomeScreen from './screens/HomeScreen';
import { getOrCreateDeviceId } from './utils/deviceId';
import { checkIn, verifyUser } from './services/medidealer/api';
import { AuthResponse } from '@medidealer/shared/models/user';
import { initConstants } from './constants/data';
import AuctionDetailScreen from './screens/AuctionDetailScreen';
import AuctionSelectBidScreen from './screens/AuctionSelectBidScreen';
import AuctionBidAcceptScreen from './screens/AuctionBidAcceptScreen';
type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

// 네이티브 스크린 활성화
enableScreens();

// 타입 정의
type RootStackParamList = {
  Splash: undefined;
  UserAgreement: undefined;
  Home: undefined;
  AuctionRegistration: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// 스플래시 화면
const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 디바이스 ID 생성 또는 가져오기
        const deviceId = await getOrCreateDeviceId();
        
        // 서버에 디바이스 등록 및 토큰 받기
        const userData = await AsyncStorage.getItem('@MediDealer:userData');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('User data:', user);
          const verifyResponse: AuthResponse = await verifyUser(user.id, deviceId);
          console.log('Verify successful:', verifyResponse);
          // 상수 데이터 초기화
          await initConstants();
        } else {
          const authResponse: AuthResponse = await checkIn(deviceId);
          console.log('Checkin successful:', authResponse);
          const verifyResponse: AuthResponse = await verifyUser(authResponse.user.id, deviceId);
          console.log('Verify successful:', verifyResponse);
          // 상수 데이터 초기화
          await initConstants();
        }

        // 이용약관 확인
        const hasAgreed = await AsyncStorage.getItem('userAgreement');
        
        // 약간의 지연 후 다음 화면으로 이동
        setTimeout(() => {
          navigation.replace(hasAgreed ? 'Home' : 'UserAgreement');
        }, 1000);
      } catch (error) {
        console.error('Error initializing app:', error);        
        if (error instanceof Error && error.message.includes('400')) {
          await AsyncStorage.removeItem('@MediDealer:userData');
          await AsyncStorage.removeItem('@MediDealer:authToken');
        }
        Alert.alert(
          '오류',
          '앱 초기화 중 문제가 발생했습니다. 다시 시도해주세요.',
          [
            {
              text: '다시 시도',
              onPress: () => initializeApp()
            }
          ]
        );
      }
    };

    initializeApp();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={36} />
      <Text style={{ marginTop: 20 }}>Loading...</Text>
    </View>
  );
};

// 이용자 약관동의 화면
const UserAgreementScreen = ({ navigation }) => {
  const handleAgree = async () => {
    try {
      await AsyncStorage.setItem('userAgreement', 'true');
      navigation.replace('Home');
    } catch (error) {
      console.error('Error saving user agreement:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>이용자 약관</Text>
        <Text style={{ marginTop: 20 }}>
          여기에 약관 내용이 들어갑니다...
        </Text>
      </View>
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Button title="동의하기" onPress={handleAgree} />
      </View>
    </View>
  );
};

// 홈 화면 컴포넌트
const TabScreen = ({ title }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title}</Text>
  </View>
);

// 홈 탭 네비게이터
const HomeTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: '홈' }}
      />
      <Tab.Screen 
        name="MyMedical" 
        component={() => <TabScreen title="내의료기" />}
        options={{ title: '내의료기' }}
      />
      <Tab.Screen 
        name="Consulting" 
        component={() => <TabScreen title="상담하기" />}
        options={{ title: '상담하기' }}
      />
      <Tab.Screen 
        name="Notification" 
        component={() => <TabScreen title="알림설정" />}
        options={{ title: '알림설정' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={() => <TabScreen title="설정" />}
        options={{ title: '설정' }}
      />
    </Tab.Navigator>
  );
};

// 앱 메인
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen 
          name="UserAgreement" 
          component={UserAgreementScreen}
          options={{ 
            headerShown: true,
            title: '이용약관',
            headerLeft: null 
          }} 
        />
        <Stack.Screen name="Home" component={HomeTabs} />
        <Stack.Screen 
          name="AuctionRegistration" 
          component={AuctionRegistrationScreen}
          options={{ 
            headerShown: true,
            title: '팔기'
          }} 
        />
        <Stack.Screen 
          name="AuctionSearch" 
          component={AuctionSearchScreen}
          options={{
            headerShown: true,
            title: '사기',
            headerBackTitle: '뒤로',
          }}
        />
        <Stack.Screen 
          name="AuctionDetail" 
          component={AuctionDetailScreen}
          options={{
            headerShown: true,
            title: '경매 상세정보',
            headerBackTitle: '뒤로',
          }}
        />
        <Stack.Screen 
          name="AuctionSelectBid" 
          component={AuctionSelectBidScreen}
          options={{
            headerShown: true,
            title: '낙찰하기',
            headerBackTitle: '뒤로',
          }}
        />
        <Stack.Screen 
          name="AuctionBidAccept" 
          component={AuctionBidAcceptScreen}
          options={{
            headerShown: true,
            title: '낙찰하기',
            headerBackTitle: '뒤로',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
