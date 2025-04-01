/**
 * 컴포넌트 간 이벤트 통신을 위한 EventEmitter 구현
 */
import { NativeEventEmitter, NativeModules } from 'react-native';

// React Native 이벤트 이미터 생성 (NativeEventEmitter 사용)
// 필요에 따라 이 모듈을 구현할 필요는 없음 - 단순 이벤트 버스 역할
const dummyModule = NativeModules.EventEmitterModule || new Object();
const eventEmitter = new NativeEventEmitter(dummyModule);

export { eventEmitter }; 