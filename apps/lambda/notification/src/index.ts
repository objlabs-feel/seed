import { SQSEvent, SQSHandler } from 'aws-lambda';
import * as admin from 'firebase-admin';
// import { SSMClient } from "@aws-sdk/client-ssm";
import * as dotenv from 'dotenv';
dotenv.config();

// 타입 정의
interface BaseNotificationMessage {
  title: string;
  body: string;
  data?: {
    type: 'AUCTION' | 'POLICY' | 'MARKETING' | 'SYSTEM';
    targetId?: string;
    [key: string]: any;
  };
}

interface SingleUserNotification extends BaseNotificationMessage {
  type: 'SINGLE';
  userToken: string;
}

interface MultiUserNotification extends BaseNotificationMessage {
  type: 'MULTI';
  userTokens: string[];
}

interface BroadcastNotification extends BaseNotificationMessage {
  type: 'BROADCAST';
}

type NotificationMessage = SingleUserNotification | MultiUserNotification | BroadcastNotification;

interface FCMResponse {
  successCount: number;
  failureCount: number;
  responses: admin.messaging.SendResponse[];
}

// 초기화
// const ssm = new SSMClient({ region: "ap-northeast-2" });

// Firebase 초기화
let firebaseInitialized = false;
function initializeFirebase() {
  if (!firebaseInitialized) {
    const credentials = process.env.FIREBASE_CREDENTIALS
      ? JSON.parse(process.env.FIREBASE_CREDENTIALS)
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    firebaseInitialized = true;
  }
}

// 메인 핸들러
export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log('Received event:', JSON.stringify(event));

  try {
    // Firebase 초기화
    initializeFirebase();

    // 메시지 처리
    const messages = event.Records.map(record => {
      try {
        return JSON.parse(record.body);
      } catch (error) {
        console.error('Error parsing message:', error);
        return null;
      }
    }).filter(Boolean);

    await Promise.all(messages.map(processMessage));

    console.log('All messages processed successfully');
  } catch (error) {
    console.error('Error processing messages:', error);
    throw error;
  } finally {

  }
};

// 메시지 처리
async function processMessage(message: NotificationMessage) {
  console.log('Processing message:', message);

  try {
    if (message.type === 'BROADCAST') {
      await handleBroadcastNotification(message);
    } else if (message.type === 'MULTI') {
      await handleMultiUserNotification(message);
    } else {
      await handleSingleUserNotification(message);
    }
  } catch (error) {
    console.error('Error processing notification:', error);
  }
}

// 브로드캐스트 알림 처리
async function handleBroadcastNotification(message: any) {
  console.log('Sending broadcast notification:', message);

  // topic을 사용하여 브로드캐스트 알림 전송
  await admin.messaging().send({
    topic: 'all', // 모든 사용자에게 전송
    notification: {
      title: message.title,
      body: message.body || message.message // body 또는 message 필드 사용
    },
    data: message.data || {}
  });

  console.log('Broadcast notification sent successfully');
}

// 다중 사용자 알림 처리
async function handleMultiUserNotification(message: MultiUserNotification) {
  console.log('Sending multi-user notification:', message);

  const tokens: string[] = message.userTokens;

  if (tokens.length > 0) {
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title: message.title,
        body: message.body
      },
      data: message.data || {}
    });
  }

  console.log('Multi-user notification sent successfully');
}

// 단일 사용자 알림 처리
async function handleSingleUserNotification(message: SingleUserNotification) {
  console.log('Sending single user notification:', message);

  const token = message.userToken;

  if (token) {
    await admin.messaging().send({
      token,
      notification: {
        title: message.title,
        body: message.body
      },
      data: message.data || {}
    });
  }

  console.log('Single user notification sent successfully');
}

// 실패한 토큰 처리
async function handleFailedTokens(fcmResponse: FCMResponse, tokens: string[]) {
  if (fcmResponse.failureCount > 0) {
    const failedTokens = fcmResponse.responses
      .map((resp, idx) => (!resp.success ? tokens[idx] : null))
      .filter((token): token is string => token !== null);

    if (failedTokens.length > 0) {
      console.log('Removed failed tokens:', failedTokens);
    }
  }
}
