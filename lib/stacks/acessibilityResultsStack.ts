import { ApigatewayStack } from './helpers/apigatewayStack';
import { Construct } from 'constructs';
import {
  ACCESSIBILITY_RESULTS_STACK_NAME,
  ACCESSIBILITY_RESULTS_API_NAME,
  ACCESSIBILITY_RESULTS_RESOURCE_NAME
} from '../constants/serviceConstants';
import { ApigatewayProps, AccessibilityResultsProps } from '../models/props';
export class AccessibilityResultsStack extends ApigatewayStack {
  constructor(scope: Construct, id: string, props: AccessibilityResultsProps) {
    const apiGatewayProps: ApigatewayProps = {
      allowTestInvoke: true,
      proxy: true,
      apiName: ACCESSIBILITY_RESULTS_API_NAME,
      resoucrceName: ACCESSIBILITY_RESULTS_RESOURCE_NAME,
      method: ['POST'],
      lambdaFunction: id,
      actionName: `accessibilityResults`,
      stage: props.stage,
      tableName: 'AWSAccessibilityIssues',
      partitionKey: 'issueId',
      sortKey: 'pipelinerunId'
    };
    super(
      scope,
      `${id}-${ACCESSIBILITY_RESULTS_STACK_NAME}`,
      props,
      apiGatewayProps
    );
  }
}
