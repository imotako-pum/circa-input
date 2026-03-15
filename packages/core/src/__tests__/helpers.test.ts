import { describe, expect, it } from "vitest";
import { percentToValue, toPlainValue, valueToPercent } from "../helpers.js";
import type { CircaValue } from "../types.js";

describe("toPlainValue", () => {
  it("CircaValueからvalueのみを取り出す", () => {
    const circaValue: CircaValue = {
      value: 14.0,
      marginLow: 0.5,
      marginHigh: 2.0,
      distribution: "normal",
      distributionParams: {},
    };
    expect(toPlainValue(circaValue)).toBe(14.0);
  });

  it("valueがnullの場合、nullを返す", () => {
    const circaValue: CircaValue = {
      value: null,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    expect(toPlainValue(circaValue)).toBeNull();
  });
});

describe("valueToPercent", () => {
  it("minとmaxの中間値で50%を返す", () => {
    expect(valueToPercent(50, 0, 100)).toBe(50);
  });

  it("min値で0%を返す", () => {
    expect(valueToPercent(0, 0, 100)).toBe(0);
  });

  it("max値で100%を返す", () => {
    expect(valueToPercent(100, 0, 100)).toBe(100);
  });

  it("min === maxの場合は0を返す", () => {
    expect(valueToPercent(5, 5, 5)).toBe(0);
  });

  it("カスタム範囲で正しく計算する", () => {
    expect(valueToPercent(15, 10, 20)).toBe(50);
  });
});

describe("percentToValue", () => {
  it("50%をmin-max範囲の中間値に変換する", () => {
    expect(percentToValue(50, 0, 100)).toBe(50);
  });

  it("0%でminを返す", () => {
    expect(percentToValue(0, 0, 100)).toBe(0);
  });

  it("100%でmaxを返す", () => {
    expect(percentToValue(100, 0, 100)).toBe(100);
  });

  it("カスタム範囲で正しく計算する", () => {
    expect(percentToValue(50, 10, 20)).toBe(15);
  });
});
