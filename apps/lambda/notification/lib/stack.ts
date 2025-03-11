import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { join } from 'path';

export class NotificationStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SQS 큐 생성
    const queue = new sqs.Queue(this, 'NotificationQueue', {
      queueName: 'notification-queue',
      visibilityTimeout: cdk.Duration.seconds(30)
    });

    // Lambda 함수 생성
    console.log('---------------input env-----------------');
    console.log(process.env.DATABASE_URL);
    console.log(process.env.FIREBASE_PROJECT_ID);
    console.log(process.env.FIREBASE_CREDENTIALS);
    console.log('--------------------------------');
    const notificationHandler = new lambda.Function(this, 'NotificationHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(join(__dirname, '../dist')),
      environment: {
        QUEUE_URL: queue.queueUrl,
        DATABASE_URL: process.env.DATABASE_URL || '',
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
        FIREBASE_CREDENTIALS: process.env.FIREBASE_CREDENTIALS || ''
      }
    });

    // SQS -> Lambda 트리거 설정
    notificationHandler.addEventSource(new SqsEventSource(queue));
  }
} 