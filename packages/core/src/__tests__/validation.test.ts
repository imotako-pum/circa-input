import { describe, expect, it } from "vitest";
import { CircaErrorCode, CircaInputError } from "../errors.js";
import { createDefaultConfig, createInitialValue } from "../state.js";
import type { CircaValue } from "../types.js";
import { checkRequired, validateConfig, validateValue } from "../validation.js";

/** Helper: assert that a function throws CircaInputError with the expected code */
function expectCircaError(
  fn: () => void,
  code: CircaErrorCode,
): CircaInputError {
  let caught: CircaInputError | undefined;
  try {
    fn();
  } catch (e) {
    caught = e as CircaInputError;
  }
  expect(caught).toBeInstanceOf(CircaInputError);
  expect(caught?.code).toBe(code);
  return caught as CircaInputError;
}

describe("validateConfig", () => {
  it("does not throw when min < max", () => {
    const config = createDefaultConfig({ min: 0, max: 100 });
    expect(() => validateConfig(config)).not.toThrow();
  });

  it("throws INVALID_RANGE when min >= max", () => {
    const config = createDefaultConfig({ min: 100, max: 100 });
    const err = expectCircaError(
      () => validateConfig(config),
      CircaErrorCode.INVALID_RANGE,
    );
    expect(err.message).toContain("min=100");
    expect(err.message).toContain("max=100");
  });

  it("throws INVALID_MARGIN_MAX when marginMax is negative", () => {
    const config = createDefaultConfig({ min: 0, max: 100, marginMax: -1 });
    expectCircaError(
      () => validateConfig(config),
      CircaErrorCode.INVALID_MARGIN_MAX,
    );
  });

  it("throws INVALID_STEP when step is 0 or negative", () => {
    const config = createDefaultConfig({ min: 0, max: 100, step: 0 });
    expectCircaError(() => validateConfig(config), CircaErrorCode.INVALID_STEP);
  });

  it('does not throw when step="any"', () => {
    const config = createDefaultConfig({ min: 0, max: 100, step: "any" });
    expect(() => validateConfig(config)).not.toThrow();
  });

  it("throws INVALID_INITIAL_MARGIN when initialMargin is negative", () => {
    const config = createDefaultConfig({
      min: 0,
      max: 100,
      initialMargin: -1,
    });
    const err = expectCircaError(
      () => validateConfig(config),
      CircaErrorCode.INVALID_INITIAL_MARGIN,
    );
    expect(err.message).toContain("-1");
  });

  it("does not throw when initialMargin is null", () => {
    const config = createDefaultConfig({
      min: 0,
      max: 100,
      initialMargin: null,
    });
    expect(() => validateConfig(config)).not.toThrow();
  });

  it("does not throw when initialMargin is 0", () => {
    const config = createDefaultConfig({
      min: 0,
      max: 100,
      initialMargin: 0,
    });
    expect(() => validateConfig(config)).not.toThrow();
  });
});

describe("validateValue", () => {
  const config = createDefaultConfig({ min: 0, max: 100 });

  it("does not throw when value is null", () => {
    const value = createInitialValue({ distribution: "normal" });
    expect(() => validateValue(value, config)).not.toThrow();
  });

  it("does not throw when value is within range", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: 10,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).not.toThrow();
  });

  it("throws VALUE_OUT_OF_RANGE when value is below min", () => {
    const value: CircaValue = {
      value: -1,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    expectCircaError(
      () => validateValue(value, config),
      CircaErrorCode.VALUE_OUT_OF_RANGE,
    );
  });

  it("throws VALUE_OUT_OF_RANGE when value exceeds max", () => {
    const value: CircaValue = {
      value: 101,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    expectCircaError(
      () => validateValue(value, config),
      CircaErrorCode.VALUE_OUT_OF_RANGE,
    );
  });

  it("throws INVALID_MARGIN_LOW when marginLow is negative", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: -1,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    expectCircaError(
      () => validateValue(value, config),
      CircaErrorCode.INVALID_MARGIN_LOW,
    );
  });

  it("throws INVALID_MARGIN_HIGH when marginHigh is negative", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: 10,
      marginHigh: -1,
      distribution: "normal",
      distributionParams: {},
    };
    expectCircaError(
      () => validateValue(value, config),
      CircaErrorCode.INVALID_MARGIN_HIGH,
    );
  });
});

describe("checkRequired", () => {
  it("returns true when required=false even if value is null", () => {
    const config = createDefaultConfig({ min: 0, max: 100, required: false });
    const value = createInitialValue({ distribution: "normal" });
    expect(checkRequired(value, config)).toBe(true);
  });

  it("returns false when required=true and value is null", () => {
    const config = createDefaultConfig({ min: 0, max: 100, required: true });
    const value = createInitialValue({ distribution: "normal" });
    expect(checkRequired(value, config)).toBe(false);
  });

  it("returns true when required=true and value is set", () => {
    const config = createDefaultConfig({ min: 0, max: 100, required: true });
    const value: CircaValue = {
      value: 50,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    expect(checkRequired(value, config)).toBe(true);
  });
});
