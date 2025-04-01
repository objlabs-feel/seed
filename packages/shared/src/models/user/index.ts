export interface IUser {
  id: string;
  created_at: string;
  profile_id: string | null;
  status: number; 
  device_token: string | null;
  // company_id: string | null;
  // ... 기타 사용자 정보
}

export interface IProfile {
  id: number;
  name: string;
  email: string;
  mobile: string;
}

export interface ISecretInfo {
  bankAccount: string | null;
  bankCode: string | null;
  ownerName: string | null;
  businessEmail: string | null;
  businessNo: string | null;
  businessTel: string | null;
  businessMobile: string | null;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

export interface IDepartment {
  id: number
  code: string
  name: string
  description: string | null
  img: string | null
}

export interface IDeviceType {
  id: number
  code: string
  name: string
  description: string | null
  img: string | null
  department_id: number | null
}

export interface ICompany {
  id: number;
  name: string;
  business_no: string;
  business_tel: string;
  license_img: string | null;
  owner_id: number | null;
  related_members: any[];
  institute_members: any[];
  created_at: string;
  updated_at: string;
  company_type: number;
  business_mobile: string | null;
  secret_info?: ISecretInfo;
  zipcode: string | null;
  address: string | null;
  address_detail: string | null;
  area: string | null;
  profile?: IProfile;
}

export interface IManufacturer {
  id: number;
  name: string;
  device_types: any[];
  img: string | null;
  description: string | null;
}

export interface INotificationMessage {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  read_at: string | null;
}

export interface INotificationInfo {
  id: number;
  user_id: number;
  device_type: number;
  device_os: number;
  device_token: string;
  permission_status: number;
  noti_notice: number;
  noti_event: number;
  noti_sms: number;
  noti_email: number;
  noti_auction: number;
  noti_favorite: number;
  noti_set: {
    topics: string[];
    user_type: string;
  };
  created_at: string;
  updated_at: string;
}

export interface IUserProfile {
  id: string;
  device_token: string | null;
  profile_id?: number;
  status: number;
  created_at: string;
  updated_at: string;
  profile?: IProfile;
  company?: ICompany;
}