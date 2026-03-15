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
  it("returns an empty CircaValue", () => {
    const value = createInitialValue({ distribution: "normal" });
    expect(value).toEqual({
      value: null,
      marginLow: null,
      marginHigh: null,
      distribution: "normal",
      distributionParams: {},
    });
  });

  it("reflects the specified distribution", () => {
    const value = createInitialValue({ distribution: "uniform" });
    expect(value.distribution).toBe("uniform");
  });
});

describe("createDefaultConfig", () => {
  it("sets min/max with default values for the rest", () => {
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

  it("allows overriding default values", () => {
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
  it("returns the value as-is when step='any'", () => {
    expect(snapToStep(13.7, { min: 0, max: 100, step: "any" })).toBe(13.7);
  });

  it("snaps to the nearest step increment", () => {
    expect(snapToStep(13, { min: 0, max: 100, step: 5 })).toBe(15);
    expect(snapToStep(12, { min: 0, max: 100, step: 5 })).toBe(10);
  });

  it("keeps values that are exactly on a step", () => {
    expect(snapToStep(15, { min: 0, max: 100, step: 5 })).toBe(15);
  });

  it("snaps relative to min", () => {
    // min=2, step=5 -> valid values: 2, 7, 12, 17, ...
    expect(snapToStep(10, { min: 2, max: 100, step: 5 })).toBe(12);
  });

  it("does not exceed max", () => {
    expect(snapToStep(99, { min: 0, max: 100, step: 5 })).toBe(100);
    expect(snapToStep(100, { min: 0, max: 97, step: 5 })).toBe(97);
  });

  it("does not go below min", () => {
    expect(snapToStep(-5, { min: 0, max: 100, step: 5 })).toBe(0);
  });

  it("avoids floating-point errors with decimal steps", () => {
    expect(snapToStep(0.3, { min: 0, max: 1, step: 0.1 })).toBe(0.3);
    expect(snapToStep(0.14, { min: 0, max: 1, step: 0.1 })).toBe(0.1);
    // 0.15 is 0.14999... in IEEE 754, so it snaps to 0.1 (same behavior as HTML <input step>)
    expect(snapToStep(0.15, { min: 0, max: 1, step: 0.1 })).toBe(0.1);
    expect(snapToStep(0.16, { min: 0, max: 1, step: 0.1 })).toBe(0.2);
  });
});

describe("clampMargins", () => {
  const config = createDefaultConfig({ min: 0, max: 100 });

  it("returns as-is when value is null", () => {
    const value = createInitialValue({ distribution: "normal" });
    expect(clampMargins(value, config)).toEqual(value);
  });

  it("returns as-is when margins are within min/max range", () => {
    const value: CircaValue = {
      value: 50,
      marginLow: 10,
      marginHigh: 10,
      distribution: "normal",
      distributionParams: {},
    };
    expect(clampMargins(value, config)).toEqual(value);
  });

  it("clamps marginLow when it would push value below min", () => {
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

  it("clamps marginHigh when it would push value above max", () => {
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

  it("clamps when marginMax is set", () => {
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

  it("does not clamp when marginHigh is Infinity", () => {
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

  it("updates the value", () => {
    const initial = createInitialValue({ distribution: "normal" });
    const updated = updateValue(initial, { value: 50 }, config);
    expect(updated.value).toBe(50);
  });

  it("updates margins with clamping applied", () => {
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

  describe("step snapping", () => {
    const stepConfig = createDefaultConfig({ min: 0, max: 100, step: 5 });

    it("snaps value to step increments", () => {
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 13 }, stepConfig);
      expect(updated.value).toBe(15);
    });

    it("keeps values that are exactly on a step", () => {
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 20 }, stepConfig);
      expect(updated.value).toBe(20);
    });

    it("does not snap when step='any'", () => {
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 13 }, config);
      expect(updated.value).toBe(13);
    });

    it("snap result does not exceed max", () => {
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 99 }, stepConfig);
      expect(updated.value).toBe(100);
    });

    it("handles decimal steps without floating-point errors", () => {
      const decimalConfig = createDefaultConfig({
        min: 0,
        max: 10,
        step: 0.1,
      });
      const initial = createInitialValue({ distribution: "normal" });
      const updated = updateValue(initial, { value: 3.14 }, decimalConfig);
      expect(updated.value).toBe(3.1);
    });

    it("snaps relative to min when min is non-zero", () => {
      const offsetConfig = createDefaultConfig({
        min: 1,
        max: 21,
        step: 5,
      });
      const initial = createInitialValue({ distribution: "normal" });
      // min=1, step=5 -> valid values: 1, 6, 11, 16, 21
      const updated = updateValue(initial, { value: 13 }, offsetConfig);
      expect(updated.value).toBe(11);
    });
  });

  describe("symmetric mode sync (asymmetric=false)", () => {
    it("syncs marginHigh when only marginLow is updated", () => {
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

    it("syncs marginLow when only marginHigh is updated", () => {
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

    it("applies clamping after sync", () => {
      const current: CircaValue = {
        value: 5,
        marginLow: null,
        marginHigh: null,
        distribution: "normal",
        distributionParams: {},
      };
      // marginHigh=20 passes through, but marginLow=20 is clamped to value-min=5
      const updated = updateValue(current, { marginHigh: 20 }, config);
      expect(updated.marginHigh).toBe(20);
      expect(updated.marginLow).toBe(5); // clamped: value(5) - min(0) = 5
    });

    it("does not sync when asymmetric=true", () => {
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
      expect(updated.marginHigh).toBe(5); // unchanged
    });
  });

  describe("symmetric mode with both marginLow and marginHigh", () => {
    it("prefers marginLow when both are specified", () => {
      const config = createDefaultConfig({ min: 0, max: 100 });
      const current: CircaValue = {
        value: 50,
        marginLow: 5,
        marginHigh: 5,
        distribution: "normal",
        distributionParams: {},
      };
      const updated = updateValue(
        current,
        { marginLow: 10, marginHigh: 20 },
        config,
      );
      // In symmetric mode, marginLow is preferred and mirrored to marginHigh
      expect(updated.marginLow).toBe(10);
      expect(updated.marginHigh).toBe(10);
    });
  });
});
