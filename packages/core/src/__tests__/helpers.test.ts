import { describe, expect, it } from "vitest";
import {
  generateTicks,
  percentToValue,
  toPlainValue,
  valueToPercent,
} from "../helpers.js";
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

describe("generateTicks", () => {
  it("基本的な目盛り生成（0〜100、間隔25）", () => {
    expect(generateTicks(0, 100, 25)).toEqual([0, 25, 50, 75, 100]);
  });

  it("maxがtickIntervalの倍数でない場合、maxを追加する", () => {
    expect(generateTicks(0, 100, 30)).toEqual([0, 30, 60, 90, 100]);
  });

  it("tickInterval <= 0 の場合は空配列", () => {
    expect(generateTicks(0, 100, 0)).toEqual([]);
    expect(generateTicks(0, 100, -10)).toEqual([]);
  });

  it("tickIntervalが非有限値の場合は空配列", () => {
    expect(generateTicks(0, 100, Infinity)).toEqual([]);
    expect(generateTicks(0, 100, NaN)).toEqual([]);
  });

  it("min >= max の場合は空配列", () => {
    expect(generateTicks(100, 0, 25)).toEqual([]);
    expect(generateTicks(50, 50, 10)).toEqual([]);
  });

  it("目盛り数が50を超える場合は空配列（パフォーマンス保護）", () => {
    // 0〜100, interval=1 → 101目盛り > 50
    expect(generateTicks(0, 100, 1)).toEqual([]);
  });

  it("目盛り数がちょうど50の場合は生成する", () => {
    // 0〜49, interval=1 → 50目盛り
    const ticks = generateTicks(0, 49, 1);
    expect(ticks.length).toBe(50);
    expect(ticks[0]).toBe(0);
    expect(ticks[49]).toBe(49);
  });

  it("浮動小数点のtickIntervalで精度が保たれる", () => {
    expect(generateTicks(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("min/maxが非有限値の場合は空配列", () => {
    expect(generateTicks(NaN, 100, 25)).toEqual([]);
    expect(generateTicks(0, Infinity, 25)).toEqual([]);
  });

  it("tickInterval == range の場合はminとmaxの2つ", () => {
    expect(generateTicks(0, 100, 100)).toEqual([0, 100]);
  });

  it("tickInterval > range の場合はminとmaxの2つ", () => {
    expect(generateTicks(0, 100, 200)).toEqual([0, 100]);
  });
});
