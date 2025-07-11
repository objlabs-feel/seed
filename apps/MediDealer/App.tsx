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
  TouchableOpacity,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuctionRegistrationScreen from './screens/AuctionRegistrationScreen';
import AntDesign from 'react-native-vector-icons/AntDesign';
import IconTestScreen from './screens/IconTestScreen';

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
import { UserResponseDto } from '@repo/shared';
import { initConstants } from './constants/data';
import AuctionDetailScreen from './screens/AuctionDetailScreen';
import AuctionSelectBidScreen from './screens/AuctionSelectBidScreen';
import AuctionBidAcceptScreen from './screens/AuctionBidAcceptScreen';
import RequestNotificationScreen from './screens/notification/RequestNotificationScreen';
import NotificationHistoryScreen from './screens/notification/NotificationHistoryScreen';
import ChatRoomScreen from './screens/notification/ChatRoomScreen';
import MyDeviceScreen from './screens/MyDeviceScreen';
import MyConsultScreen from './screens/MyConsultScreen';
import SettingNotificationScreen from './screens/SettingNotificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProductDetailScreen from './screens/product/ProductDetailScreen';
import AddProductScreen from './screens/product/AddProductScreen';
import EditProductScreen from './screens/product/EditProductScreen';
import ConsultFeatureScreen from './screens/consult/ConsultFeatureScreen';
import ConsultClosureScreen from './screens/consult/ConsultClosureScreen';
import ConsultOpeningScreen from './screens/consult/ConsultOpeningScreen';
import ConsultRepairScreen from './screens/consult/ConsultRepairScreen';
import ConsultInspectorScreen from './screens/consult/ConsultInspectorScreen';
import SalesHistoryScreen from './screens/user/SalesHistoryScreen';
import PurchaseHistoryScreen from './screens/user/PurchaseHistoryScreen';
import { AuthResponse } from './services/medidealer/api';

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
  IconTest: undefined;
  AuctionRegistration: undefined;
  AuctionSearch: undefined;
  AuctionDetail: { id: string };
  AuctionSelectBid: { id: string };
  AuctionBidAccept: { id: string };
  RequestNotification: undefined;
  Notifications: undefined;
  ChatRoom: { groupId: string };
  DeviceDetail: { id: string };
  ConsultFeature: undefined;
  ConsultClosure: undefined;
  ConsultOpening: undefined;
  ConsultRepair: undefined;
  ConsultInspector: undefined;
  AddProduct: undefined;
  EditProduct: undefined;
  SalesHistory: undefined;
  PurchaseHistory: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// 스플래시 화면
const SplashScreen = ({ navigation }: { navigation: any }) => {
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
          const authResponse: AuthResponse = await checkIn(deviceId);
          console.log('Checkin successful:', authResponse);
          // const verifyResponse: AuthResponse = await verifyUser(authResponse.user.id, deviceId);
          // console.log('Verify successful:', verifyResponse);
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
        
        // 다음 화면으로 이동
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
const UserAgreementScreen = ({ navigation }: { navigation: any }) => {
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
const TabScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title}</Text>
  </View>
);

