/**
 * Type representing the shape of a distribution.
 */
export type Distribution = "normal" | "uniform";

/**
 * Distribution-specific parameters.
 * Currently reserved for future use — all distributions use empty objects.
 *
 * When adding a new distribution (e.g., "skewed"), define its parameter type here
 * and add it to DistributionParamsMap.
 */
export type NormalDistributionParams = Record<string, never>;
export type UniformDistributionParams = Record<string, never>;

/** Map from distribution name to its parameter type. */
export interface DistributionParamsMap {
  normal: NormalDistributionParams;
  uniform: UniformDistributionParams;
}

/** Union of all distribution parameter types. */
export type DistributionParams = DistributionParamsMap[Distribution];

/**
 * Output value of circa-input. A data structure containing a center value and its ambiguity.
 */
export interface CircaValue {
  /** Center value (null when not entered) */
  value: number | null;
  /** Lower margin of tolerance (null when not entered) */
  marginLow: number | null;
  /** Upper margin of tolerance (null when not entered) */
  marginHigh: number | null;
  /** Shape of the distribution */
  distribution: Distribution;
  /** Distribution parameters (reserved for future extension; always {} in v0.1.x) */
  distributionParams: DistributionParams;
}

/**
 * Configuration for circa-input.
 */
export interface CircaInputConfig {
  /** Minimum selectable value */
  min: number;
  /** Maximum selectable value */
  max: number;
  /** Maximum margin value (null for no limit) */
  marginMax: number | null;
  /** Shape of the distribution */
  distribution: Distribution;
  /** Whether asymmetric UI is allowed */
  asymmetric: boolean;
  /** Step size for values */
  step: number | "any";
  /** Name for form integration */
  name: string | null;
  /** Required validation */
  required: boolean;
  /** Default margin width applied when value is first set (null → value). Defaults to (max - min) / 10. */
  initialMargin: number | null;
}
