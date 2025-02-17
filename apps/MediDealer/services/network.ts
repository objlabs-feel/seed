import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cookies } from '@react-native-cookies/cookies';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const apiClient = axios.create({
    baseURL: 'https://api.example.com',
    timeout: 10000,
});

// 요청 인터셉터
// apiClient.interceptors.request.use(
//     (config: AxiosRequestConfig) => {
//     // 토큰 추가 등
//     const cookies = await Cookies.get('https://api.example.com');
//     config.headers.Cookie = cookies ? cookies : '';
//     return config;
//     },
//     (error: any) => Promise.reject(error)
// );

// axios 인터셉터 설정
axios.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('@MediDealer:authToken');
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
        // 에러 처리
        return Promise.reject(error);
    }
);

export default apiClient;