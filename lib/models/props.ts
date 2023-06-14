import { DeploymentStackProps } from '@amzn/pipelines';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';

export interface ApigatewayProps extends DynamoDBProps {
  allowTestInvoke: boolean;
  proxy: boolean;
  apiName: string;
  resoucrceName: string;
  method: string[];
}

export interface DynamoDBProps {
  stage: string;
  tableName: string;
  partitionKey: string;
  sortKey: string;
  lambdaFunction: string;
  actionName: string;
}
export interface AlarmsProps {
  lambda: lambda.Function;
  dynamoDb: dynamodb.Table;
  api: apiGateway.RestApi;
}
export interface AccessibilityResultsProps extends DeploymentStackProps {
  stage: string;
}
export interface AccessibilityResultsAlarmsProps extends DeploymentStackProps {
  stage: string;
}
