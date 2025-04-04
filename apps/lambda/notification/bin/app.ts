#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NotificationStack } from '../lib/stack';

const app = new cdk.App();
new NotificationStack(app, 'NotificationStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-2'
  }
});