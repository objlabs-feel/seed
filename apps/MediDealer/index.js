/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';

// 경고 무시 설정 (개발용, 실제 문제를 디버깅할 때는 제거)
LogBox.ignoreLogs([
  'RCTBridge required dispatch_sync to load RCTDevLoadingView',
  'Remote debugger is in a background tab which may cause apps to perform slowly'
]);

AppRegistry.registerComponent(appName, () => App);
