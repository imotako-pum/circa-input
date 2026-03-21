import type { CircaValue } from "@circa-input/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatAge,
  formatBudget,
  formatCircaValue,
  formatDistance,
  formatDuration,
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

// Mock i18n module using actual translation files
vi.mock("../../i18n", async () => {
  const { ja } =
    await vi.importActual<typeof import("../../i18n/ja")>("../../i18n/ja");
  const { en } =
    await vi.importActual<typeof import("../../i18n/en")>("../../i18n/en");

  let locale: "ja" | "en" = "ja";
  const translations = { ja, en };

  return {
    t: (key: string) =>
      (translations[locale] as unknown as Record<string, string>)[key] ?? key,
    getLocale: () => locale,
    setLocale: (l: "ja" | "en") => {
      locale = l;
    },
  };
});

// Helper to switch locale in tests
async function switchLocale(locale: "ja" | "en") {
  const { setLocale } = await import("../../i18n");
  (setLocale as (l: "ja" | "en") => void)(locale);
}

describe("formatCircaValue", () => {
  it("outputs JSON format", () => {
    const v = makeValue({ value: 50 });
    const result = formatCircaValue(v);
    expect(JSON.parse(result)).toEqual(v);
  });
});

describe("formatTime (ja)", () => {
  beforeEach(async () => {
    await switchLocale("ja");
  });

  it("returns unset for null value", () => {
    expect(formatTime(makeValue())).toBe("\u672A\u8A2D\u5B9A");
  });

  it("returns time for value only (no margin)", () => {
    expect(formatTime(makeValue({ value: 14 }))).toBe("14:00");
  });

  it("returns value only for margin 0", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 0, marginHigh: 0 })),
    ).toBe("14:00");
  });

  it("returns \u00B1 notation for symmetric margin", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 1, marginHigh: 1 })),
    ).toBe("14:00 \u00B1 1\u6642\u9593");
  });

  it("handles 30min symmetric margin", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 0.5, marginHigh: 0.5 })),
    ).toBe("14:00 \u00B1 30\u5206");
  });

  it("handles 1h30min symmetric margin", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 1.5, marginHigh: 1.5 })),
    ).toBe("14:00 \u00B1 1\u6642\u959330\u5206");
  });

  it("returns range notation for asymmetric margin", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 0.5, marginHigh: 2 })),
    ).toBe("13:30 \u301C 16:00");
  });

  it("handles floating-point precision", () => {
    expect(formatTime(makeValue({ value: 14.5 }))).toBe("14:30");
  });
});

describe("formatTime (en)", () => {
  beforeEach(async () => {
    await switchLocale("en");
  });

  it("returns unset for null value", () => {
    expect(formatTime(makeValue())).toBe("Not set");
  });

  it("returns \u00B1 notation for symmetric margin", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 1, marginHigh: 1 })),
    ).toBe("14:00 \u00B1 1h");
  });

  it("handles 30min symmetric margin", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 0.5, marginHigh: 0.5 })),
    ).toBe("14:00 \u00B1 30min");
  });

  it("handles 1h30min symmetric margin", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 1.5, marginHigh: 1.5 })),
    ).toBe("14:00 \u00B1 1h 30min");
  });

  it("returns range notation for asymmetric margin", () => {
    expect(
      formatTime(makeValue({ value: 14, marginLow: 0.5, marginHigh: 2 })),
    ).toBe("13:30 \u2013 16:00");
  });
});

describe("formatBudget (ja)", () => {
  beforeEach(async () => {
    await switchLocale("ja");
  });

  it("returns unset for null value", () => {
    expect(formatBudget(makeValue())).toBe("\u672A\u8A2D\u5B9A");
  });

  it("returns amount for value only", () => {
    expect(formatBudget(makeValue({ value: 50000 }))).toBe("\u00A550,000");
  });

  it("returns \u00B1 notation for symmetric margin", () => {
    expect(
      formatBudget(
        makeValue({ value: 50000, marginLow: 10000, marginHigh: 10000 }),
      ),
    ).toBe("\u00A550,000 \u00B1 \u00A510,000");
  });

  it("returns range notation for asymmetric margin", () => {
    expect(
      formatBudget(
        makeValue({ value: 50000, marginLow: 5000, marginHigh: 20000 }),
      ),
    ).toBe("\u00A545,000 \u301C \u00A570,000");
  });
});

describe("formatTemp (ja)", () => {
  beforeEach(async () => {
    await switchLocale("ja");
  });

  it("returns unset for null value", () => {
    expect(formatTemp(makeValue())).toBe("\u672A\u8A2D\u5B9A");
  });

  it("returns temperature for value only", () => {
    expect(formatTemp(makeValue({ value: 25 }))).toBe("25\u00B0C");
  });

  it("returns \u00B1 notation for symmetric margin", () => {
    expect(
      formatTemp(makeValue({ value: 25, marginLow: 3, marginHigh: 3 })),
    ).toBe("25\u00B0C \u00B1 3\u00B0C");
  });

  it("returns range notation for asymmetric margin", () => {
    expect(
      formatTemp(makeValue({ value: 25, marginLow: 5, marginHigh: 10 })),
    ).toBe("20\u00B0C \u301C 35\u00B0C");
  });
});

