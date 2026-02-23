import { describe, expect, it } from "vitest";
import { CircaInputError } from "../errors.js";
import { createDefaultConfig, createInitialValue } from "../state.js";
import type { CircaValue } from "../types.js";
import { checkRequired, validateConfig, validateValue } from "../validation.js";

describe("validateConfig", () => {
  it("min < max の場合、エラーにならない", () => {
    const config = createDefaultConfig({ min: 0, max: 100 });
    expect(() => validateConfig(config)).not.toThrow();
  });

  it("min >= max の場合、CircaInputErrorをthrow", () => {
    const config = createDefaultConfig({ min: 100, max: 100 });
    expect(() => validateConfig(config)).toThrow(CircaInputError);
    expect(() => validateConfig(config)).toThrow(
      "min (100) must be less than max (100)",
    );
  });

  it("marginMaxが負の場合、CircaInputErrorをthrow", () => {
    const config = createDefaultConfig({ min: 0, max: 100, marginMax: -1 });
    expect(() => validateConfig(config)).toThrow(CircaInputError);
  });

  it("stepが0以下の場合、CircaInputErrorをthrow", () => {
    const config = createDefaultConfig({ min: 0, max: 100, step: 0 });
    expect(() => validateConfig(config)).toThrow(CircaInputError);
  });

  it('step="any"の場合、エラーにならない', () => {
    const config = createDefaultConfig({ min: 0, max: 100, step: "any" });
    expect(() => validateConfig(config)).not.toThrow();
  });
});

describe("validateValue", () => {
  const config = createDefaultConfig({ min: 0, max: 100 });

  it("valueがnullの場合、エラーにならない", () => {
    const value = createInitialValue({ distribution: "normal" });
    expect(() => validateValue(value, config)).not.toThrow();
  });

  it("valueが範囲内の場合、エラーにならない", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: 10,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).not.toThrow();
  });

  it("valueがmin未満の場合、CircaInputErrorをthrow", () => {
    const value: CircaValue = {
      value: -1,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).toThrow(CircaInputError);
  });

  it("valueがmaxを超える場合、CircaInputErrorをthrow", () => {
    const value: CircaValue = {
      value: 101,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).toThrow(CircaInputError);
  });

  it("marginLowが負の場合、CircaInputErrorをthrow", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: -1,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    expect(() => validateValue(value, config)).toThrow(CircaInputError);
  });

  it("marginHighが負の場合、CircaInputErrorをthrow", () => {
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
  it("required=falseの場合、value=nullでもtrue", () => {
    const config = createDefaultConfig({ min: 0, max: 100, required: false });
    const value = createInitialValue({ distribution: "normal" });
    expect(checkRequired(value, config)).toBe(true);
  });

  it("required=trueかつvalue=nullの場合、false", () => {
    const config = createDefaultConfig({ min: 0, max: 100, required: true });
    const value = createInitialValue({ distribution: "normal" });
    expect(checkRequired(value, config)).toBe(false);
  });

  it("required=trueかつvalueが設定済みの場合、true", () => {
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
