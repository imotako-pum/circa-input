import type { CircaValue } from "@circa-input/core";
import { describe, expect, it } from "vitest";
import {
  formatBudget,
  formatCircaValue,
  formatTemp,
  formatTime,
} from "../format";

function makeValue(overrides: Partial<CircaValue> = {}): CircaValue {
  return {
    value: null,
    marginLow: null,
    marginHigh: null,
    distribution: "normal",
    distributionParams: {},
    ...overrides,
  };
}

describe("formatCircaValue", () => {
  it("JSONフォーマットで出力する", () => {
    const v = makeValue({ value: 50 });
    const result = formatCircaValue(v);
    expect(JSON.parse(result)).toEqual(v);
  });
});

describe("formatTime", () => {
  it("null値で未設定を返す", () => {
    expect(formatTime(makeValue())).toBe("未設定");
  });

  it("値のみ（マージンなし）で時刻を返す", () => {
    expect(formatTime(makeValue({ value: 14 }))).toBe("14:00");
  });

  it("マージン0で値のみ返す", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 0, marginHigh: 0 })),
    ).toBe("14:00");
  });

  it("対称マージンで±表記を返す", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 1, marginHigh: 1 })),
    ).toBe("14:00 ± 1時間");
  });

  it("30分の対称マージン", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 0.5, marginHigh: 0.5 })),
    ).toBe("14:00 ± 30分");
  });

  it("1時間30分の対称マージン", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 1.5, marginHigh: 1.5 })),
    ).toBe("14:00 ± 1時間30分");
  });

  it("非対称マージンで範囲表記を返す", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 0.5, marginHigh: 2 })),
    ).toBe("13:30 〜 16:00");
  });

  it("浮動小数点精度問題が発生しない", () => {
    // 14.5 → 14:30 (not 14:30 with rounding errors)
    expect(formatTime(makeValue({ value: 14.5 }))).toBe("14:30");
  });
});

describe("formatBudget", () => {
  it("null値で未設定を返す", () => {
    expect(formatBudget(makeValue())).toBe("未設定");
  });

  it("値のみで金額を返す", () => {
    expect(formatBudget(makeValue({ value: 50000 }))).toBe("\u00A550,000");
  });

  it("対称マージンで±表記を返す", () => {
    expect(
      formatBudget(
        makeValue({ value: 50000, marginLow: 10000, marginHigh: 10000 }),
      ),
    ).toBe("\u00A550,000 ± \u00A510,000");
  });

  it("非対称マージンで範囲表記を返す", () => {
    expect(
      formatBudget(
        makeValue({ value: 50000, marginLow: 5000, marginHigh: 20000 }),
      ),
    ).toBe("\u00A545,000 〜 \u00A570,000");
  });
});

describe("formatTemp", () => {
  it("null値で未設定を返す", () => {
    expect(formatTemp(makeValue())).toBe("未設定");
  });

  it("値のみで気温を返す", () => {
    expect(formatTemp(makeValue({ value: 25 }))).toBe("25\u00B0C");
  });

  it("対称マージンで±表記を返す", () => {
    expect(
      formatTemp(makeValue({ value: 25, marginLow: 3, marginHigh: 3 })),
    ).toBe("25\u00B0C ± 3\u00B0C");
  });

  it("非対称マージンで範囲表記を返す", () => {
    expect(
      formatTemp(makeValue({ value: 25, marginLow: 5, marginHigh: 10 })),
    ).toBe("20\u00B0C 〜 35\u00B0C");
  });
});
