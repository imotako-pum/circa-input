/**
 * HTML属性のパースとconfig構築（純粋関数）
 *
 * <circa-input> の HTML属性を読み取り、coreの CircaInputConfig に変換する。
 * DOM操作はせず、文字列→型変換のみを行う。
 */
import type { CircaInputConfig, CircaValue, Distribution } from "@circa-input/core";
import { createDefaultConfig, createInitialValue } from "@circa-input/core";

/** 有効なdistribution値 */
const VALID_DISTRIBUTIONS: readonly string[] = ["normal", "uniform", "skewed"];

/**
 * distribution属性をパースし、無効な値は"normal"にフォールバックする。
 */
function parseDistribution(raw: string | null): Distribution {
  if (raw !== null && VALID_DISTRIBUTIONS.includes(raw)) {
    return raw as Distribution;
  }
  return "normal";
}

/**
 * 文字列をnumber | nullに変換する。
 * 空文字やnullはnullを返す。数値として不正な文字列もnullを返す。
 */
export function parseNumberAttr(value: string | null): number | null {
  if (value === null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  // "12px" のような文字列を除外: Number()はNaNを返すので上で除外済み
  return num;
}

/**
 * boolean属性のパース。
 * HTML仕様に従い、属性が存在すればtrue（値は関係ない）。
 */
export function parseBooleanAttr(value: string | null): boolean {
  return value !== null;
}

/**
 * HTML属性からCircaInputConfigを構築する。
 * min/maxが未指定の場合はデフォルト値（0, 100）を使用する。
 */
export function buildConfig(
  getAttr: (name: string) => string | null,
): CircaInputConfig {
  const min = parseNumberAttr(getAttr("min")) ?? 0;
  const max = parseNumberAttr(getAttr("max")) ?? 100;
  const marginMax = parseNumberAttr(getAttr("margin-max"));
  const distribution = parseDistribution(getAttr("distribution"));
  const asymmetric = parseBooleanAttr(getAttr("asymmetric"));
  const stepRaw = parseNumberAttr(getAttr("step"));
  const step: number | "any" = stepRaw ?? "any";
  const name = getAttr("name");
  const required = parseBooleanAttr(getAttr("required"));

  return createDefaultConfig({
    min,
    max,
    marginMax,
    distribution,
    asymmetric,
    step,
    name,
    required,
  });
}

/**
 * default-* 属性またはcontrolled属性から初期CircaValueを構築する。
 * controlled（value属性が存在する）の場合はcontrolled属性を優先。
 */
export function buildInitialValue(
  getAttr: (name: string) => string | null,
  config: CircaInputConfig,
): CircaValue {
  const initial = createInitialValue(config);
  const isControlled = getAttr("value") !== null;

  if (isControlled) {
    return {
      ...initial,
      value: parseNumberAttr(getAttr("value")),
      marginLow: parseNumberAttr(getAttr("margin-low")),
      marginHigh: parseNumberAttr(getAttr("margin-high")),
    };
  }

  return {
    ...initial,
    value: parseNumberAttr(getAttr("default-value")),
    marginLow: parseNumberAttr(getAttr("default-margin-low")),
    marginHigh: parseNumberAttr(getAttr("default-margin-high")),
  };
}
