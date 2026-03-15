import { describe, expect, it } from "vitest";
import { en } from "../en";
import { ja } from "../ja";

describe("i18n translations", () => {
  it("ja and en have the same keys", () => {
    const jaKeys = Object.keys(ja).sort();
    const enKeys = Object.keys(en).sort();
    expect(jaKeys).toEqual(enKeys);
  });

  it("no empty translation values in ja", () => {
    for (const [key, val] of Object.entries(ja)) {
      expect(val, `ja["${key}"] should not be empty`).not.toBe("");
    }
  });

  it("no empty translation values in en", () => {
    for (const [key, val] of Object.entries(en)) {
      expect(val, `en["${key}"] should not be empty`).not.toBe("");
    }
  });

  it("format.range contains {low} and {high} placeholders", () => {
    expect(ja["format.range"]).toContain("{low}");
    expect(ja["format.range"]).toContain("{high}");
    expect(en["format.range"]).toContain("{low}");
    expect(en["format.range"]).toContain("{high}");
  });

  it("format.hourUnit contains {h} placeholder", () => {
    expect(ja["format.hourUnit"]).toContain("{h}");
    expect(en["format.hourUnit"]).toContain("{h}");
  });

  it("format.minuteUnit contains {m} placeholder", () => {
    expect(ja["format.minuteUnit"]).toContain("{m}");
    expect(en["format.minuteUnit"]).toContain("{m}");
  });
});
