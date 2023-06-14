import { DeploymentStackProps } from '@amzn/pipelines';
import {
  aws_apigateway as apigateway,
  aws_secretsmanager as secretsmanager,
  Duration,
  aws_iam as iam,
  aws_cloudwatch as cloudwatch
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import {
  REQUEST_TEMPLATES,
  SUCCESS_STATUS_CODE,
  API_GATEWAY_API_NAME,
  ACCESSIBILITY_RESULTS_SECRET_MANAGER,
  ACCESSIBILITY_RESULTS_SECRET_ROTATOR_POLICY,
  ACCESSIBILITY_RESULTS_SECRET_RANDOM_PASSWORD,
  ACCESSIBILITY_RESULTS_SECRET_ROTATOR,
  ACCESSIBILITY_RESULTS_API_AUTHORIZER
} from '../../constants/serviceConstants';
import { ApigatewayProps } from '../../models/props';
import { DynamoDBStack } from './dynamoDbStack';
/**
 * Contains a base apigateway class which extends the lambda class
 */
export class ApigatewayStack extends DynamoDBStack {
  public readonly api: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    props: DeploymentStackProps,
    apiGatewayProps: ApigatewayProps
  ) {
    super(scope, id, props, apiGatewayProps);

    const lambdaIntegration = new apigateway.LambdaIntegration(
      this.lambdaFunction,
      {
        allowTestInvoke: apiGatewayProps.allowTestInvoke || true,
        proxy: apiGatewayProps.proxy || true,
        integrationResponses: [
          {
            statusCode: SUCCESS_STATUS_CODE,
            contentHandling: apigateway.ContentHandling.CONVERT_TO_TEXT
          }
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestTemplates: REQUEST_TEMPLATES
      }
    );
    const policy = new iam.Policy(
      this,
      `${ACCESSIBILITY_RESULTS_SECRET_MANAGER}-Policy`,
      {
        statements: [
          new iam.PolicyStatement({
            actions: ACCESSIBILITY_RESULTS_SECRET_ROTATOR_POLICY,
            resources: ['*']
          })
        ]
      }
    );
    const randomPassPolicy = new iam.Policy(
      this,
      `${ACCESSIBILITY_RESULTS_SECRET_MANAGER}-Password`,
      {
        statements: [
          new iam.PolicyStatement({
            actions: ACCESSIBILITY_RESULTS_SECRET_RANDOM_PASSWORD,
            resources: ['*']
          })
        ]
      }
    );
    const secret = new secretsmanager.Secret(
      this,
      `${ACCESSIBILITY_RESULTS_SECRET_MANAGER}Dev`,
      {
        secretName: ACCESSIBILITY_RESULTS_SECRET_MANAGER
      }
    );
    const secretsRotater = this.lambdFunc(
      ACCESSIBILITY_RESULTS_SECRET_ROTATOR,
      'secretRotator'
    );
    const authorizerlambda = this.lambdFunc(
      ACCESSIBILITY_RESULTS_API_AUTHORIZER,
      'apiAuthorization'
    );
    authorizerlambda.role?.attachInlinePolicy(policy);
    secretsRotater.role?.attachInlinePolicy(policy);
    secretsRotater.role?.attachInlinePolicy(randomPassPolicy);
    secret.addRotationSchedule('Rotation-Schedule', {
      rotationLambda: secretsRotater,
      automaticallyAfter: Duration.days(15)
    });
    this.api = new apigateway.RestApi(
      this,
      apiGatewayProps.apiName || API_GATEWAY_API_NAME,
      {
        defaultIntegration: lambdaIntegration,
        endpointConfiguration: {
          types: [apigateway.EndpointType.REGIONAL]
        }
      }
    );
    const authorizer = new apigateway.TokenAuthorizer(this, 'AuthToken', {
      handler: authorizerlambda,
      identitySource: 'method.request.header.authorizationToken'
    });
    const res = this.api.root.addResource(apiGatewayProps.resoucrceName);
    if (apiGatewayProps.method) {
      apiGatewayProps.method.forEach((method) => {
        const apiMethod = res.addMethod(method, lambdaIntegration, {
          authorizer: authorizer,
          authorizationType: apigateway.AuthorizationType.CUSTOM
        });
      });
    }
  }
}
