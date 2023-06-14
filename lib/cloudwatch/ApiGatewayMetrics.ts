import {
    ComparisonOperator,
    TreatMissingData,
    DimensionHash,
    IMetric,
    MathExpression,
    Metric,
    MetricOptions,
    Statistic,
    Unit,
  } from "aws-cdk-lib/aws-cloudwatch";
  import { Duration } from "aws-cdk-lib";
  import { metricNamespace, P90, P50 } from "../constants/metricConstant";
/**
 * Properties that will be used to create APIGatewayMetrics.
 */
export interface APIGatewayMetricsProps {
    readonly accountId?: string;
    readonly apiName: string;
    readonly region?: string;
    readonly method?: string;
    readonly resource?: string;
    readonly stage?: string;
  }
  /**
 * Ticket Severity.
 */
export enum Severity {
    SEV2 = "2",
    SEV2_5 = "2.5",
    SEV3 = "3",
    SEV4 = "4",
    SEV5 = "5",
  }
  export enum apiGatewayMetricsName {
    Count = "Count",
    Error4XX = "Error4XX",
    Error4XXAvg = "Error4XXAvg",
    Error5XX = "Error5XX",
    Error5XXAvg = "Error5XXAvg",
    Availability = "Availability",
    TPS = "TPS",
    LatencyAvg = "LatencyAvg",
    LatencyP50 = "LatencyP50",
    LatencyP90 = "LatencyP90",
    IntegrationLatencyAvg = "IntegrationLatencyAvg",
    IntegrationLatencyP50 = "IntegrationLatencyP50",
    IntegrationLatencyP90 = "IntegrationLatencyP90",
    ErrorRate4XX = "ErrorRate4XX",
    ErrorRate5XX = "ErrorRate5XX",
  }
  
  /**
   * This class contains all available APIGateway Metrics along with customized Metrics.
   */
  export class APIGatewayMetrics {
    private readonly apiName: string;
    private readonly method: string | undefined;
    private readonly resource: string | undefined;
    constructor(props: APIGatewayMetricsProps) {
      this.apiName = props.apiName;
      this.method = props.method ? props.method : undefined;
      this.resource = props.resource ? props.resource : undefined;
    }
    /**
   * Returns map of available API Gateway metrics.
   * Refer: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html
   *
   * @param period : period over which the expression's statistics are applied.
   */
  public availableAPIGatewayMetrics(period: Duration): Map<string, IMetric> {
    const availableMetrics = new Map<string, IMetric>();

    // Generate Count Metric for APIGateway's Invocations and Errors.
    availableMetrics.set(
        apiGatewayMetricsName.Count,
        this.apiGatewayMetric("Count", {
          label: "Count [avg: ${AVG}, max: ${MAX}, min: ${MIN}, sum: ${SUM}]",
          statistic: Statistic.SUM,
          unit: Unit.COUNT,
          period,
        })
      );
  
      availableMetrics.set(
        apiGatewayMetricsName.Error4XX,
        this.apiGatewayMetric("4XXError", {
          label: "4XXError [avg: ${AVG}, max: ${MAX}, min: ${MIN}, sum: ${SUM}]",
          statistic: Statistic.SUM,
          unit: Unit.COUNT,
          period,
        })
      );
  
      availableMetrics.set(
        apiGatewayMetricsName.Error5XX,
        this.apiGatewayMetric("5XXError", {
          label: "5XXError [avg: ${AVG}, max: ${MAX}, min: ${MIN}, sum: ${SUM}]",
          statistic: Statistic.SUM,
          unit: Unit.COUNT,
          period,
        })
      );

    // Generate Avg Error Metrics.
    availableMetrics.set(
      apiGatewayMetricsName.Error4XXAvg,
      this.apiGatewayMetric("4XXError", {
        label: "Avg 4XXError",
        statistic: Statistic.AVERAGE,
        period,
      })
    );

    // Calculating API Gateway Availability based on 5xx Errors and Invocation Count.
    const error5xx = `errorAvailability`;
    const invocationCount = `invocationCount`;
    availableMetrics.set(
      apiGatewayMetricsName.Availability,
      new MathExpression({
        label: `Availability ` + "[avg: ${AVG}, max: ${MAX}, min: ${MIN}]",
        expression: `100-100*${error5xx}/${invocationCount}`,
        usingMetrics: {
          [error5xx]: availableMetrics.get(apiGatewayMetricsName.Error5XX) as IMetric,
          [invocationCount]: availableMetrics.get(apiGatewayMetricsName.Count) as IMetric,
        },
        period,
      })
    );

    // ApiGateway Average Latency.
    availableMetrics.set(
      apiGatewayMetricsName.LatencyAvg,
      this.apiGatewayMetric("Latency", {
        label: "Avg Latency",
        statistic: Statistic.AVERAGE,
        unit: Unit.MILLISECONDS,
        period,
      })
    );

    // ApiGateway P90 Latency.
    availableMetrics.set(
      apiGatewayMetricsName.LatencyP90,
      this.apiGatewayMetric("Latency", {
        label: "P90 Latency [avg: ${AVG}, max: ${MAX}, min: ${MIN}]",
        statistic: P90,
        unit: Unit.MILLISECONDS,
        period,
      })
    );

    return availableMetrics;
  }
  /**
   * This function creates and returns an API Gateway metric.
   *
   * @param metricName : name of the metric.
   * @param metricOptions : options for the metric like period, statistic etc.
   */
  private apiGatewayMetric(metricName: string, metricOptions?: MetricOptions): Metric {
    let dimensions: DimensionHash = {
      ApiName: this.apiName,
    };
    if (this.method && this.resource) {
      dimensions = {
        Method: this.method, // e.g. `POST`
        Resource: this.resource, // e.g. `/GetCallerSettings/{settingsNamespace}`
        ...dimensions,
      };
    }

    return new Metric({
      metricName: metricName,
      namespace: metricNamespace.APIGateway,
      dimensionsMap: dimensions,
      ...metricOptions,
    });
  }
  }  