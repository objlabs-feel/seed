import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from './endpoint';
import '../network';  // 인터셉터가 설정된 axios import

const API_URL = 'http://192.168.0.2:3000/api/v1'; // 개발용 API
// const API_URL = 'http://192.168.219.5:3000/api/v1'; // 개발용 API
// const API_URL = 'https://www.medidealer.com/api/v1'; // 실제 API URL로 변경 필요
// const API_URL = 'http://16.184.8.234:3000/api/v1'; // 테스트용 API

interface AuthResponse {
  token: string;
  user: {
    id: string;          // BigInt가 문자열로 변환됨
    created_at: string;
    profile_id: string | null;  // nullable
    status: number;
  };
}

export const checkIn = async (deviceToken: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}${ENDPOINTS.CHECK_IN}`, {
      device_token: deviceToken
    });

    if (response.data && response.data.user) {
      // 사용자 데이터만 저장
      await AsyncStorage.setItem('@MediDealer:userData', JSON.stringify(response.data.user));
    } else {
      throw new Error('Invalid response data');
    }

    return response.data;
  } catch (error) {
    console.error('Device checkin error:', error);
    throw error;
  }
};

export const verifyUser = async (userId: string, deviceToken: string): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}${ENDPOINTS.USER_VERIFY}`, {
    user_id: userId,
    device_token: deviceToken
  });
  // 토큰 저장 필요
  await AsyncStorage.setItem('@MediDealer:authToken', response.data.token);
  return response.data;
};

export const registerAuction = async (auctionData: any) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.AUCTION_REGISTER}`, auctionData);
  return response.data;
};

export const getConstants = async () => {
  const response = await axios.get(`${API_URL}${ENDPOINTS.CONSTANTS}`);
  return response.data;
};

export const searchAuction = async (query: string) => {
  const response = await axios.get(`${API_URL}${ENDPOINTS.AUCTION_SEARCH}?keyword=${query}`);
  return response.data;
};

export const getAuctionDetail = async (id: string) => { 
  const response = await axios.get(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}`);
  console.log('Auction detail response:', response.data);
  return response.data;
};

export const bidAuction = async (id: string, value: number) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/bid`, { value });
  return response.data;
};

export const getAuctionHistory = async (id: string) => {
  const response = await axios.get(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/history`);
  return response.data;
};

export const getAuctionSelectBidForSeller = async (id: string, formData: any) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/bid/seller`, formData);
  return response.data;
};

export const getAuctionContactForSeller = async (id: string, formData: any) => {
  const response = await axios.put(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/bid/seller`, formData);
  return response.data;
};

export const getAuctionCompleteForSeller = async (id: string) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/complete`);
  return response.data;
};

export const getAuctionBidAcceptForBuyer = async (id: string, formData: any) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/bid/buyer`, formData);
  return response.data;
};

export const getAuctionContactForBuyer = async (id: string, formData: any) => {
  const response = await axios.put(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/bid/buyer`, formData);
  return response.data;
};

export const getAuctionConfirmForBuyer = async (id: string) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/accept`);
  return response.data;
};

export const getAuctionCompleteForBuyer = async (id: string) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/${id}/complete`);
  return response.data;
};