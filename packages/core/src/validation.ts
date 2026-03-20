import { CircaErrorCode, CircaInputError } from "./errors.js";
import type { CircaInputConfig, CircaValue } from "./types.js";

/**
 * Validate configuration values. Throws CircaInputError if invalid.
 */
export function validateConfig(config: CircaInputConfig): void {
  if (config.min >= config.max) {
    throw new CircaInputError(
      CircaErrorCode.INVALID_RANGE,
      `min must be less than max (received: min=${config.min}, max=${config.max}). Swap the values or adjust the range.`,
    );
  }
  if (config.marginMax !== null && config.marginMax < 0) {
    throw new CircaInputError(
      CircaErrorCode.INVALID_MARGIN_MAX,
      `marginMax must be non-negative (received: ${config.marginMax}). Use 0 for no margin or a positive number.`,
    );
  }
  if (config.step !== "any" && config.step <= 0) {
    throw new CircaInputError(
      CircaErrorCode.INVALID_STEP,
      `step must be positive (received: ${config.step}). Use a positive number or "any" for continuous input.`,
    );
  }
  if (config.initialMargin !== null && config.initialMargin < 0) {
    throw new CircaInputError(
      CircaErrorCode.INVALID_INITIAL_MARGIN,
      `initialMargin must be non-negative (received: ${config.initialMargin}). Use 0 for no initial margin.`,
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
        CircaErrorCode.VALUE_OUT_OF_RANGE,
        `value is out of range (received: ${value}, allowed: [${config.min}, ${config.max}]). Clamp or adjust the value to fit within min/max.`,
      );
    }
  }

  if (marginLow !== null && marginLow < 0) {
    throw new CircaInputError(
      CircaErrorCode.INVALID_MARGIN_LOW,
      `marginLow must be non-negative (received: ${marginLow}). Use 0 or a positive number.`,
    );
  }

  if (marginHigh !== null && marginHigh < 0) {
    throw new CircaInputError(
      CircaErrorCode.INVALID_MARGIN_HIGH,
      `marginHigh must be non-negative (received: ${marginHigh}). Use 0 or a positive number.`,
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