// 홈 탭 네비게이터
const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#6c757d',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <AntDesign 
              name="home" 
              color={color} 
              size={size} 
              style={{width: size, height: size, textAlign: 'center'}} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="MyMedical" 
        component={MyDeviceScreen}
        options={{ 
          title: '내의료기',
          tabBarIcon: ({ color, size }) => (
            <AntDesign 
              name="medicinebox" 
              color={color} 
              size={size} 
              style={{width: size, height: size, textAlign: 'center'}} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Consulting" 
        component={MyConsultScreen}
        options={{ 
          title: '상담하기',
          tabBarIcon: ({ color, size }) => (
            <AntDesign 
              name="message1" 
              color={color} 
              size={size} 
              style={{width: size, height: size, textAlign: 'center'}} 
            />
          ),
        }}
      />
      {/* <Tab.Screen 
        name="IconTest" 
        component={IconTestScreen}
        options={{ 
          title: '아이콘테스트',
          tabBarIcon: ({ color, size }) => (
            <AntDesign 
              name="search1" 
              color={color} 
              size={size} 
              style={{width: size, height: size, textAlign: 'center'}} 
            />
          ),
        }}
      /> */}
      <Tab.Screen 
        name="Notification" 
        component={SettingNotificationScreen}
        options={{ 
          title: '알림설정',
          tabBarIcon: ({ color, size }) => (
            <AntDesign 
              name="notification" 
              color={color} 
              size={size} 
              style={{width: size, height: size, textAlign: 'center'}} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <AntDesign 
              name="setting" 
              color={color} 
              size={size} 
              style={{width: size, height: size, textAlign: 'center'}} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 앱 메인
const App = () => {
  // 앱이 시작될 때 아이콘 폰트 등록
  useEffect(() => {
    // 아이콘 라이브러리 등록
    // 이렇게 하면 폰트가 로드되었는지 확인 가능
    // console.log('등록된 아이콘 폰트:', AntDesign.getFontFamily());
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Splash"
            screenOptions={({ navigation }: { navigation: any }) => ({
              headerShown: false,
              headerLeft: () => (
                navigation.canGoBack() ? (
                  <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={{ 
                      marginLeft: Platform.OS === 'ios' ? 8 : 0,
                      padding: 8,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <AntDesign 
                      name={Platform.OS === 'ios' ? 'left' : 'arrowleft'} 
                      size={Platform.OS === 'ios' ? 22 : 24} 
                      color="#007bff" 
                    />
                    {Platform.OS === 'ios' && <Text style={{ marginLeft: 5, color: '#007bff', fontSize: 17 }}>뒤로</Text>}
                  </TouchableOpacity>
                ) : undefined
              )
            })}
          >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen 
            name="UserAgreement" 
            component={UserAgreementScreen}
            options={{ 
              headerShown: true,
              title: '이용약관',
              headerLeft: undefined as any 
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
          <Stack.Screen 
            name="RequestNotification" 
            component={RequestNotificationScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="DeviceDetail"
            component={ProductDetailScreen}
            options={{
              headerShown: true,
              title: '의료기기 상세',
              headerBackTitle: '뒤로',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="AddProduct"
            component={AddProductScreen}
            options={{
              headerShown: true,
              title: '의료기 등록',
              headerBackTitle: '뒤로',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="EditProduct"
            component={EditProductScreen}
            options={{
              headerShown: true,
              title: '의료기 수정',
              headerBackTitle: '뒤로',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="ConsultFeature"
            component={ConsultFeatureScreen}
            options={{
              headerShown: true,
              title: '기능 건의/문의하기',
            }}
          />
          <Stack.Screen 
            name="ConsultClosure"
            component={ConsultClosureScreen}
            options={{
              headerShown: true,
              title: '폐업 상담하기',
            }}
          />
          <Stack.Screen 
            name="ConsultOpening"
            component={ConsultOpeningScreen}
            options={{
              headerShown: true,
              title: '개업 상담하기',
            }}
          />
          <Stack.Screen 
            name="ConsultRepair"
            component={ConsultRepairScreen}
            options={{
              headerShown: true,
              title: '의료기 수리 상담하기',
            }}
          />
          <Stack.Screen 
            name="ConsultInspector"
            component={ConsultInspectorScreen}
            options={{
              headerShown: true,
              title: '검사원 온라인 신청',
            }}
          />
          <Stack.Screen 
            name="SalesHistory"
            component={SalesHistoryScreen}
            options={{
              headerShown: true,
              title: '판매이력',
            }}
          />
          <Stack.Screen 
            name="PurchaseHistory"
            component={PurchaseHistoryScreen}
            options={{
              headerShown: true,
              title: '구매이력',
            }}
          />
          <Stack.Screen 
            name="Notifications"
            component={NotificationHistoryScreen}
            options={{
              headerShown: true,
              title: '알림',
              headerBackTitle: '뒤로',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen 
            name="ChatRoom"
            component={ChatRoomScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </GestureHandlerRootView>
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
