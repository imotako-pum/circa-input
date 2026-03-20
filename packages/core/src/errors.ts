/**
 * Error codes for CircaInputError.
 *
 * Allows programmatic error handling in production:
 * ```ts
 * catch (e) {
 *   if (e instanceof CircaInputError && e.code === "INVALID_RANGE") { ... }
 * }
 * ```
 */
export const CircaErrorCode = {
  /** min >= max */
  INVALID_RANGE: "INVALID_RANGE",
  /** marginMax is negative */
  INVALID_MARGIN_MAX: "INVALID_MARGIN_MAX",
  /** step is zero or negative */
  INVALID_STEP: "INVALID_STEP",
  /** initialMargin is negative */
  INVALID_INITIAL_MARGIN: "INVALID_INITIAL_MARGIN",
  /** value is outside [min, max] */
  VALUE_OUT_OF_RANGE: "VALUE_OUT_OF_RANGE",
  /** marginLow is negative */
  INVALID_MARGIN_LOW: "INVALID_MARGIN_LOW",
  /** marginHigh is negative */
  INVALID_MARGIN_HIGH: "INVALID_MARGIN_HIGH",
  /** Internal shadow DOM element missing (library bug) */
  DOM_ELEMENT_NOT_FOUND: "DOM_ELEMENT_NOT_FOUND",
  /** Deserialized CircaValue has invalid shape or values */
  INVALID_CIRCA_VALUE: "INVALID_CIRCA_VALUE",
} as const;

export type CircaErrorCode =
  (typeof CircaErrorCode)[keyof typeof CircaErrorCode];

/**
 * Custom error class specific to circa-input.
 *
 * Each error includes a `code` property for programmatic handling
 * and an actionable message with received values and fix suggestions.
 */
export class CircaInputError extends Error {
  readonly code: CircaErrorCode;

  constructor(code: CircaErrorCode, message: string) {
    super(message);
    this.name = "CircaInputError";
    this.code = code;
  }
}
