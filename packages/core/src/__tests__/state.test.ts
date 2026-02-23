import { describe, expect, it } from "vitest";
import {
  clampMargins,
  createDefaultConfig,
  createInitialValue,
  snapToStep,
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

describe("snapToStep", () => {
  it("step='any'のときはそのまま返す", () => {
    expect(snapToStep(13.7, { min: 0, max: 100, step: "any" })).toBe(13.7);
  });

  it("最も近いstep刻みにスナップする", () => {
    expect(snapToStep(13, { min: 0, max: 100, step: 5 })).toBe(15);
    expect(snapToStep(12, { min: 0, max: 100, step: 5 })).toBe(10);
  });

  it("ちょうどstep刻みの値はそのまま", () => {
    expect(snapToStep(15, { min: 0, max: 100, step: 5 })).toBe(15);
  });

  it("minを基準にスナップする", () => {
    // min=2, step=5 → 有効な値: 2, 7, 12, 17, ...
    expect(snapToStep(10, { min: 2, max: 100, step: 5 })).toBe(12);
  });

  it("maxを超えない", () => {
    expect(snapToStep(99, { min: 0, max: 100, step: 5 })).toBe(100);
    expect(snapToStep(100, { min: 0, max: 97, step: 5 })).toBe(97);
  });

  it("minを下回らない", () => {
    expect(snapToStep(-5, { min: 0, max: 100, step: 5 })).toBe(0);
  });

  it("小数stepでも浮動小数点誤差が出ない", () => {
    expect(snapToStep(0.3, { min: 0, max: 1, step: 0.1 })).toBe(0.3);
    expect(snapToStep(0.14, { min: 0, max: 1, step: 0.1 })).toBe(0.1);
    // 0.15はIEEE 754では0.14999...なので0.1にスナップされる（HTMLの<input step>と同じ挙動）
    expect(snapToStep(0.15, { min: 0, max: 1, step: 0.1 })).toBe(0.1);
    expect(snapToStep(0.16, { min: 0, max: 1, step: 0.1 })).toBe(0.2);
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

  describe("stepスナップ", () => {
    const stepConfig = createDefaultConfig({ min: 0, max: 100, step: 5 });

    it("valueがstep刻みにスナップされる", () => {
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 13 }, stepConfig);
      expect(updated.value).toBe(15);
    });

    it("ちょうどstep刻みの値はそのまま", () => {
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 20 }, stepConfig);
      expect(updated.value).toBe(20);
    });

    it("step='any'の場合はスナップしない", () => {
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 13 }, config);
      expect(updated.value).toBe(13);
    });

    it("スナップ結果がmaxを超えない", () => {
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 99 }, stepConfig);
      expect(updated.value).toBe(100);
    });

    it("小数stepに対応する（浮動小数点誤差なし）", () => {
      const decimalConfig = createDefaultConfig({
        min: 0,
        max: 10,
        step: 0.1,
      });
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 3.14 }, decimalConfig);
      expect(updated.value).toBe(3.1);
    });

    it("minが0以外のときもminを基準にスナップする", () => {
      const offsetConfig = createDefaultConfig({
        min: 1,
        max: 21,
        step: 5,
      });
      const initial = createInitialValue({ distribution: "normal" });
      // min=1, step=5 → 有効な値: 1, 6, 11, 16, 21
      const updated = updateValue(initial, { value: 13 }, offsetConfig);
      expect(updated.value).toBe(11);
    });
  });

  describe("対称モード連動（asymmetric=false）", () => {
    it("marginLowだけ更新するとmarginHighも同期される", () => {
      const current: CircaValue = {
        value: 50,
        marginLow: null,
        marginHigh: null,
        distribution: "normal",
        distributionParams: {},
      };
      const updated = updateValue(current, { marginLow: 10 }, config);
      expect(updated.marginLow).toBe(10);
      expect(updated.marginHigh).toBe(10);
    });

    it("marginHighだけ更新するとmarginLowも同期される", () => {
      const current: CircaValue = {
        value: 50,
        marginLow: null,
        marginHigh: null,
        distribution: "normal",
        distributionParams: {},
      };
      const updated = updateValue(current, { marginHigh: 15 }, config);
      expect(updated.marginLow).toBe(15);
      expect(updated.marginHigh).toBe(15);
    });

    it("同期後もクランプが適用される", () => {
      const current: CircaValue = {
        value: 5,
        marginLow: null,
        marginHigh: null,
        distribution: "normal",
        distributionParams: {},
      };
      // marginHigh=20はそのまま通るが、marginLow=20はvalue-min=5にクランプ
      const updated = updateValue(current, { marginHigh: 20 }, config);
      expect(updated.marginHigh).toBe(20);
      expect(updated.marginLow).toBe(5); // clamped: value(5) - min(0) = 5
    });

    it("asymmetric=trueの場合は同期しない", () => {
      const asymConfig = createDefaultConfig({
        min: 0,
        max: 100,
        asymmetric: true,
      });
      const current: CircaValue = {
        value: 50,
        marginLow: 5,
        marginHigh: 5,
        distribution: "normal",
        distributionParams: {},
      };
      const updated = updateValue(current, { marginLow: 10 }, asymConfig);
      expect(updated.marginLow).toBe(10);
      expect(updated.marginHigh).toBe(5); // 変更されない
    });
  });
});
