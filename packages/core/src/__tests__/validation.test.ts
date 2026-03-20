import { describe, expect, it } from "vitest";
import { CircaInputError } from "../errors.js";
import { createDefaultConfig, createInitialValue } from "../state.js";
import type { CircaValue } from "../types.js";
import { checkRequired, validateConfig, validateValue } from "../validation.js";

describe("validateConfig", () => {
  it("does not throw when min < max", () => {
    const config = createDefaultConfig({ min: 0, max: 100 });
    expect(() => validateConfig(config)).not.toThrow();
  });

  it("throws CircaInputError when min >= max", () => {
    const config = createDefaultConfig({ min: 100, max: 100 });
    expect(() => validateConfig(config)).toThrow(CircaInputError);
    expect(() => validateConfig(config)).toThrow(
      "min (100) must be less than max (100)",
    );
  });

  it("throws CircaInputError when marginMax is negative", () => {
    const config = createDefaultConfig({ min: 0, max: 100, marginMax: -1 });
    expect(() => validateConfig(config)).toThrow(CircaInputError);
  });

  it("throws CircaInputError when step is 0 or negative", () => {
    const config = createDefaultConfig({ min: 0, max: 100, step: 0 });
    expect(() => validateConfig(config)).toThrow(CircaInputError);
  });

  it('does not throw when step="any"', () => {
    const config = createDefaultConfig({ min: 0, max: 100, step: "any" });
    expect(() => validateConfig(config)).not.toThrow();
  });

  it("throws CircaInputError when initialMargin is negative", () => {
    const config = createDefaultConfig({
      min: 0,
      max: 100,
      initialMargin: -1,
    });
    expect(() => validateConfig(config)).toThrow(CircaInputError);
    expect(() => validateConfig(config)).toThrow(
      "initialMargin (-1) must be non-negative",
    );
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

  it("throws CircaInputError when value is below min", () => {
    const value: CircaValue = {
      value: -1,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).toThrow(CircaInputError);
  });

  it("throws CircaInputError when value exceeds max", () => {
    const value: CircaValue = {
      value: 101,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).toThrow(CircaInputError);
  });

  it("throws CircaInputError when marginLow is negative", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: -1,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).toThrow(CircaInputError);
  });

  it("throws CircaInputError when marginHigh is negative", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: 10,
      marginHigh: -1,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).toThrow(CircaInputError);
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
