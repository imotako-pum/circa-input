/**
 * HTML attribute parsing and config construction (pure functions)
 *
 * Reads <circa-input> HTML attributes and converts them to core's CircaInputConfig.
 * Performs only string-to-type conversions without any DOM manipulation.
 */
import type {
  CircaInputConfig,
  CircaValue,
  Distribution,
  GradientMode,
} from "@circa-input/core";
import {
  createDefaultConfig,
  createInitialValue,
  DISTRIBUTIONS,
} from "@circa-input/core";

/** Valid gradient mode values */
const VALID_GRADIENT_MODES: readonly string[] = ["relative", "absolute"];

/**
 * Parsed gradient configuration from HTML attributes.
 */
export interface GradientConfig {
  /** Gradient mode, or null if gradient is disabled */
  mode: GradientMode | null;
  /** Falloff exponent (1 = linear, >1 = steeper, <1 = gentler). Default 1.5. */
  intensity: number;
}

/**
 * Build a GradientConfig from the `gradient` and `gradient-intensity` attributes.
 *
 * - `gradient` attribute: `"relative"` or `"absolute"`. Omitted or invalid → gradient disabled.
 * - `gradient-intensity` attribute: Positive number. Defaults to 1.5.
 */
export function buildGradientConfig(
  getAttr: (name: string) => string | null,
): GradientConfig {
  const raw = getAttr("gradient");
  const mode =
    raw !== null && VALID_GRADIENT_MODES.includes(raw)
      ? (raw as GradientMode)
      : null;
  const intensityRaw = parseNumberAttr(getAttr("gradient-intensity"));
  const intensity =
    intensityRaw !== null && intensityRaw > 0 ? intensityRaw : 1.5;
  return { mode, intensity };
}

/**
 * Parse the distribution attribute, falling back to "normal" for invalid values.
 */
function parseDistribution(raw: string | null): Distribution {
  if (raw !== null && (DISTRIBUTIONS as readonly string[]).includes(raw)) {
    return raw as Distribution;
  }
  return "normal";
}

/**
 * Convert a string to number | null.
 * Returns null for empty strings, null, or invalid numeric strings.
 */
export function parseNumberAttr(value: string | null): number | null {
  if (value === null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) return null;
  return num;
}

/**
 * Parse a boolean attribute.
 * Per HTML spec, the attribute is true if it exists (regardless of value).
 */
export function parseBooleanAttr(value: string | null): boolean {
  return value !== null;
}

/**
 * Build a CircaInputConfig from HTML attributes.
 * Uses default values (0, 100) when min/max are not specified.
 */
export function buildConfig(
  getAttr: (name: string) => string | null,
): CircaInputConfig {
  const min = parseNumberAttr(getAttr("min")) ?? 0;
  const max = parseNumberAttr(getAttr("max")) ?? 100;
  const marginMax = parseNumberAttr(getAttr("margin-max"));
  const distribution = parseDistribution(getAttr("distribution"));
  const asymmetric = parseBooleanAttr(getAttr("asymmetric"));
  const stepRaw = parseNumberAttr(getAttr("step"));
  const step: number | "any" = stepRaw ?? "any";
  const name = getAttr("name");
  const required = parseBooleanAttr(getAttr("required"));
  const initialMargin = parseNumberAttr(getAttr("initial-margin"));

  return createDefaultConfig({
    min,
    max,
    marginMax,
    distribution,
    asymmetric,
    step,
    name,
    required,
    initialMargin,
  });
}

/**
 * Build the initial CircaValue from default-* or controlled attributes.
 * When controlled (value attribute exists), controlled attributes take priority.
 *
 * @param isControlled Passed externally to avoid duplicating detection logic. Defaults to checking the value attribute.
 */
export function buildInitialValue(
  getAttr: (name: string) => string | null,
  config: CircaInputConfig,
  isControlled?: boolean,
): CircaValue {
  const initial = createInitialValue(config);
  const controlled = isControlled ?? getAttr("value") !== null;

  if (controlled) {
    return {
      ...initial,
      value: parseNumberAttr(getAttr("value")),
      marginLow: parseNumberAttr(getAttr("margin-low")),
      marginHigh: parseNumberAttr(getAttr("margin-high")),
    };
  }

  return {
    ...initial,
    value: parseNumberAttr(getAttr("default-value")),
    marginLow: parseNumberAttr(getAttr("default-margin-low")),
    marginHigh: parseNumberAttr(getAttr("default-margin-high")),
  };
}
