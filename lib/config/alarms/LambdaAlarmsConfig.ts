import { ComparisonOperator, TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";
import { Severity } from "../../cloudwatch/ApiGatewayMetrics";
import { lambdaMetricsName } from "../../cloudwatch/LambdaMetrics";
import { PerStageAlarmsConfig, AlarmsMetadata } from "../../cloudwatch/coreAlarms";


export enum LambdaAlarmTypes {
    HighImpactLambdaErrorRate = "HighImpact.Lambda.ErrorRate",
    MediumImpactLambdaErrorRate = "MediumImpact.Lambda.ErrorRate",
    HighImpactLambdaAVGDuration = "HighImpact.Lambda.AVG.Duration",
    HighImpactLambdaThrottles = "HighImpact.Lambda.Throttles",
  }
export const LAMBDA_ALARMS: PerStageAlarmsConfig<AlarmsMetadata> = {
    Dev: [
      {
        alarmName: LambdaAlarmTypes.HighImpactLambdaThrottles,
        alarmDescription:
          "Lambda Throttles too High.\n" ,
          
        metricName: lambdaMetricsName.ThrottlesAvg,
        duration: 1,
        threshold: 0,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        severity: Severity.SEV3,
      },
      {
        alarmName: LambdaAlarmTypes.HighImpactLambdaErrorRate,
        alarmDescription:
          "Lambda Error Rate is too High.\n" ,
          
        metricName: lambdaMetricsName.ErrorRate,
        duration: 1,
        threshold: 0.01,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        severity: Severity.SEV3,
      },
      {
        alarmName: LambdaAlarmTypes.MediumImpactLambdaErrorRate,
        alarmDescription:
          "Lambda Error Rate is Medium.\n" ,
          
        metricName: lambdaMetricsName.ErrorRate,
        duration: 1,
        threshold: 0.005,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        severity: Severity.SEV2,
      },
      {
        alarmName: LambdaAlarmTypes.HighImpactLambdaAVGDuration,
        alarmDescription:
          "Lambda Avg Duration is consistently too high.\n" ,
          
        metricName: lambdaMetricsName.DurationP90,
        duration: 5,
        threshold: 3000,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        severity: Severity.SEV3,
      },
    ],
  };
