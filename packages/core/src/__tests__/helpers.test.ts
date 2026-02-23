import { describe, expect, it } from "vitest";
import { toPlainValue } from "../helpers.js";
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
