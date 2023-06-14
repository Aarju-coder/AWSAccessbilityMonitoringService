import { BrazilPackage } from '@amzn/pipelines';
export const SERVICE_NAME = "AccessibilityMonitoringService"
export const REQUEST_TEMPLATES = {
  'application/json': `{ 'statusCode': 200 }`
};
export const SUCCESS_STATUS_CODE = '200';

/* Api Gateway */
export const API_GATEWAY_API_NAME = 'AccessibilityMonitoringAPI';
export const ACCESSIBILITY_RESULTS_API_AUTHORIZER =
  'ResultsReportingAPIAuthorizer';

/* Secret Manager*/
export const ACCESSIBILITY_RESULTS_SECRET_MANAGER =
  'ResultsReportingSecretManager';
export const ACCESSIBILITY_RESULTS_SECRET_ROTATOR =
  'ResultsReportingSecretRotator';
export const ACCESSIBILITY_RESULTS_SECRET_MANAGER_RESOURCE =
  'arn:aws:secretsmanager:us-west-2:242667061050:secret:*';
export const ACCESSIBILITY_RESULTS_SECRET_RANDOM_PASSWORD = [
  'secretsmanager:GetRandomPassword'
];
export const ACCESSIBILITY_RESULTS_SECRET_ROTATOR_POLICY = [
  'secretsmanager:DescribeSecret',
  'secretsmanager:GetSecretValue',
  'secretsmanager:PutSecretValue',
  'secretsmanager:UpdateSecretVersionStage'
];

/* Accessibility Results */
export const ACCESSIBILITY_RESULTS_STACK_NAME = 'service-stack';
export const ACCESSIBILITY_RESULTS_DB_STACK_NAME = 'db-stack';
export const ACCESSIBILITY_RESULTS_API_NAME = 'AccessibilityResultsAPI';
export const ACCESSIBILITY_RESULTS_RESOURCE_NAME = 'createAccessibilityResults';
export const ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME =
  'AccessibilityMonitoringService';
export const ACCESSIBILITY_RESULTS_DEPLOYMENT_DB_STACK_NAME =
  'AccessibilityMonitoringDBService';

/* Alarms */
export const LAMBDA_EXECUTION_ERROR = 'LambdaExecutionErrorAlarm';
export const LAMBDA_REQUEST_THROTTLES = 'LambdaThrottledRequestsAlarm';
export const LAMBDA_EXECUTION_SUCCESS = 'LambdaExecutionSuccessAlarm';
export const LAMBDA_EXECUTION_LATENCY = 'LambdaExecutionLatencyAlarm';
export const DYNAMO_DB_READ_REQUEST_THROTTLE =
  'DyanmoDBTableReadThrottlesAlarm';
export const DYNAMO_DB_WRITE_REQUEST_THROTTLE =
  'DyanmoDBTableWriteThrottlesAlarm';
export const DYNAMO_DB_READ_CAPACITY = 'DynamoDBReadCapacityAlarm';
export const DYNAMO_DB_WRITE_CAPACITY = 'DynamoDBWriteCapacityAlarm';
export const API_GATEWAY_REQUEST_THROTTLE = 'APIGatewayThrottledRequestsAlarm';
export const API_GATEWAY_5XX_RATE = 'Post5XXErrorRateAlarm';
export const API_GATEWAY_4XX_RATE = 'Post4XXErrorRateAlarm';

/* Deployement Stack */
export const DEPLOYMENT_STACK_REGION = 'us-west-2';
export const DEPLOYMENT_STAGE_ALPHA = 'Alpha';

/* Service package */
export const SERVICE_PACKAGE = BrazilPackage.fromProps({
  name: 'AWSAccessibilityMonitoringService',
  majorVersion: '1.0',
  branch: 'mainline'
});