describe("formatBudget (en)", () => {
  beforeEach(async () => {
    await switchLocale("en");
  });

  it("returns range with en-dash for asymmetric margin", () => {
    expect(
      formatBudget(
        makeValue({ value: 50000, marginLow: 5000, marginHigh: 20000 }),
      ),
    ).toBe("\u00A545,000 \u2013 \u00A570,000");
  });
});

describe("formatTemp (en)", () => {
  beforeEach(async () => {
    await switchLocale("en");
  });

  it("returns range with en-dash for asymmetric margin", () => {
    expect(
      formatTemp(makeValue({ value: 25, marginLow: 5, marginHigh: 10 })),
    ).toBe("20\u00B0C \u2013 35\u00B0C");
  });
});

describe("formatAge (ja)", () => {
  beforeEach(async () => {
    await switchLocale("ja");
  });

  it("returns unset for null value", () => {
    expect(formatAge(makeValue())).toBe("\u672A\u8A2D\u5B9A");
  });

  it("returns value only for zero margins", () => {
    expect(
      formatAge(makeValue({ value: 30, marginLow: 0, marginHigh: 0 })),
    ).toBe("30\u6B73");
  });

  it("returns \u00B1 notation for symmetric margin", () => {
    expect(
      formatAge(makeValue({ value: 30, marginLow: 5, marginHigh: 5 })),
    ).toBe("30\u6B73 \u00B1 5\u6B73");
  });

  it("returns range for asymmetric margin", () => {
    expect(
      formatAge(makeValue({ value: 30, marginLow: 5, marginHigh: 10 })),
    ).toBe("25\u6B73 \u301C 40\u6B73");
  });

  it("shows range when marginLow is 0 but marginHigh is not", () => {
    expect(
      formatAge(makeValue({ value: 30, marginLow: 0, marginHigh: 10 })),
    ).toBe("30\u6B73 \u301C 40\u6B73");
  });
});

describe("formatAge (en)", () => {
  beforeEach(async () => {
    await switchLocale("en");
  });

  it("returns range with space before unit", () => {
    expect(
      formatAge(makeValue({ value: 30, marginLow: 5, marginHigh: 10 })),
    ).toBe("25 years \u2013 40 years");
  });

  it("returns \u00B1 notation for symmetric margin", () => {
    expect(
      formatAge(makeValue({ value: 30, marginLow: 5, marginHigh: 5 })),
    ).toBe("30 years \u00B1 5 years");
  });
});

describe("formatDuration (ja)", () => {
  beforeEach(async () => {
    await switchLocale("ja");
  });

  it("returns unset for null value", () => {
    expect(formatDuration(makeValue())).toBe("\u672A\u8A2D\u5B9A");
  });

  it("returns duration for value only", () => {
    expect(
      formatDuration(makeValue({ value: 60, marginLow: 0, marginHigh: 0 })),
    ).toBe("1\u6642\u9593");
  });

  it("returns \u00B1 notation for symmetric margin", () => {
    expect(
      formatDuration(makeValue({ value: 60, marginLow: 15, marginHigh: 15 })),
    ).toBe("1\u6642\u9593 \u00B1 15\u5206");
  });

  it("returns range for asymmetric margin", () => {
    expect(
      formatDuration(makeValue({ value: 60, marginLow: 10, marginHigh: 30 })),
    ).toBe("50\u5206 \u301C 1\u6642\u959330\u5206");
  });

  it("handles minutes-only values", () => {
    expect(
      formatDuration(makeValue({ value: 30, marginLow: 0, marginHigh: 0 })),
    ).toBe("30\u5206");
  });
});

describe("formatDuration (en)", () => {
  beforeEach(async () => {
    await switchLocale("en");
  });

  it("returns range with en-dash for asymmetric margin", () => {
    expect(
      formatDuration(makeValue({ value: 60, marginLow: 10, marginHigh: 30 })),
    ).toBe("50min \u2013 1h 30min");
  });
});

describe("formatDistance (ja)", () => {
  beforeEach(async () => {
    await switchLocale("ja");
  });

  it("returns unset for null value", () => {
    expect(formatDistance(makeValue())).toBe("\u672A\u8A2D\u5B9A");
  });

  it("returns value only for zero margins", () => {
    expect(
      formatDistance(makeValue({ value: 20, marginLow: 0, marginHigh: 0 })),
    ).toBe("20km");
  });

  it("returns \u00B1 notation for symmetric margin", () => {
    expect(
      formatDistance(makeValue({ value: 20, marginLow: 5, marginHigh: 5 })),
    ).toBe("20km \u00B1 5km");
  });

  it("returns range for asymmetric margin", () => {
    expect(
      formatDistance(makeValue({ value: 20, marginLow: 5, marginHigh: 10 })),
    ).toBe("15km \u301C 30km");
  });
});

describe("formatDistance (en)", () => {
  beforeEach(async () => {
    await switchLocale("en");
  });

  it("returns range with en-dash for asymmetric margin", () => {
    expect(
      formatDistance(makeValue({ value: 20, marginLow: 5, marginHigh: 10 })),
    ).toBe("15km \u2013 30km");
  });
});
