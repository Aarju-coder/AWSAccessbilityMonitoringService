import {
  DeploymentStack,
  DeploymentStackProps,
  LambdaAsset
} from '@amzn/pipelines';
import { ApigatewayStack } from './helpers/apigatewayStack';
import { Construct } from 'constructs';
import { AlarmsProps } from '../models/props';
import { aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';
import {
  LAMBDA_EXECUTION_ERROR,
  LAMBDA_EXECUTION_SUCCESS,
  LAMBDA_EXECUTION_LATENCY,
  LAMBDA_REQUEST_THROTTLES,
  API_GATEWAY_5XX_RATE,
  API_GATEWAY_4XX_RATE,
  API_GATEWAY_REQUEST_THROTTLE
} from '../constants/serviceConstants';

import { AccessibilityResultsAlarmsProps } from '../models/props';
export class AlarmsStack extends DeploymentStack {
  constructor(
    scope: Construct,
    id: string,
    props: AccessibilityResultsAlarmsProps,
    alarmProps: AlarmsProps
  ) {
    super(scope, id, props);
  
    //The alarm will trigger when the error rate is greater than 5 over the evaluation period of 1
    new cloudwatch.Alarm(this, LAMBDA_EXECUTION_ERROR, {
      alarmName: LAMBDA_EXECUTION_ERROR,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 5,
      evaluationPeriods: 1,
      metric: alarmProps.lambda.metricErrors()
    });
    //Alarm for monitoring the latency of the Lambda function
    new cloudwatch.Alarm(this, LAMBDA_EXECUTION_LATENCY, {
      alarmName: LAMBDA_EXECUTION_LATENCY,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 5000,
      evaluationPeriods: 1,
      metric: alarmProps.lambda.metricDuration()
    });
    //Alarm for monitoring the Lambda function throttles
    new cloudwatch.Alarm(this, LAMBDA_REQUEST_THROTTLES, {
      alarmName: LAMBDA_REQUEST_THROTTLES,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 3,
      evaluationPeriods: 1,
      metric: alarmProps.lambda.metricThrottles()
    });
    //Alarm for the 5XX error rate of POST method
    new cloudwatch.Alarm(this, API_GATEWAY_5XX_RATE, {
      alarmName: API_GATEWAY_5XX_RATE,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 3,
      evaluationPeriods: 1,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '5XXError',
        dimensionsMap: {
          ApiName: alarmProps.api.restApiName,
          Stage: alarmProps.api.deploymentStage.stageName
        }
      })
    });
    //Alarm for the 4XX error rate of POST method
    new cloudwatch.Alarm(this, API_GATEWAY_4XX_RATE, {
      alarmName: API_GATEWAY_4XX_RATE,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 3,
      evaluationPeriods: 1,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '4XXError',
        dimensionsMap: {
          ApiName: alarmProps.api.restApiName,
          Stage: alarmProps.api.deploymentStage.stageName
        }
      })
    });
    //Alarm for monitoring the number of requests that are throttled by API gateway
    new cloudwatch.Alarm(this, API_GATEWAY_REQUEST_THROTTLE, {
      alarmName: API_GATEWAY_REQUEST_THROTTLE,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 3,
      evaluationPeriods: 1,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: 'ThrottledRequests',
        dimensionsMap: {
          ApiName: alarmProps.api.restApiName,
          Method: 'All'
        },
        statistic: 'Sum'
      })
    });

    // 1. Alarm for monitoring write request throttles
    new cloudwatch.Alarm(this, 'MyDynamoDBTableWriteThrottlesAlarm', {
      alarmName: 'MyDynamoDBTableWriteThrottlesAlarm',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: 1,
      metric: alarmProps.dynamoDb.metric('WriteThrottleEvents'),
      threshold: 3,
      alarmDescription:
        'This metric is emitted when write requests are throttled by DynamoDB'
    });
    //2. Alarm for monitoring read request throttles
    new cloudwatch.Alarm(this, 'MyDynamoDBTableReadThrottlesAlarm', {
      alarmName: 'MyDynamoDBTableReadThrottlesAlarm',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: 1,
      metric: alarmProps.dynamoDb.metric('ReadThrottleEvents'),
      threshold: 3,
      alarmDescription:
        'This metric is emitted when read requests are throttled by DynamoDB'
    });
  }
}
