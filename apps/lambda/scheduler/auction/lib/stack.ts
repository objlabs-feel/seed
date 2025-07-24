import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AuctionSchedulerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda 함수 생성
    const auctionSchedulerFunction = new lambda.Function(this, 'AuctionSchedulerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist'),
      timeout: cdk.Duration.seconds(300), // 5분
      memorySize: 256,
      environment: {
        API_BASE_URL: process.env.API_BASE_URL || 'https://www.medidealer.co.kr',
        API_KEY: process.env.API_KEY || '',
      },
    });

    // Lambda 함수에 필요한 권한 추가
    auctionSchedulerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    // EventBridge 규칙 생성 - 매 1분마다 경매 처리
    const expiredAuctionsRule = new events.Rule(this, 'ExpiredAuctionsRule', {
      schedule: events.Schedule.cron({
        minute: '*',
        hour: '*',
        day: '*',
        month: '*',
        year: '*',
      }),
      targets: [
        new targets.LambdaFunction(auctionSchedulerFunction, {
          event: events.RuleTargetInput.fromObject({
            'detail-type': 'auction.expired',
            source: 'auction.scheduler',
            detail: {
              action: 'process-expired-auctions',
              timestamp: events.EventField.time,
            },
          }),
        }),
      ],
    });

    // EventBridge 규칙 생성 - 매시간 경매 리마인더 전송
    // const reminderRule = new events.Rule(this, 'ReminderRule', {
    //   schedule: events.Schedule.cron({
    //     minute: '0',
    //     hour: '*',
    //     day: '*',
    //     month: '*',
    //     year: '*',
    //   }),
    //   targets: [
    //     new targets.LambdaFunction(auctionSchedulerFunction, {
    //       event: events.RuleTargetInput.fromObject({
    //         'detail-type': 'auction.reminder',
    //         source: 'auction.scheduler',
    //         detail: {
    //           action: 'send-reminders',
    //           timestamp: events.EventField.time,
    //         },
    //       }),
    //     }),
    //   ],
    // });

    // EventBridge 규칙 생성 - 매주 일요일 새벽 2시에 정리 작업
    // const cleanupRule = new events.Rule(this, 'CleanupRule', {
    //   schedule: events.Schedule.cron({
    //     minute: '0',
    //     hour: '2',
    //     day: '1', // 일요일
    //     month: '*',
    //     year: '*',
    //   }),
    //   targets: [
    //     new targets.LambdaFunction(auctionSchedulerFunction, {
    //       event: events.RuleTargetInput.fromObject({
    //         'detail-type': 'auction.cleanup',
    //         source: 'auction.scheduler',
    //         detail: {
    //           action: 'cleanup-old-data',
    //           timestamp: events.EventField.time,
    //         },
    //       }),
    //     }),
    //   ],
    // });

    // CloudWatch 로그 그룹 생성
    new cdk.CfnOutput(this, 'FunctionName', {
      value: auctionSchedulerFunction.functionName,
      description: 'Auction Scheduler Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'FunctionArn', {
      value: auctionSchedulerFunction.functionArn,
      description: 'Auction Scheduler Lambda Function ARN',
    });
  }
} 