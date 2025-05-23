import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from './endpoint';
import '../network';  // 인터셉터가 설정된 axios import
import { IAuctionItem } from '@repo/shared';
const API_URL = 'http://192.168.45.219:3000/api/v1'; // 개발용 API
// const API_URL = 'http://192.168.219.5:3000/api/v1'; // 개발용 API
// const API_URL = 'https://www.medidealer.co.kr/api/v1'; // 실제 API URL로 변경 필요
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

interface SearchAuctionParams {
  deviceTypes?: string[];
  areas?: string[];
  departments?: string[];
  page?: number;
  limit?: number;
}

interface SearchAuctionResponse {
  items: IAuctionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const searchAuction = async (params: SearchAuctionParams = {}): Promise<SearchAuctionResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.deviceTypes?.length) {
      params.deviceTypes.forEach(type => queryParams.append('deviceTypes', type));
    }
    if (params.areas?.length) {
      params.areas.forEach(area => queryParams.append('areas', area));
    }
    if (params.departments?.length) {
      params.departments.forEach(dept => queryParams.append('departments', dept));
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axios.get(`${API_URL}${ENDPOINTS.AUCTION_SEARCH}?${queryParams.toString()}`);
    console.log('Search response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in searchAuction:', error);
    throw error;
  }
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

export const setNotification = async (notificationData: any) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.NOTIFICATION}`, notificationData);
  return response.data;
};

export const getNotification = async () => {
  const response = await axios.get(`${API_URL}${ENDPOINTS.NOTIFICATION}`);
  return response.data;
};

export const updateNotification = async (notificationData: any) => {
  const response = await axios.put(`${API_URL}${ENDPOINTS.NOTIFICATION}`, notificationData);
  return response.data;
};

export const getNotificationList = async () => {
  const response = await axios.get(`${API_URL}${ENDPOINTS.NOTIFICATION}/list`);
  return response.data;
};

export const setReadNotification = async (notificationId: string) => {
  const response = await axios.put(`${API_URL}${ENDPOINTS.NOTIFICATION}/${notificationId}`);
  return response.data;
};

export const setReadAllNotification = async () => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.NOTIFICATION}/list`);
  return response.data;
};

export const getMyDevices = async ({
  deviceTypeId,
  departmentId,
  manufacturerId,
  page = 1,
  limit = 10
}: {
  deviceTypeId?: number;
  departmentId?: number;
  manufacturerId?: number;
  page?: number;
  limit?: number;
} = {}) => {
  let url = `${API_URL}${ENDPOINTS.MY_DEVICES}`;

  // 쿼리 파라미터 구성
  const params = new URLSearchParams();
  if (deviceTypeId) params.append('deviceTypeId', deviceTypeId.toString());
  if (departmentId) params.append('departmentId', departmentId.toString());
  if (manufacturerId) params.append('manufacturerId', manufacturerId.toString());
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  // 쿼리 파라미터가 있으면 URL에 추가
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await axios.get(url);
  return response.data;
};

export const getAuctionCount = async () => {
  const response = await axios.get(`${API_URL}${ENDPOINTS.AUCTION_ITEM}/count`);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await axios.get(`${API_URL}${ENDPOINTS.USER}`);
  return response.data;
};

export const deleteMyProfile = async () => {
  const response = await axios.delete(`${API_URL}${ENDPOINTS.USER}`);
  return response.data;
};

// 의료기 등록 API
export const setProduct = async (productData: any) => {
  const response = await axios.post(`${API_URL}${ENDPOINTS.MY_DEVICES}`, productData);
  return response.data;
};

// 의료기 수정 API
export const updateProduct = async (id: string, productData: any) => {
  const response = await axios.put(`${API_URL}${ENDPOINTS.MY_DEVICES}/${id}`, productData);
  return response.data;
};


