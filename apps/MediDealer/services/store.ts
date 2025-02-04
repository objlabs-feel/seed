import { Cookies } from '@react-native-cookies/cookies';

// 쿠키 저장
const saveCookie = async (url: string, cookie: string) => {
    await Cookies.set(url, cookie);
};

// 쿠키 삭제
const clearCookies = async (url: string) => {
    await Cookies.clearByName(url);
};