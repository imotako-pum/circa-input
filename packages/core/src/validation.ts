import { CircaInputError } from "./errors.js";
import type { CircaInputConfig, CircaValue } from "./types.js";

/**
 * Validate configuration values. Throws CircaInputError if invalid.
 */
export function validateConfig(config: CircaInputConfig): void {
  if (config.min >= config.max) {
    throw new CircaInputError(
      `min (${config.min}) must be less than max (${config.max})`,
    );
  }
  if (config.marginMax !== null && config.marginMax < 0) {
    throw new CircaInputError(
      `marginMax (${config.marginMax}) must be non-negative`,
    );
  }
  if (config.step !== "any" && config.step <= 0) {
    throw new CircaInputError(`step (${config.step}) must be positive`);
  }
  if (config.initialMargin !== null && config.initialMargin < 0) {
    throw new CircaInputError(
      `initialMargin (${config.initialMargin}) must be non-negative`,
    );
  }
}

/**
 * Validate a CircaValue. Throws for developer errors;
 * natural overflows from user interaction are handled by clamping.
 */
export function validateValue(
  circaValue: CircaValue,
  config: CircaInputConfig,
): void {
  const { value, marginLow, marginHigh } = circaValue;

  if (value !== null) {
    if (value < config.min || value > config.max) {
      throw new CircaInputError(
        `value (${value}) is out of range [${config.min}, ${config.max}]`,
      );
    }
  }

  if (marginLow !== null && marginLow < 0) {
    throw new CircaInputError(`marginLow (${marginLow}) must be non-negative`);
  }

  if (marginHigh !== null && marginHigh < 0) {
    throw new CircaInputError(
      `marginHigh (${marginHigh}) must be non-negative`,
    );
  }
}

/**
 * Return false if required=true and value is null.
 */
export function checkRequired(
  circaValue: CircaValue,
  config: CircaInputConfig,
): boolean {
  if (config.required && circaValue.value === null) {
    return false;
  }
  return true;
}
