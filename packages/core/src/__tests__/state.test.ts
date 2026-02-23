import { describe, expect, it } from "vitest";
import {
  clampMargins,
  createDefaultConfig,
  createInitialValue,
  updateValue,
} from "../state.js";
import type { CircaValue } from "../types.js";

describe("createInitialValue", () => {
  it("未入力状態のCircaValueを返す", () => {
    const value = createInitialValue({ distribution: "normal" });
    expect(value).toEqual({
      value: null,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    });
  });

  it("指定したdistributionが反映される", () => {
    const value = createInitialValue({ distribution: "uniform" });
    expect(value.distribution).toBe("uniform");
  });
});

describe("createDefaultConfig", () => {
  it("min/maxを指定し、他はデフォルト値", () => {
    const config = createDefaultConfig({ min: 0, max: 100 });
    expect(config).toEqual({
      min: 0,
      max: 100,
      marginMax: null,
      distribution: "normal",
      asymmetric: false,
      step: "any",
      name: null,
      required: false,
    });
  });

  it("デフォルト値をオーバーライドできる", () => {
    const config = createDefaultConfig({
      min: 9,
      max: 21,
      asymmetric: true,
      step: 0.5,
    });
    expect(config.asymmetric).toBe(true);
    expect(config.step).toBe(0.5);
  });
});

describe("clampMargins", () => {
  const config = createDefaultConfig({ min: 0, max: 100 });

  it("valueがnullの場合、そのまま返す", () => {
    const value = createInitialValue({ distribution: "normal" });
    expect(clampMargins(value, config)).toEqual(value);
  });

  it("marginがmin/maxの範囲内の場合、そのまま返す", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: 10,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    expect(clampMargins(value, config)).toEqual(value);
  });

  it("marginLowがvalueをminより下にする場合、クランプ", () => {
    const value: CircaValue = {
      value: 5,
      marginLow: 10,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    const clamped = clampMargins(value, config);
    expect(clamped.marginLow).toBe(5);
  });

  it("marginHighがvalueをmaxより上にする場合、クランプ", () => {
    const value: CircaValue = {
      value: 95,
      marginLow: 10,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    const clamped = clampMargins(value, config);
    expect(clamped.marginHigh).toBe(5);
  });

  it("marginMaxが設定されている場合、クランプ", () => {
    const configWithMax = createDefaultConfig({
      min: 0,
      max: 100,
      marginMax: 5,
    });
    const value: CircaValue = {
      value: 50,
      marginLow: 10,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    const clamped = clampMargins(value, configWithMax);
    expect(clamped.marginLow).toBe(5);
    expect(clamped.marginHigh).toBe(5);
  });

  it("marginHighがInfinityの場合、クランプしない", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: 10,
      marginHigh: Infinity,
      distribution: "normal",
      distributionParams: {},
    };
    const clamped = clampMargins(value, config);
    expect(clamped.marginHigh).toBe(Infinity);
  });
});

describe("updateValue", () => {
  const config = createDefaultConfig({ min: 0, max: 100 });

  it("valueを更新する", () => {
    const initial = createInitialValue({ distribution: "normal" });
    const updated = updateValue(initial, { value: 50 }, config);
    expect(updated.value).toBe(50);
  });

  it("marginを更新し、クランプが適用される", () => {
    const current: CircaValue = {
      value: 5,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    };
    const updated = updateValue(
      current,
      { marginLow: 20, marginHigh: 20 },
      config,
    );
    expect(updated.marginLow).toBe(5); // clamped to value - min
    expect(updated.marginHigh).toBe(20);
  });
});
