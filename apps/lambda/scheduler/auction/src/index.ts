import { EventBridgeEvent, Context } from 'aws-lambda';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

// API 호출 설정
interface ApiCallConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// API 호출 결과
interface ApiCallResult {
  success: boolean;
  statusCode: number;
  data?: any;
  error?: string;
  timestamp: string;
}

// 메인 핸들러
export const handler = async (event: EventBridgeEvent<string, any>, context: Context): Promise<void> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));

  try {
    // 이벤트 타입에 따라 다른 API 호출
    const eventType = event['detail-type'] || event.source;
    
    switch (eventType) {
      case 'auction.expired':
        await callExpiredAuctionsApi();
        break;
      case 'auction.reminder':
        await callAuctionReminderApi();
        break;
      case 'auction.cleanup':
        await callAuctionCleanupApi();
        break;
      default:
        console.log(`Unknown event type: ${eventType}`);
        await callDefaultApi(event);
    }

    console.log('API call completed successfully');
  } catch (error) {
    console.error('Error in handler:', error);
    throw error;
  }
};

// 만료된 경매 처리 API 호출
async function callExpiredAuctionsApi(): Promise<ApiCallResult> {
  const config: ApiCallConfig = {
    url: `${process.env.API_BASE_URL}/api/v1/schedule/auction?API_KEY=${process.env.API_KEY}`,
    method: 'GET',
    headers: {},
    timeout: 30000, // 30초
  };

  return await callApi(config);
}

// 경매 리마인더 API 호출
async function callAuctionReminderApi(): Promise<ApiCallResult> {
  const config: ApiCallConfig = {
    url: `${process.env.API_BASE_URL}/api/v1/auctions/send-reminders`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
    timeout: 30000,
  };

  return await callApi(config);
}

// 경매 정리 API 호출
async function callAuctionCleanupApi(): Promise<ApiCallResult> {
  const config: ApiCallConfig = {
    url: `${process.env.API_BASE_URL}/api/v1/auctions/cleanup`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
    timeout: 60000, // 60초
  };

  return await callApi(config);
}

// 기본 API 호출 (커스텀 이벤트용)
async function callDefaultApi(event: EventBridgeEvent<string, any>): Promise<ApiCallResult> {
  const config: ApiCallConfig = {
    url: `${process.env.API_BASE_URL}/api/v1/scheduler/webhook`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
    body: {
      eventType: event['detail-type'] || event.source,
      eventData: event.detail,
      timestamp: new Date().toISOString(),
    },
    timeout: 30000,
  };

  return await callApi(config);
}

// 공통 API 호출 함수
async function callApi(config: ApiCallConfig): Promise<ApiCallResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    console.log(`Calling API: ${config.method} ${config.url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let responseData: any;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    const duration = Date.now() - startTime;
    console.log(`API call completed in ${duration}ms. Status: ${response.status}`);

    if (response.ok) {
      return {
        success: true,
        statusCode: response.status,
        data: responseData,
        timestamp,
      };
    } else {
      return {
        success: false,
        statusCode: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
        data: responseData,
        timestamp,
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`API call failed after ${duration}ms:`, error);

    return {
      success: false,
      statusCode: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

// 테스트용 함수 (로컬 개발 시 사용)
export async function testApiCall(eventType: string): Promise<void> {
  const mockEvent: EventBridgeEvent<string, any> = {
    version: '0',
    id: 'test-id',
    'detail-type': eventType,
    source: 'test.source',
    account: 'test-account',
    time: new Date().toISOString(),
    region: 'ap-northeast-2',
    resources: [],
    detail: {},
  };

  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'test-arn',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: 'test-log-group',
    logStreamName: 'test-log-stream',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  await handler(mockEvent, mockContext);
} 