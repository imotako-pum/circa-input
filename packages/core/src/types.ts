/**
 * Type representing the shape of a distribution.
 * Note: "skewed" is reserved for future use and has no special behavior in v0.1.x.
 */
export type Distribution = "normal" | "uniform" | "skewed";

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
  distributionParams: Record<string, unknown>;
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
}
