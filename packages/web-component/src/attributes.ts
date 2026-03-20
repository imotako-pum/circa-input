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
} from "@circa-input/core";
import {
  createDefaultConfig,
  createInitialValue,
  DISTRIBUTIONS,
} from "@circa-input/core";

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
