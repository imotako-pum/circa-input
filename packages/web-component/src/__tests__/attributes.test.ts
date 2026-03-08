import { describe, expect, it } from "vitest";
import {
  buildConfig,
  buildInitialValue,
  parseBooleanAttr,
  parseNumberAttr,
} from "../attributes";

describe("parseNumberAttr", () => {
  it("数値文字列をnumberに変換する", () => {
    expect(parseNumberAttr("42")).toBe(42);
    expect(parseNumberAttr("3.14")).toBe(3.14);
    expect(parseNumberAttr("-10")).toBe(-10);
  });

  it("nullを返す: null入力", () => {
    expect(parseNumberAttr(null)).toBeNull();
  });

  it("nullを返す: 空文字列", () => {
    expect(parseNumberAttr("")).toBeNull();
  });

  it("nullを返す: 数値でない文字列", () => {
    expect(parseNumberAttr("abc")).toBeNull();
    expect(parseNumberAttr("12px")).toBeNull();
  });

  it("0を正しく数値として扱う", () => {
    expect(parseNumberAttr("0")).toBe(0);
  });
});

describe("parseBooleanAttr", () => {
  it("nullでfalseを返す（属性なし）", () => {
    expect(parseBooleanAttr(null)).toBe(false);
  });

  it("空文字列でtrueを返す（属性存在、値なし）", () => {
    expect(parseBooleanAttr("")).toBe(true);
  });

  it("任意の文字列でtrueを返す", () => {
    expect(parseBooleanAttr("true")).toBe(true);
    expect(parseBooleanAttr("false")).toBe(true); // HTML仕様: 属性が存在すればtrue
    expect(parseBooleanAttr("asymmetric")).toBe(true);
  });
});

describe("buildConfig", () => {
  const makeGetAttr = (attrs: Record<string, string>) => {
    return (name: string) => attrs[name] ?? null;
  };

  it("min/maxを正しく読み取る", () => {
    const config = buildConfig(makeGetAttr({ min: "0", max: "100" }));
    expect(config.min).toBe(0);
    expect(config.max).toBe(100);
  });

  it("min/max未指定時にデフォルト値（0, 100）を使う", () => {
    const config = buildConfig(makeGetAttr({}));
    expect(config.min).toBe(0);
    expect(config.max).toBe(100);
  });

  it("すべてのオプション属性を読み取る", () => {
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

  it("step未指定時は'any'を使う", () => {
    const config = buildConfig(makeGetAttr({ min: "0", max: "100" }));
    expect(config.step).toBe("any");
  });

  it("margin-max未指定時はnullを使う", () => {
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

  it("属性なしで未入力状態を返す", () => {
    const val = buildInitialValue(makeGetAttr({}), defaultConfig);
    expect(val.value).toBeNull();
    expect(val.marginLow).toBeNull();
    expect(val.marginHigh).toBeNull();
    expect(val.distribution).toBe("normal");
  });

  it("default-* 属性で初期値を設定する", () => {
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

  it("value属性（controlled）がある場合はdefault-*より優先する", () => {
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

  it("configのdistributionを使用する", () => {
    const uniformConfig = { ...defaultConfig, distribution: "uniform" as const };
    const val = buildInitialValue(makeGetAttr({}), uniformConfig);
    expect(val.distribution).toBe("uniform");
  });
});
