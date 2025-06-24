import type { NotificationInfo, NotificationMessage } from '../types/models';
import type {
  NotificationInfoResponseDto,
  NotificationInfoListDto,
  NotificationMessageResponseDto,
  NotificationMessageListDto,
  NotificationGroupResponseDto
} from '../types/dto';
import { bigintToString, dateToString, transformArray } from './common.transformer';

/**
 * NotificationInfo 모델을 NotificationInfoResponseDto로 변환
 */
export function toNotificationInfoResponseDto(
  notificationInfo: NotificationInfo
): NotificationInfoResponseDto {
  return {
    id: bigintToString(notificationInfo.id) || 'temp-id',
    created_at: dateToString(notificationInfo.created_at),
    updated_at: dateToString(notificationInfo.updated_at),
    status: notificationInfo.status,
    user_id: bigintToString(notificationInfo.user_id)!,
    device_type: notificationInfo.device_type,
    device_os: notificationInfo.device_os,
    device_token: notificationInfo.device_token,
    permission_status: notificationInfo.permission_status,
    noti_notice: notificationInfo.noti_notice,
    noti_event: notificationInfo.noti_event,
    noti_sms: notificationInfo.noti_sms,
    noti_email: notificationInfo.noti_email,
    noti_auction: notificationInfo.noti_auction,
    noti_favorite: notificationInfo.noti_favorite,
    noti_set: notificationInfo.noti_set,
  };
}

/**
 * NotificationInfo 모델을 NotificationInfoListDto로 변환
 */
export function toNotificationInfoListDto(
  notificationInfo: NotificationInfo
): NotificationInfoListDto {
  return {
    id: Number(notificationInfo.id),
    user_id: Number(notificationInfo.user_id),
    device_type: String(notificationInfo.device_type),
    device_os: String(notificationInfo.device_os),
    device_token: notificationInfo.device_token,
    permission_status: notificationInfo.permission_status ?? 0,
    noti_notice: Boolean(notificationInfo.noti_notice),
    noti_event: Boolean(notificationInfo.noti_event),
    noti_sms: Boolean(notificationInfo.noti_sms),
    noti_email: Boolean(notificationInfo.noti_email),
    noti_auction: Boolean(notificationInfo.noti_auction),
    noti_favorite: Boolean(notificationInfo.noti_favorite),
    noti_set: Boolean(notificationInfo.noti_set),
    status: notificationInfo.status,
    created_at: dateToString(notificationInfo.created_at),
    updated_at: dateToString(notificationInfo.updated_at),
  };
}

/**
 * NotificationMessage 모델을 NotificationMessageResponseDto로 변환
 */
export function toNotificationMessageResponseDto(
  notificationMessage: NotificationMessage
): NotificationMessageResponseDto {
  return {
    id: bigintToString(notificationMessage.id)!,
    created_at: dateToString(notificationMessage.created_at) ?? '',
    updated_at: dateToString(notificationMessage.updated_at) ?? '',
    status: notificationMessage.status,
    user_id: bigintToString(notificationMessage.user_id)!,
    title: notificationMessage.title,
    body: notificationMessage.body,
    data: notificationMessage.data,
    is_read: notificationMessage.is_read,
    group_id: bigintToString(notificationMessage.group_id),
    read_at: dateToString(notificationMessage.read_at),
  };
}

/**
 * NotificationMessage 모델을 NotificationMessageListDto로 변환
 */
export function toNotificationMessageListDto(
  messages: NotificationMessage[],
  total: number,
  page: number,
  limit: number
): NotificationMessageListDto {
  const unreadCount = messages.filter(msg => !msg.is_read).length;
  return {
    data: messages.map(msg => ({
      id: bigintToString(msg.id)!,
      created_at: dateToString(msg.created_at) ?? '',
      updated_at: dateToString(msg.updated_at) ?? '',
      status: msg.status,
      user_id: bigintToString(msg.user_id)!,
      title: msg.title,
      body: msg.body,
      data: msg.data,
      is_read: msg.is_read,
      group_id: bigintToString(msg.group_id),
      read_at: dateToString(msg.read_at),
    })),
    unreadCount,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * NotificationMessage 배열을 그룹별로 정리하여 NotificationGroupResponseDto로 변환
 */
export function toNotificationGroupResponseDto(
  groupId: string,
  messages: NotificationMessage[]
): NotificationGroupResponseDto {
  if (messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  // 최신 메시지를 기준으로 정렬
  const sortedMessages = messages.sort(
    (a, b) => (dateToString(a.created_at) ?? '').localeCompare(dateToString(b.created_at) ?? '')
  );

  const latestMessage = sortedMessages[0]!;
  const unreadCount = messages.filter(msg => !msg.is_read).length;

  return {
    group_id: groupId,
    title: latestMessage.title,
    body: latestMessage.body,
    total_count: messages.length,
    unread_count: unreadCount,
    latest_message: toNotificationMessageResponseDto(latestMessage),
    messages: transformArray(sortedMessages, toNotificationMessageResponseDto) || [],
  };
}

/**
 * 배열 변환 함수들
 */
export function toNotificationInfoListDtoArray(
  notificationInfos: NotificationInfo[]
): NotificationInfoListDto[] {
  return notificationInfos.map(toNotificationInfoListDto);
}

export function toNotificationMessageListDtoArray(
  messages: NotificationMessage[],
  total: number,
  page: number,
  limit: number
): NotificationMessageListDto {
  return toNotificationMessageListDto(messages, total, page, limit);
}

/**
 * 알림 메시지를 그룹별로 그룹화하는 헬퍼 함수
 */
export function groupNotificationMessages(
  messages: NotificationMessage[]
): Record<string, NotificationMessage[]> {
  return messages.reduce((groups, message) => {
    const groupId = bigintToString(message.group_id) || 'default';
    if (!groups[groupId]) {
      groups[groupId] = [];
    }
    groups[groupId].push(message);
    return groups;
  }, {} as Record<string, NotificationMessage[]>);
}

/**
 * 그룹화된 알림 메시지를 NotificationGroupResponseDto 배열로 변환
 */
export function toNotificationGroupResponseDtoArray(
  groupedMessages: Record<string, NotificationMessage[]>
): NotificationGroupResponseDto[] {
  return Object.entries(groupedMessages).map(([groupId, messages]) =>
    toNotificationGroupResponseDto(groupId, messages)
  );
} 