/**
 * Mode for gradient opacity calculation across the margin band.
 *
 * - `"relative"`: Each side (low/high) is independently normalized so that the edge always reaches opacity 0.
 *   Even if marginLow ≠ marginHigh, both edges fade to transparent.
 * - `"absolute"`: Both sides share the same distance scale (the larger margin).
 *   Equal distances from center always produce equal opacity, so the shorter side may not fully fade out.
 */
export type GradientMode = "relative" | "absolute";

/**
 * A single color stop used to build a CSS linear-gradient for the margin band.
 */
export interface GradientStop {
  /** Position within the margin band (0 = left edge, 1 = right edge) */
  position: number;
  /** Opacity at this position (0 = fully transparent, 1 = maximum intensity) */
  opacity: number;
}

/**
 * Type representing the shape of a distribution.
 */
export type Distribution = "normal" | "uniform";

/**
 * Gradient rendering parameters bundled as a single unit.
 * Present when gradient visualization is enabled; absent otherwise.
 * This is a rendering hint — it describes how the margin band should be
 * visually rendered, not the statistical shape of the distribution.
 */
export interface GradientParams {
  /** Which gradient algorithm to use */
  mode: GradientMode;
  /** Exponent controlling the falloff curve (higher = steeper) */
  intensity: number;
}

/**
 * Base distribution parameters shared by all distribution types.
 * Contains optional gradient metadata that describes the visual confidence
 * shape within the margin band.
 */
export interface BaseDistributionParams {
  /** Gradient rendering config. Undefined when no gradient is set. */
  gradient?: GradientParams;
}

/**
 * Distribution-specific parameters.
 *
 * When adding a new distribution (e.g., "skewed"), define its parameter type here
 * and add it to DistributionParamsMap.
 */
export interface NormalDistributionParams extends BaseDistributionParams {}
export interface UniformDistributionParams extends BaseDistributionParams {}

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
