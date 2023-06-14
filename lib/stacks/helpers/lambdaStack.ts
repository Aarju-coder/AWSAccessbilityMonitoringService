import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import {
  DeploymentStack,
  DeploymentStackProps,
  LambdaAsset
} from '@amzn/pipelines';
import { SERVICE_PACKAGE } from '../../constants/serviceConstants';
export class LambdaStack extends DeploymentStack {
  constructor(scope: Construct, id: string, props: DeploymentStackProps) {
    super(scope, id, props);
  }
  lambdFunc(lambdaFunction: string, actionName: string) {
    const lambdaFunctionHandler = new lambda.Function(this, lambdaFunction, {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: actionName,
      code: LambdaAsset.fromBrazil({
        brazilPackage: SERVICE_PACKAGE,
        componentName: actionName
      }),
      handler: `dist/handler/${actionName}.handler`
    });
    return lambdaFunctionHandler;
  }
}
