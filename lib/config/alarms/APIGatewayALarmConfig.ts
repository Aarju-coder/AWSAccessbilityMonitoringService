import { ComparisonOperator, TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";
import { apiGatewayMetricsName, Severity } from "../../cloudwatch/ApiGatewayMetrics";
import { PerStageAlarmsConfig, AlarmsMetadata } from "../../cloudwatch/coreAlarms";
export const API_GATEWAY_ALARMS: PerStageAlarmsConfig<AlarmsMetadata> = {
    Dev: [
      {
        alarmName: "MediumImpact.APIGateway.Latency",
        alarmDescription:
          "API Gateway Latency - medium.\n" ,
          
        metricName: apiGatewayMetricsName.LatencyP90,
        duration: 1,
        threshold: 2000,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        severity: Severity.SEV3,
      },
      {
        alarmName: "HighImpact.APIGateway.Latency",
        alarmDescription:
          "API Gateway Latency too high.\n" ,
          
        metricName: apiGatewayMetricsName.LatencyP90,
        duration: 5,
        threshold: 3000,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        severity: Severity.SEV4,
      },
      {
        alarmName: "HighImpact.APIGateway.Availability",
        alarmDescription:
          "Internal Server (5XX) error rate too high.\n" ,
          
        metricName: apiGatewayMetricsName.Availability,
        duration: 1,
        threshold: 99.95,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
        severity: Severity.SEV4,
      },
      {
        alarmName: "CriticalImpact.APIGateway.Availability",
        alarmDescription:
          "Internal Server (5XX) Critical error rate .\n" ,
          
        metricName: apiGatewayMetricsName.Availability,
        duration: 5,
        threshold: 99.97,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
        severity: Severity.SEV5,
      },
      {
        alarmName: "MediumImpact.APIGateway.Availability",
        alarmDescription:
          "CLient Side (4XX) medium error rate .\n" ,
          
        metricName: apiGatewayMetricsName.Error4XXAvg,
        duration: 1,
        threshold: 0.01,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        severity: Severity.SEV3,
      },
      {
        alarmName: "LowImpact.APIGateway.Availability",
        alarmDescription:
          "CLient Side (4XX) low error rate .\n" ,
          
        metricName: apiGatewayMetricsName.Error4XXAvg,
        duration: 5,
        threshold: 0.005,
        evaluationPeriods: 3,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        severity: Severity.SEV2,
      },
    ],
  };
