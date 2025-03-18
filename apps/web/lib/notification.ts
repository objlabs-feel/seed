import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// 타입 정의
interface NotificationOptions {
  type: 'SINGLE' | 'MULTI' | 'BROADCAST';
  title: string;
  body: string;
  data?: {
    type: 'AUCTION' | 'POLICY' | 'MARKETING' | 'SYSTEM';
    targetId?: string;
    [key: string]: any;
  };
}

// interface NotificationOptions {
//   userId: string;
//   title: string;
//   body: string;
//   data?: Record<string, string>;
//   groupId?: string;
// }

export async function sendNotification(options: NotificationOptions) {
  const command = new SendMessageCommand({
    QueueUrl: process.env.AWS_SQS_QUEUE_URL,
    MessageBody: JSON.stringify(options),
  });

  try {
    await sqs.send(command);
  } catch (error) {
    console.error('Error sending message to SQS:', error);
    throw error;
  }
}

// 브로드캐스트 알림 추가
export async function sendBroadcastNotification(title: string, body: string, data?: Record<string, any>) {
  // 먼저 사용 가능한 큐 목록 확인
  await listQueues();

  console.log('AWS Credentials:', {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ? '***' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : 'not set',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? '***' + process.env.AWS_SECRET_ACCESS_KEY.slice(-4) : 'not set'
  });

  const command = new SendMessageCommand({
    QueueUrl: "https://sqs.ap-northeast-2.amazonaws.com/682033503274/notification-queue",
    MessageBody: JSON.stringify({
      type: "BROADCAST",
      title,
      body,
      data: {
        type: "SYSTEM",
        ...data
      }
    })
  });

  try {
    await sqs.send(command);
    console.log("브로드캐스트 메시지 전송 성공!");
  } catch (error) {
    console.error("Error sending broadcast message to SQS:", error);
    throw error;
  }
}
