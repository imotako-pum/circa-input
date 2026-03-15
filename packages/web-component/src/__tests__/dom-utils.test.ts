import { describe, expect, it } from "vitest";
import { clientXToPercent, percentToValue, valueToPercent } from "../dom-utils";

describe("valueToPercent", () => {
  it("min を 0% に変換する", () => {
    expect(valueToPercent(0, 0, 100)).toBe(0);
  });

  it("max を 100% に変換する", () => {
    expect(valueToPercent(100, 0, 100)).toBe(100);
  });

  it("中間値を正しくパーセントに変換する", () => {
    expect(valueToPercent(50, 0, 100)).toBe(50);
    expect(valueToPercent(25, 0, 200)).toBe(12.5);
  });

  it("min/maxがゼロでない範囲でも正しく変換する", () => {
    expect(valueToPercent(15, 10, 20)).toBe(50);
    expect(valueToPercent(10, 10, 20)).toBe(0);
    expect(valueToPercent(20, 10, 20)).toBe(100);
  });

  it("負の範囲でも正しく変換する", () => {
    expect(valueToPercent(0, -50, 50)).toBe(50);
    expect(valueToPercent(-50, -50, 50)).toBe(0);
  });

  it("min === max の場合0%を返す（ゼロ除算ガード）", () => {
    expect(valueToPercent(5, 5, 5)).toBe(0);
    expect(valueToPercent(0, 0, 0)).toBe(0);
  });
});

describe("percentToValue", () => {
  it("0% を min に変換する", () => {
    expect(percentToValue(0, 0, 100)).toBe(0);
  });

  it("100% を max に変換する", () => {
    expect(percentToValue(100, 0, 100)).toBe(100);
  });

  it("中間パーセントを正しく値に変換する", () => {
    expect(percentToValue(50, 0, 200)).toBe(100);
    expect(percentToValue(25, 0, 100)).toBe(25);
  });

  it("カスタム範囲で正しく変換する", () => {
    expect(percentToValue(50, 10, 20)).toBe(15);
    expect(percentToValue(0, 10, 20)).toBe(10);
    expect(percentToValue(100, 10, 20)).toBe(20);
  });
});

describe("clientXToPercent", () => {
  it("トラック左端で0%を返す", () => {
    expect(clientXToPercent(100, 100, 200)).toBe(0);
  });

  it("トラック右端で100%を返す", () => {
    expect(clientXToPercent(300, 100, 200)).toBe(100);
  });

  it("トラック中央で50%を返す", () => {
    expect(clientXToPercent(200, 100, 200)).toBe(50);
  });

  it("トラック左外を0%にクランプする", () => {
    expect(clientXToPercent(50, 100, 200)).toBe(0);
  });

  it("トラック右外を100%にクランプする", () => {
    expect(clientXToPercent(400, 100, 200)).toBe(100);
  });

  it("トラック幅が0の場合0%を返す", () => {
    expect(clientXToPercent(100, 100, 0)).toBe(0);
  });
});
