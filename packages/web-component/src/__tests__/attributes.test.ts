import { describe, expect, it } from "vitest";
import {
  buildConfig,
  buildInitialValue,
  parseBooleanAttr,
  parseNumberAttr,
} from "../attributes";

describe("parseNumberAttr", () => {
  it("converts numeric strings to numbers", () => {
    expect(parseNumberAttr("42")).toBe(42);
    expect(parseNumberAttr("3.14")).toBe(3.14);
    expect(parseNumberAttr("-10")).toBe(-10);
  });

  it("returns null for null input", () => {
    expect(parseNumberAttr(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseNumberAttr("")).toBeNull();
  });

  it("returns null for non-numeric strings", () => {
    expect(parseNumberAttr("abc")).toBeNull();
    expect(parseNumberAttr("12px")).toBeNull();
  });

  it("correctly handles 0 as a number", () => {
    expect(parseNumberAttr("0")).toBe(0);
  });
});

describe("parseBooleanAttr", () => {
  it("returns false for null (attribute absent)", () => {
    expect(parseBooleanAttr(null)).toBe(false);
  });

  it("returns true for empty string (attribute present, no value)", () => {
    expect(parseBooleanAttr("")).toBe(true);
  });

  it("returns true for any string", () => {
    expect(parseBooleanAttr("true")).toBe(true);
    expect(parseBooleanAttr("false")).toBe(true); // HTML spec: true if attribute exists
    expect(parseBooleanAttr("asymmetric")).toBe(true);
  });
});

describe("buildConfig", () => {
  const makeGetAttr = (attrs: Record<string, string>) => {
    return (name: string) => attrs[name] ?? null;
  };

  it("correctly reads min/max", () => {
    const config = buildConfig(makeGetAttr({ min: "0", max: "100" }));
    expect(config.min).toBe(0);
    expect(config.max).toBe(100);
  });

  it("uses default values (0, 100) when min/max are not specified", () => {
    const config = buildConfig(makeGetAttr({}));
    expect(config.min).toBe(0);
    expect(config.max).toBe(100);
  });

  it("reads all optional attributes", () => {
    const config = buildConfig(
      makeGetAttr({
        min: "10",
        max: "20",
        "margin-max": "5",
        distribution: "uniform",
        asymmetric: "",
        step: "0.5",
        name: "delivery",
        required: "",
      }),
    );
    expect(config.min).toBe(10);
    expect(config.max).toBe(20);
    expect(config.marginMax).toBe(5);
    expect(config.distribution).toBe("uniform");
    expect(config.asymmetric).toBe(true);
    expect(config.step).toBe(0.5);
    expect(config.name).toBe("delivery");
    expect(config.required).toBe(true);
  });

  it("uses 'any' when step is not specified", () => {
    const config = buildConfig(makeGetAttr({ min: "0", max: "100" }));
    expect(config.step).toBe("any");
  });

  it("invalid distribution value falls back to default 'normal'", () => {
    const config = buildConfig(
      makeGetAttr({ min: "0", max: "100", distribution: "invalid" }),
    );
    expect(config.distribution).toBe("normal");
  });

  it("valid distribution values are used as-is", () => {
    expect(
      buildConfig(makeGetAttr({ distribution: "normal" })).distribution,
    ).toBe("normal");
    expect(
      buildConfig(makeGetAttr({ distribution: "uniform" })).distribution,
    ).toBe("uniform");
    expect(
      buildConfig(makeGetAttr({ distribution: "skewed" })).distribution,
    ).toBe("skewed");
  });

  it("uses null when margin-max is not specified", () => {
    const config = buildConfig(makeGetAttr({ min: "0", max: "100" }));
    expect(config.marginMax).toBeNull();
  });
});

describe("buildInitialValue", () => {
  const makeGetAttr = (attrs: Record<string, string>) => {
    return (name: string) => attrs[name] ?? null;
  };

  const defaultConfig = {
    min: 0,
    max: 100,
    marginMax: null,
    distribution: "normal" as const,
    asymmetric: false,
    step: "any" as const,
    name: null,
    required: false,
  };

  it("returns unset state when no attributes are provided", () => {
    const val = buildInitialValue(makeGetAttr({}), defaultConfig);
    expect(val.value).toBeNull();
    expect(val.marginLow).toBeNull();
    expect(val.marginHigh).toBeNull();
    expect(val.distribution).toBe("normal");
  });

  it("sets initial values via default-* attributes", () => {
    const val = buildInitialValue(
      makeGetAttr({
        "default-value": "50",
        "default-margin-low": "5",
        "default-margin-high": "10",
      }),
      defaultConfig,
    );
    expect(val.value).toBe(50);
    expect(val.marginLow).toBe(5);
    expect(val.marginHigh).toBe(10);
  });

  it("value attribute (controlled) takes priority over default-*", () => {
    const val = buildInitialValue(
      makeGetAttr({
        value: "75",
        "default-value": "50",
        "margin-low": "3",
        "margin-high": "7",
      }),
      defaultConfig,
    );
    expect(val.value).toBe(75);
    expect(val.marginLow).toBe(3);
    expect(val.marginHigh).toBe(7);
  });

  it("uses the distribution from config", () => {
    const uniformConfig = {
      ...defaultConfig,
      distribution: "uniform" as const,
    };
    const val = buildInitialValue(makeGetAttr({}), uniformConfig);
    expect(val.distribution).toBe("uniform");
  });
});
