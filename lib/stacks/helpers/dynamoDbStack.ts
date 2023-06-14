import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { DeploymentStackProps } from '@amzn/pipelines';
import { Construct } from 'constructs';
import { LambdaStack } from './lambdaStack';
import { ApigatewayProps } from '../../models/props';

export class DynamoDBStack extends LambdaStack {
  public readonly lambdaFunction: lambda.Function;
  public readonly accessibilityIssuesTable: dynamodb.Table;

  constructor(
    scope: Construct,
    id: string,
    props: DeploymentStackProps,
    apigatewayProps: ApigatewayProps
  ) {
    super(scope, id, props);
    this.lambdaFunction = this.lambdFunc(
      apigatewayProps.lambdaFunction,
      apigatewayProps.actionName
    );

    this.accessibilityIssuesTable = new dynamodb.Table(
      this,
      [id, `${apigatewayProps.tableName}`].join('-'),
      {
        tableName: `${apigatewayProps.tableName}${apigatewayProps.stage}`,
        partitionKey: {
          name: `${apigatewayProps.partitionKey}`,
          type: dynamodb.AttributeType.STRING
        },
        sortKey: {
          name: `${apigatewayProps.sortKey}`,
          type: dynamodb.AttributeType.STRING
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
      }
    );
    this.accessibilityIssuesTable.grantReadWriteData(this.lambdaFunction);
  }
}
create an Lambda function that batchWrite data in dynamodb,
 the Lambda service needs permissions to batchWrite data in dynamodb.
  create an IAM role with the lambda.amazonaws.com service principal,
   grant the necessary permissions to the Lambda service to perform the batchWrite data to dynamodb.
    write code in typescript using aws cdk.