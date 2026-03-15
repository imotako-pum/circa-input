import { describe, expect, it } from "vitest";
import { clientXToPercent, percentToValue, valueToPercent } from "../dom-utils";

describe("valueToPercent", () => {
  it("converts min to 0%", () => {
    expect(valueToPercent(0, 0, 100)).toBe(0);
  });

  it("converts max to 100%", () => {
    expect(valueToPercent(100, 0, 100)).toBe(100);
  });

  it("correctly converts intermediate values to percent", () => {
    expect(valueToPercent(50, 0, 100)).toBe(50);
    expect(valueToPercent(25, 0, 200)).toBe(12.5);
  });

  it("correctly converts with non-zero min/max range", () => {
    expect(valueToPercent(15, 10, 20)).toBe(50);
    expect(valueToPercent(10, 10, 20)).toBe(0);
    expect(valueToPercent(20, 10, 20)).toBe(100);
  });

  it("correctly converts with negative range", () => {
    expect(valueToPercent(0, -50, 50)).toBe(50);
    expect(valueToPercent(-50, -50, 50)).toBe(0);
  });

  it("returns 0% when min === max (division by zero guard)", () => {
    expect(valueToPercent(5, 5, 5)).toBe(0);
    expect(valueToPercent(0, 0, 0)).toBe(0);
  });
});

describe("percentToValue", () => {
  it("converts 0% to min", () => {
    expect(percentToValue(0, 0, 100)).toBe(0);
  });

  it("converts 100% to max", () => {
    expect(percentToValue(100, 0, 100)).toBe(100);
  });

  it("correctly converts intermediate percent to value", () => {
    expect(percentToValue(50, 0, 200)).toBe(100);
    expect(percentToValue(25, 0, 100)).toBe(25);
  });

  it("correctly converts with custom range", () => {
    expect(percentToValue(50, 10, 20)).toBe(15);
    expect(percentToValue(0, 10, 20)).toBe(10);
    expect(percentToValue(100, 10, 20)).toBe(20);
  });
});

describe("clientXToPercent", () => {
  it("returns 0% at track left edge", () => {
    expect(clientXToPercent(100, 100, 200)).toBe(0);
  });

  it("returns 100% at track right edge", () => {
    expect(clientXToPercent(300, 100, 200)).toBe(100);
  });

  it("returns 50% at track center", () => {
    expect(clientXToPercent(200, 100, 200)).toBe(50);
  });

  it("clamps to 0% outside track left", () => {
    expect(clientXToPercent(50, 100, 200)).toBe(0);
  });

  it("clamps to 100% outside track right", () => {
    expect(clientXToPercent(400, 100, 200)).toBe(100);
  });

  it("returns 0% when track width is 0", () => {
    expect(clientXToPercent(100, 100, 0)).toBe(0);
  });
});
