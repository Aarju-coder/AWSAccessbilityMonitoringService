#!/usr/bin/env node
import {
  DeploymentPipeline,
  Platform,
  DeploymentEnvironmentFactory,
  SoftwareType,
  BrazilPackage
} from '@amzn/pipelines';
import { App } from 'aws-cdk-lib';
import { AccessibilityResultsStack } from './stacks/acessibilityResultsStack';
import { AlarmsStack } from './stacks/alarmsStack';
import {
  ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME,
  DEPLOYMENT_STACK_REGION,
  DEPLOYMENT_STAGE_ALPHA
} from './constants/serviceConstants';

// Set up your CDK App
const app = new App();

const applicationAccount = '735710597955';
const pipelineId = '5207631';

const pipeline = new DeploymentPipeline(app, 'Pipeline', {
  account: applicationAccount,
  pipelineName: 'AWSAccessibilityMonitoringService',
  versionSet: 'AWSAccessibilityMonitoringService/development', // The version set you created
  versionSetPlatform: Platform.AL2_X86_64,
  trackingVersionSet: 'live', // Or any other version set you prefer
  bindleGuid: 'amzn1.bindle.resource.nubyhjekssg3j3a2hq5q',
  description: 'AWS Accessibility Monitoring Service Pipeline',
  pipelineId,
  selfMutate: true
});

const servicePackage = 'AWSAccessibilityMonitoringService';

[servicePackage].map((pkg) =>
  pipeline.addPackageToAutobuild(BrazilPackage.fromString(pkg))
);

const alphaDeploymentGroup = pipeline.addStage(DEPLOYMENT_STAGE_ALPHA, {
  isProd: false
});

const accessibilityResultsDeploymentStack = new AccessibilityResultsStack(
  app,
  ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME,
  {
    env: DeploymentEnvironmentFactory.fromAccountAndRegion(
      applicationAccount,
      DEPLOYMENT_STACK_REGION,
      pipelineId
    ),
    softwareType: SoftwareType.LONG_RUNNING_SERVICE,
    stage: DEPLOYMENT_STAGE_ALPHA
  }
);
const accessibilityResultsAlarmDeploymentStack = new AlarmsStack(
  app,
  ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME,
  {
    env: DeploymentEnvironmentFactory.fromAccountAndRegion(
      applicationAccount,
      DEPLOYMENT_STACK_REGION,
      pipelineId
    ),
    softwareType: SoftwareType.LONG_RUNNING_SERVICE,
    stage: DEPLOYMENT_STAGE_ALPHA
  },
  {
    lambda: accessibilityResultsDeploymentStack.lambdaFunction,
    dynamoDb: accessibilityResultsDeploymentStack.accessibilityIssuesTable,
    api: accessibilityResultsDeploymentStack.api
  }
);
accessibilityResultsAlarmDeploymentStack.addDependency(
  accessibilityResultsDeploymentStack
);
alphaDeploymentGroup.addDeploymentGroup({
  name: ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME,
  stacks: [
    accessibilityResultsDeploymentStack,
    accessibilityResultsAlarmDeploymentStack
  ]
});
