import { Duration } from "aws-cdk-lib";
import { IMetric, MathExpression, Metric, MetricOptions, Statistic, Unit } from "aws-cdk-lib/aws-cloudwatch";

import { metricNamespace, P50, P90 } from "../constants/metricConstant";

/**
 * Properties that will be used to create Lambda Metrics.
 */
export interface LambdaMetricsProps {
  readonly functionName: string;
}

export enum lambdaMetricsName {
  Errors = "Errors",
  Invocations = "Invocations",
  Throttles = "Throttles",
  InvocationsAvg = "InvocationsAvg",
  ThrottlesAvg = "ThrottlesAvg",
  ErrorsAvg = "ErrorsAvg",
  ErrorRate = "ErrorRate",
  DurationAvg = "DurationAvg",
  DurationP50 = "DurationP50",
  DurationP90 = "DurationP90",
}

/**
 * This class contains all available Lambda Metrics along with customized Metrics.
 */
export class LambdaMetrics {
  private readonly functionName: string;

  constructor(props: LambdaMetricsProps) {
    this.functionName = props.functionName;
  }

  /**
   * Returns map of all available Lambda metrics.
   * Refer: https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics.html
   *
   * @param period : period over which the expression's statistics are applied.
   */
  public availableLambdaMetrics(period: Duration): Map<string, IMetric> {
    const availableMetrics = new Map<string, IMetric>();

    availableMetrics.set(
      lambdaMetricsName.Invocations,
      this.lambdaMetric("Invocations", {
        label: "Invocations [avg: ${AVG}, max: ${MAX}, min: ${MIN}, sum: ${SUM}]",
        statistic: Statistic.SUM,
        unit: Unit.COUNT,
        period,
      })
    );

    // Generate Average Metrics for Lambda's Errors, throttles and invocations.
    availableMetrics.set(
      lambdaMetricsName.ErrorsAvg,
      this.lambdaMetric("Errors", {
        label: ` Avg Errors`,
        statistic: Statistic.AVERAGE,
        period,
      })
    );

    availableMetrics.set(
      lambdaMetricsName.ThrottlesAvg,
      this.lambdaMetric("Throttles", {
        label: ` Avg Throttles`,
        statistic: Statistic.AVERAGE,
        period,
      })
    );

    // Error Rate for Lambda.
    const errorsAvgName = `errorAvg`;
    const invocationCount = "invocationCount"
    availableMetrics.set(
      lambdaMetricsName.ErrorRate,
      new MathExpression({
        label: `Error %` + " [avg: ${AVG}, max: ${MAX}, min: ${MIN}, sum: ${SUM}]",
        expression: `100*${errorsAvgName}/${invocationCount}`,
        usingMetrics: {
          [`${errorsAvgName}`]: availableMetrics.get(lambdaMetricsName.ErrorsAvg) as IMetric,
          [`${invocationCount}`]: availableMetrics.get(lambdaMetricsName.Invocations) as IMetric,
        },
        period,
      })
    );

    // Average Latency Metrics for lambda.
    availableMetrics.set(
      lambdaMetricsName.DurationAvg,
      this.lambdaMetric("Duration", {
        label: ` Avg Duration`,
        statistic: Statistic.AVERAGE,
        unit: Unit.MILLISECONDS,
        period,
      })
    );

    // P90 Latency Metrics for lambda.
    availableMetrics.set(
      lambdaMetricsName.DurationP90,
      this.lambdaMetric("Duration", {
        label: ` P90 Duration`,
        statistic: P90,
        unit: Unit.MILLISECONDS,
        period,
      })
    );

    return availableMetrics;
  }

  /**
   * This function creates and returns a Lambda metric.
   *
   * @param metricName : name of the metric.
   * @param metricOptions : options for the metric like period, statistic etc.
   */
  public lambdaMetric(metricName: string, metricOptions?: MetricOptions): Metric {
    return new Metric({
      metricName: metricName,
      namespace: metricNamespace.Lambda,
      dimensionsMap: {
        FunctionName: this.functionName,
      },
      ...metricOptions,
    });
  }
}