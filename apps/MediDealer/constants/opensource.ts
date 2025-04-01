export interface OpenSourceInfo {
  name: string;
  version: string;
  license: string;
  description: string;
  link?: string;
}

export const OPEN_SOURCE_LIST: OpenSourceInfo[] = [
  {
    name: 'React Native',
    version: '0.73.4',
    license: 'MIT',
    description: 'React Native는 Facebook에서 개발한 모바일 앱 개발 프레임워크입니다.',
    link: 'https://github.com/facebook/react-native'
  },
  {
    name: 'React Navigation',
    version: '6.1.9',
    license: 'MIT',
    description: 'React Native 앱의 네비게이션을 관리하는 라이브러리입니다.',
    link: 'https://github.com/react-navigation/react-navigation'
  },
  {
    name: 'Firebase',
    version: '10.8.0',
    license: 'Apache-2.0',
    description: 'Google의 모바일 백엔드 서비스로, 푸시 알림, 분석 등을 제공합니다.',
    link: 'https://github.com/firebase/firebase-ios-sdk'
  },
  {
    name: 'AsyncStorage',
    version: '1.21.0',
    license: 'MIT',
    description: 'React Native의 로컬 저장소를 관리하는 라이브러리입니다.',
    link: 'https://github.com/react-native-async-storage/async-storage'
  }
]; 