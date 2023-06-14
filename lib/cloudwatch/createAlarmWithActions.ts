import { Alarm, IMetric } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { AlarmsMetadata} from "./coreAlarms"
import { aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';

/**
 * Map of metrics duration/period and available metrics map.
 */
export interface DurationToResourceMetrics {
    oneMinutePeriod: Map<string, cloudwatch.IMetric>;
    fiveMinutePeriod: Map<string, cloudwatch.IMetric>;
  }
  /**
 * Type returned by createAlarmWithAction.
 * Names need to be returned separately from alarms because CDK will save the
 * alarm names as tokens that aren't resolved until later (alarm.alarmName will be undefined).
 */
export interface CreatedAlarmsMetadata {
    metricToAlarmMap: Map<string, Alarm[]>;
  }


  /**
 * Return available metrics from DurationToResourceMetrics.
 *
 * @param metricName : name of the metrics which we have to filter out result.
 * @param duration : duration on which we have to filter out result.
 * @param durationToResourceMetrics : map of duration with available metrics.
 * @return Metric : instance of {@link Metric}
 */
export function getMetricsCorrespondingToAlarmsMetadata(
    metricName: string,
    duration: number,
    durationToResourceMetrics: DurationToResourceMetrics
  ): cloudwatch.IMetric {
    switch (duration) {
      case 1:
        return durationToResourceMetrics.oneMinutePeriod.get(metricName) as IMetric;
      case 5:
        return durationToResourceMetrics.fiveMinutePeriod.get(metricName) as IMetric;
      default:
        throw new Error("Only '1' or '5' is valid for duration");
    }
  }
/**
 * This function creates the Alarms and Actions associated to those Alarms.
 *
 * @param scope : scope of the Alarm.
 * @param resource : AWS resource for which the Alarm is being created.
 * @param alarmPrefix : prefix to be used for each Alarm.
 * @param alarmsMetadataList : list of all the alarms metadata.
 * @param durationToResourceMetrics : metrics over specific duration.
 */
export function createAlarmWithAction(
    scope: Construct,
    resource: string,
    alarmPrefix: string,
    alarmsMetadataList: Array<AlarmsMetadata>,
    durationToResourceMetrics: DurationToResourceMetrics
  ): CreatedAlarmsMetadata {
    const metricToAlarmMap = new Map<AlarmsMetadata["metricName"], Alarm[]>();
  
    alarmsMetadataList.forEach((alarmsMetadata: AlarmsMetadata) => {
      const {
        alarmName,
        alarmDescription,
        metricName,
        duration,
        threshold,
        evaluationPeriods,
        treatMissingData,
        comparisonOperator,
        severity,
      } = 
        alarmsMetadata;
   
  
      let prefixedAlarmName = `${alarmPrefix}[${resource}] ${alarmName}`;
  
      // Create Alarm
      const alarm = new Alarm(scope, prefixedAlarmName, {
        alarmName: prefixedAlarmName,
        alarmDescription,
        threshold,
        evaluationPeriods,
        treatMissingData,
        comparisonOperator,
        metric: getMetricsCorrespondingToAlarmsMetadata(metricName, duration, durationToResourceMetrics),
      });
  
      // Add Auto-Cut Ticket Action so each Alarm cuts a ticket to CCS CTI.
      // Don't need ticketing for DEV stage.
      
        //alarm.addAlarmAction(new CutTicketAction({ severity: isBuildRegion(region) ? Severity.SEV3 : severity }));
      
  
      // Add annotations on graphs for all severities.
      const alarmList: Alarm[] = metricToAlarmMap.get(metricName) ?? [];
      metricToAlarmMap.set(metricName, [...alarmList, alarm]);
  
      // push high severity alarms and alarmNames
    });
    return {
      metricToAlarmMap
    };
  }