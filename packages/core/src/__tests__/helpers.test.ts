import { describe, expect, it } from "vitest";
import {
  clamp,
  deserializeCircaValue,
  generateTicks,
  percentToValue,
  serializeCircaValue,
  toPlainValue,
  valueToPercent,
} from "../helpers.js";
import type { CircaValue } from "../types.js";

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("clamps to min when below", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it("clamps to max when above", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("handles min === max", () => {
    expect(clamp(50, 10, 10)).toBe(10);
  });

  it("returns min when value equals min", () => {
    expect(clamp(0, 0, 100)).toBe(0);
  });

  it("returns max when value equals max", () => {
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

describe("toPlainValue", () => {
  it("extracts only the value from a CircaValue", () => {
    const circaValue: CircaValue = {
      value: 14.0,
      marginLow: 0.5,
      marginHigh: 2.0,
      distribution: "normal",
      distributionParams: {},
    };
    expect(toPlainValue(circaValue)).toBe(14.0);
  });

  it("returns null when value is null", () => {
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
  it("returns 50% for the midpoint between min and max", () => {
    expect(valueToPercent(50, 0, 100)).toBe(50);
  });

  it("returns 0% for the min value", () => {
    expect(valueToPercent(0, 0, 100)).toBe(0);
  });

  it("returns 100% for the max value", () => {
    expect(valueToPercent(100, 0, 100)).toBe(100);
  });

  it("returns 0 when min === max (defensive guard against division by zero)", () => {
    expect(valueToPercent(5, 5, 5)).toBe(0);
  });

  it("calculates correctly for a custom range", () => {
    expect(valueToPercent(15, 10, 20)).toBe(50);
  });
});

describe("percentToValue", () => {
  it("converts 50% to the midpoint of the min-max range", () => {
    expect(percentToValue(50, 0, 100)).toBe(50);
  });

  it("returns min for 0%", () => {
    expect(percentToValue(0, 0, 100)).toBe(0);
  });

  it("returns max for 100%", () => {
    expect(percentToValue(100, 0, 100)).toBe(100);
  });

  it("calculates correctly for a custom range", () => {
    expect(percentToValue(50, 10, 20)).toBe(15);
  });
});

describe("generateTicks", () => {
  it("generates basic ticks (0-100, interval 25)", () => {
    expect(generateTicks(0, 100, 25)).toEqual([0, 25, 50, 75, 100]);
  });

  it("appends max when it is not a multiple of tickInterval", () => {
    expect(generateTicks(0, 100, 30)).toEqual([0, 30, 60, 90, 100]);
  });

  it("returns empty array when tickInterval <= 0", () => {
    expect(generateTicks(0, 100, 0)).toEqual([]);
    expect(generateTicks(0, 100, -10)).toEqual([]);
  });

  it("returns empty array when tickInterval is non-finite", () => {
    expect(generateTicks(0, 100, Infinity)).toEqual([]);
    expect(generateTicks(0, 100, NaN)).toEqual([]);
  });

  it("returns empty array when min >= max", () => {
    expect(generateTicks(100, 0, 25)).toEqual([]);
    expect(generateTicks(50, 50, 10)).toEqual([]);
  });

  it("returns empty array when tick count exceeds 50 (performance guard)", () => {
    // 0-100, interval=1 -> 101 ticks > 50
    expect(generateTicks(0, 100, 1)).toEqual([]);
  });

  it("generates ticks when count is exactly 50", () => {
    // 0-49, interval=1 -> 50 ticks
    const ticks = generateTicks(0, 49, 1);
    expect(ticks.length).toBe(50);
    expect(ticks[0]).toBe(0);
    expect(ticks[49]).toBe(49);
  });

  it("maintains precision with floating-point tickInterval", () => {
    expect(generateTicks(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("returns empty array when min/max is non-finite", () => {
    expect(generateTicks(NaN, 100, 25)).toEqual([]);
    expect(generateTicks(0, Infinity, 25)).toEqual([]);
  });

  it("returns min and max when tickInterval equals the range", () => {
    expect(generateTicks(0, 100, 100)).toEqual([0, 100]);
  });

  it("returns min and max when tickInterval exceeds the range", () => {
    expect(generateTicks(0, 100, 200)).toEqual([0, 100]);
  });
});

describe("serializeCircaValue / deserializeCircaValue", () => {
  const base: CircaValue = {
    value: 50,
    marginLow: 5,
    marginHigh: 10,
    distribution: "normal",
    distributionParams: {},
  };

  it("round-trips a normal CircaValue", () => {
    const json = serializeCircaValue(base);
    expect(deserializeCircaValue(json)).toEqual(base);
  });

  it("preserves Infinity in marginHigh", () => {
    const val: CircaValue = { ...base, marginHigh: Infinity };
    const json = serializeCircaValue(val);
    expect(json).toContain('"Infinity"');
    expect(deserializeCircaValue(json).marginHigh).toBe(Infinity);
  });

  it("preserves -Infinity in marginLow", () => {
    const val: CircaValue = { ...base, marginLow: -Infinity };
    const json = serializeCircaValue(val);
    expect(json).toContain('"-Infinity"');
    expect(deserializeCircaValue(json).marginLow).toBe(-Infinity);
  });

  it("preserves null values (no confusion with Infinity)", () => {
    const val: CircaValue = { ...base, marginHigh: null };
    const json = serializeCircaValue(val);
    const parsed = deserializeCircaValue(json);
    expect(parsed.marginHigh).toBeNull();
  });

  it("does not convert string 'Infinity' in distributionParams", () => {
    const val: CircaValue = {
      ...base,
      distributionParams: { label: "Infinity", note: "-Infinity" },
    };
    const json = serializeCircaValue(val);
    const parsed = deserializeCircaValue(json);
    expect(parsed.distributionParams).toEqual({
      label: "Infinity",
      note: "-Infinity",
    });
  });
});
