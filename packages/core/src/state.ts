import { clamp } from "./helpers.js";
import type { CircaInputConfig, CircaValue } from "./types.js";

/**
 * Snap (round) a value to the nearest step increment.
 *
 * Does not snap when step is "any".
 * Formula: Math.round((value - min) / step) * step + min
 * Rounds to the nearest multiple of step relative to min.
 * The result is clamped to the [min, max] range.
 */
export function snapToStep(
  value: number,
  config: Pick<CircaInputConfig, "min" | "max" | "step">,
): number {
  if (config.step === "any") {
    // Even with step="any", clamp within the min/max range
    return clamp(value, config.min, config.max);
  }

  const snapped =
    Math.round((value - config.min) / config.step) * config.step + config.min;

  // Round to the decimal places of step to suppress floating-point errors
  const decimals = countDecimals(config.step);
  const rounded = parseFloat(snapped.toFixed(decimals));

  // Clamp to [min, max]
  return clamp(rounded, config.min, config.max);
}

/**
 * Return the number of decimal places of a number (for floating-point error mitigation).
 * Examples: 0.5 -> 1, 0.25 -> 2, 5 -> 0
 */
function countDecimals(num: number): number {
  const str = num.toString();
  // Handle scientific notation (e.g., "1e-7" → 7, "1.5e-10" → 11)
  const eIndex = str.indexOf("e-");
  if (eIndex !== -1) {
    const exponent = parseInt(str.slice(eIndex + 2), 10);
    const mantissa = str.slice(0, eIndex);
    const dotIndex = mantissa.indexOf(".");
    const mantissaDecimals =
      dotIndex === -1 ? 0 : mantissa.length - dotIndex - 1;
    return exponent + mantissaDecimals;
  }
  const dotIndex = str.indexOf(".");
  return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
}

/**
 * Create an initial (empty) CircaValue.
 */
export function createInitialValue(
  config: Pick<CircaInputConfig, "distribution">,
): CircaValue {
  return {
    value: null,
    marginLow: null,
    marginHigh: null,
    distribution: config.distribution,
    distributionParams: {},
  };
}

/**
 * Create a default CircaInputConfig.
 */
export function createDefaultConfig(
  overrides: Pick<CircaInputConfig, "min" | "max"> &
    Partial<Omit<CircaInputConfig, "min" | "max">>,
): CircaInputConfig {
  return {
    marginMax: null,
    distribution: "normal",
    asymmetric: false,
    step: "any",
    name: null,
    required: false,
    initialMargin: null,
    ...overrides,
  };
}

/**
 * Clamp margins within the min/max/marginMax range.
 */
export function clampMargins(
  circaValue: CircaValue,
  config: CircaInputConfig,
): CircaValue {
  if (circaValue.value === null) {
    return circaValue;
  }

  let marginLow = circaValue.marginLow;
  let marginHigh = circaValue.marginHigh;

  if (marginLow !== null) {
    // Clamp so that applying the margin does not go below min
    const maxLow = circaValue.value - config.min;
    marginLow = Math.min(marginLow, maxLow);

    // Clamp by marginMax
    if (config.marginMax !== null) {
      marginLow = Math.min(marginLow, config.marginMax);
    }

    marginLow = Math.max(marginLow, 0);
  }

  if (marginHigh !== null && marginHigh !== Infinity) {
    // Clamp so that applying the margin does not exceed max
    const maxHigh = config.max - circaValue.value;
    marginHigh = Math.min(marginHigh, maxHigh);

    // Clamp by marginMax
    if (config.marginMax !== null) {
      marginHigh = Math.min(marginHigh, config.marginMax);
    }

    marginHigh = Math.max(marginHigh, 0);
  }

  return {
    ...circaValue,
    marginLow,
    marginHigh,
  };
}

/**
 * Update the value, applying snap, symmetric sync, and clamping as needed.
 *
 * Processing order:
 * 1. Merge updates
 * 2. If value was updated, apply step snapping
 * 3. If asymmetric=false, sync marginLow/marginHigh
 * 4. Clamp margins within range via clampMargins
 */
export function updateValue(
  current: CircaValue,
  updates: Partial<Pick<CircaValue, "value" | "marginLow" | "marginHigh">>,
  config: CircaInputConfig,
): CircaValue {
  const next: CircaValue = {
    ...current,
    ...updates,
  };

  // Step 1: Snap value to step
  if (next.value !== null && "value" in updates) {
    next.value = snapToStep(next.value, config);
  }

  // Step 2: Apply initialMargin on null→value transition
  // When the value transitions from null to a number and no margins are specified,
  // automatically apply the configured initial margin width.
  if (
    current.value === null &&
    next.value !== null &&
    next.marginLow === null &&
    next.marginHigh === null
  ) {
    let effectiveMargin =
      config.initialMargin ?? (config.max - config.min) / 10;
    if (config.step !== "any") {
      // Snap the margin to the nearest step increment
      const decimals = countDecimals(config.step);
      effectiveMargin = parseFloat(
        (Math.round(effectiveMargin / config.step) * config.step).toFixed(
          decimals,
        ),
      );
    }
    next.marginLow = effectiveMargin;
    next.marginHigh = effectiveMargin;
  }

  // Step 3: Symmetric mode sync
  // When asymmetric=false, marginLow and marginHigh always have the same value.
  // Copy the explicitly specified side to the other side.
  if (!config.asymmetric) {
    const hasLow = "marginLow" in updates;
    const hasHigh = "marginHigh" in updates;

    if (hasLow && !hasHigh && next.marginLow !== null) {
      // Only marginLow was specified -> sync to marginHigh
      next.marginHigh = next.marginLow;
    } else if (hasHigh && !hasLow && next.marginHigh !== null) {
      // Only marginHigh was specified -> sync to marginLow
      next.marginLow = next.marginHigh;
    } else if (hasLow && hasHigh) {
      // Both specified: prefer marginLow (symmetric, so one is enough)
      if (next.marginLow !== null) {
        next.marginHigh = next.marginLow;
      }
    }
  }

  return clampMargins(next, config);
}
