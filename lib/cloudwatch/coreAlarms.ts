import { aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';
import { CfnResource, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Alarm, CfnCompositeAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { lambdaMetricsName } from "./LambdaMetrics"
import {
  SERVICE_NAME, ACCESSIBILITY_RESULTS_API_NAME, ACCESSIBILITY_RESULTS_RESOURCE_NAME, ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME
} from '../constants/serviceConstants';
import { Severity, apiGatewayMetricsName, APIGatewayMetrics } from './ApiGatewayMetrics';
import { API_GATEWAY_ALARMS } from '../config/alarms/APIGatewayALarmConfig';
import { LAMBDA_ALARMS } from '../config/alarms/LambdaAlarmsConfig';
import { LambdaMetrics } from './LambdaMetrics';
import { DurationToResourceMetrics, createAlarmWithAction, CreatedAlarmsMetadata } from "./createAlarmWithActions"


export type AlarmsMetadata = Pick<
  cloudwatch.AlarmProps,
  "alarmName" | "alarmDescription" | "treatMissingData" | "comparisonOperator" | "threshold" | "evaluationPeriods"
> & {
  duration: number;
  metricName: apiGatewayMetricsName | lambdaMetricsName;
  severity?: Severity;
  findInService?: string;
};
export type PerStageAlarmsConfig<T> = {
  ["Dev"]: T[];
};


/**
 * Class responsible for creating CCS Alarms.
 */
export class ResultReportingAlarms extends Construct {
  public metricToAlarmMap: Map<string, Alarm[]> = new Map();
  private readonly alarmPrefix: string;


  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.alarmPrefix = `[${SERVICE_NAME}]`;



    this.createAlarms();
  }

  /**
 * Create alarms for all resources used by CCS.
 */
  public createAlarms(): void {

    // AMS API Gateway Metrics.
    const amsApiGatewayMetrics = new APIGatewayMetrics({
      apiName: ACCESSIBILITY_RESULTS_API_NAME,
      resource: ACCESSIBILITY_RESULTS_RESOURCE_NAME,
      method: "POST"
    });

    const amsLambdaMetrics = new LambdaMetrics({
      functionName: ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME
    });

    const serviceToAlarmsMetadataList = new Map<string, AlarmsMetadata[]>();

    const serviceToMetrics = new Map<string, DurationToResourceMetrics>();


    serviceToAlarmsMetadataList.set(ACCESSIBILITY_RESULTS_API_NAME, API_GATEWAY_ALARMS["Dev"]);
    serviceToMetrics.set(ACCESSIBILITY_RESULTS_API_NAME, {
      oneMinutePeriod: amsApiGatewayMetrics.availableAPIGatewayMetrics(Duration.minutes(1)),
      fiveMinutePeriod: amsApiGatewayMetrics.availableAPIGatewayMetrics(Duration.minutes(5)),
    })
    serviceToAlarmsMetadataList.set(ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME, LAMBDA_ALARMS["Dev"]);
    serviceToMetrics.set(ACCESSIBILITY_RESULTS_DEPLOYMENT_STACK_NAME, {
      oneMinutePeriod: amsLambdaMetrics.availableLambdaMetrics(Duration.minutes(1)),
      fiveMinutePeriod: amsLambdaMetrics.availableLambdaMetrics(Duration.minutes(5)),
    })
    serviceToAlarmsMetadataList.forEach((metadataList: AlarmsMetadata[], alarmNamespace: string) => {

      const mapValue = serviceToMetrics.get(alarmNamespace);
      if (mapValue) {
        const createdAlarmsMetadata: CreatedAlarmsMetadata = createAlarmWithAction(
          this,
          alarmNamespace,
          this.alarmPrefix,
          metadataList,
          mapValue
        );
      }

    });
  }
}
