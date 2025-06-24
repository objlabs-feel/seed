import { BaseRequestDto, BaseResponseDto, SearchRequestDto, PaginationResponseDto, BaseDto } from './common.dto';

/**
 * 알림 정보 생성 요청 DTO
 */
export interface CreateNotificationInfoRequestDto extends BaseRequestDto {
  user_id: number;
  device_type: string;
  device_os: string;
  device_token: string;
  permission_status: number;
  noti_notice: boolean;
  noti_event: boolean;
  noti_sms: boolean;
  noti_email: boolean;
  noti_auction: boolean;
  noti_favorite: boolean;
  noti_set: boolean;
}

/**
 * 알림 정보 업데이트 요청 DTO
 */
export interface UpdateNotificationInfoRequestDto extends BaseRequestDto {
  device_type?: string;
  device_os?: string;
  device_token?: string;
  permission_status?: number;
  noti_notice?: boolean;
  noti_event?: boolean;
  noti_sms?: boolean;
  noti_email?: boolean;
  noti_auction?: boolean;
  noti_favorite?: boolean;
  noti_set?: boolean;
  status?: number;
}

/**
 * 알림 정보 응답 DTO
 */
export interface NotificationInfoResponseDto extends BaseResponseDto {
  user_id: string;
  device_type: number;
  device_os: number;
  device_token: string;
  permission_status?: number | null;
  noti_notice?: number | null;
  noti_event?: number | null;
  noti_sms?: number | null;
  noti_email?: number | null;
  noti_auction?: number | null;
  noti_favorite?: number | null;
  noti_set?: any | null;
}

/**
 * 알림 정보 목록 DTO
 */
export interface NotificationInfoListDto {
  id: number;
  user_id: number;
  device_type: string;
  device_os: string;
  device_token: string;
  permission_status: number;
  noti_notice: boolean;
  noti_event: boolean;
  noti_sms: boolean;
  noti_email: boolean;
  noti_auction: boolean;
  noti_favorite: boolean;
  noti_set: boolean;
  status: number | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * 알림 메시지 생성 요청 DTO
 */
export interface CreateNotificationMessageRequestDto extends BaseRequestDto {
  user_id: number;
  title: string;
  body: string;
  data?: any;
  group_id?: number;
}

/**
 * 알림 메시지 업데이트 요청 DTO
 */
export interface UpdateNotificationMessageRequestDto extends BaseRequestDto {
  title?: string;
  body?: string;
  data?: any;
  is_read?: boolean;
  group_id?: number;
  read_at?: string;
  status?: number;
}

/**
 * 알림 메시지 응답 DTO
 */
export interface NotificationMessageResponseDto extends BaseResponseDto {
  user_id: string;
  title: string;
  body: string;
  data?: any | null;
  is_read: boolean;
  group_id?: string | null;
  read_at?: string | null;
}

/**
 * 알림 메시지 목록 페이지네이션 응답 DTO
 */
export interface NotificationMessageListDto extends PaginationResponseDto<NotificationMessageResponseDto> {
  unreadCount: number;
}

/**
 * 알림 설정 업데이트 요청 DTO
 */
export interface UpdateNotificationSettingsRequestDto {
  noti_notice?: number;
  noti_event?: number;
  noti_sms?: number;
  noti_email?: number;
  noti_auction?: number;
  noti_favorite?: number;
  noti_set?: any;
}

/**
 * 알림 메시지 읽음 처리 요청 DTO
 */
export interface MarkNotificationAsReadRequestDto {
  message_ids: string[];
}

/**
 * 알림 메시지 읽음 처리 응답 DTO
 */
export interface MarkNotificationAsReadResponseDto {
  success: boolean;
  updated_count: number;
  failed_ids?: string[];
}

/**
 * 푸시 알림 전송 요청 DTO
 */
export interface SendPushNotificationRequestDto {
  user_ids: string[];
  title: string;
  body: string;
  data?: any;
  group_id?: string;
}

/**
 * 푸시 알림 전송 응답 DTO
 */
export interface SendPushNotificationResponseDto {
  success: boolean;
  sent_count: number;
  failed_count: number;
  failed_user_ids?: string[];
  notification_ids: string[];
}

/**
 * 알림 검색 요청 DTO
 */
export interface NotificationSearchRequestDto extends SearchRequestDto {
  user_id?: string;
  is_read?: boolean;
  group_id?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * 알림 통계 응답 DTO
 */
export interface NotificationStatisticsResponseDto {
  total_messages: number;
  unread_messages: number;
  read_messages: number;
  total_users_with_notifications: number;
  messages_sent_today: number;
  messages_sent_this_week: number;
  messages_sent_this_month: number;
}

/**
 * 알림 그룹 메시지 응답 DTO
 */
export interface NotificationGroupResponseDto {
  group_id: string;
  title: string;
  body: string;
  total_count: number;
  unread_count: number;
  latest_message: NotificationMessageResponseDto;
  messages: NotificationMessageResponseDto[];
}

export interface NotificationInfoDto extends BaseDto {
  user_id: number;
  device_type: string;
  device_os: string;
  device_token: string;
  permission_status: number;
  noti_notice: boolean;
  noti_event: boolean;
  noti_sms: boolean;
  noti_email: boolean;
  noti_auction: boolean;
  noti_favorite: boolean;
  noti_set: boolean;
  user: any | null; // UserDto로 변경 필요
}

export interface NotificationMessageDto extends BaseDto {
  user_id: number;
  title: string;
  body: string;
  data: any | null;
  is_read: boolean;
  group_id: number | null;
  read_at: string | null;
  user: any | null; // UserDto로 변경 필요
}

export interface NotificationInfoSearchRequestDto {
  user_id?: number;
  device_type?: string;
  device_os?: string;
  permission_status?: number;
  status?: number;
  page?: number;
  limit?: number;
}

export interface NotificationMessageSearchRequestDto {
  user_id?: number;
  title?: string;
  is_read?: boolean;
  group_id?: number;
  status?: number;
  page?: number;
  limit?: number;
} 