import type { CircaInputConfig, CircaValue } from "./types.js";

/**
 * 値をstep刻みにスナップ（丸め）する。
 *
 * stepが"any"の場合はスナップしない。
 * 計算式: Math.round((value - min) / step) * step + min
 * → minを基準に、最も近いstepの倍数に丸める。
 * 結果は[min, max]の範囲にクランプされる。
 */
export function snapToStep(
  value: number,
  config: Pick<CircaInputConfig, "min" | "max" | "step">,
): number {
  if (config.step === "any") {
    return value;
  }

  const snapped =
    Math.round((value - config.min) / config.step) * config.step + config.min;

  // 浮動小数点誤差を抑えるため、stepの小数桁数で丸める
  const decimals = countDecimals(config.step);
  const rounded = parseFloat(snapped.toFixed(decimals));

  // [min, max]にクランプ
  return Math.min(Math.max(rounded, config.min), config.max);
}

/**
 * 数値の小数桁数を返す（浮動小数点誤差対策用）。
 * 例: 0.5 → 1, 0.25 → 2, 5 → 0
 */
function countDecimals(num: number): number {
  const str = num.toString();
  const dotIndex = str.indexOf(".");
  return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
}

/**
 * 初期状態（未入力）のCircaValueを生成する
 */
export function createInitialValue(
  config: Pick<CircaInputConfig, "distribution">,
): CircaValue {
  return {
    value: null,
    marginLow: null,
    marginHigh: null,
    distribution: config.distribution,
    distributionParams: {},
  };
}

/**
 * デフォルトのCircaInputConfigを生成する
 */
export function createDefaultConfig(
  overrides: Pick<CircaInputConfig, "min" | "max"> &
    Partial<Omit<CircaInputConfig, "min" | "max">>,
): CircaInputConfig {
  return {
    marginMax: null,
    distribution: "normal",
    asymmetric: false,
    step: "any",
    name: null,
    required: false,
    ...overrides,
  };
}

/**
 * marginをmin/max/marginMaxの範囲内にクランプする
 */
export function clampMargins(
  circaValue: CircaValue,
  config: CircaInputConfig,
): CircaValue {
  if (circaValue.value === null) {
    return circaValue;
  }

  let marginLow = circaValue.marginLow;
  let marginHigh = circaValue.marginHigh;

  if (marginLow !== null) {
    // margin適用後がminを下回らないようにクランプ
    const maxLow = circaValue.value - config.min;
    marginLow = Math.min(marginLow, maxLow);

    // marginMaxによるクランプ
    if (config.marginMax !== null) {
      marginLow = Math.min(marginLow, config.marginMax);
    }

    marginLow = Math.max(marginLow, 0);
  }

  if (marginHigh !== null && marginHigh !== Infinity) {
    // margin適用後がmaxを超えないようにクランプ
    const maxHigh = config.max - circaValue.value;
    marginHigh = Math.min(marginHigh, maxHigh);

    // marginMaxによるクランプ
    if (config.marginMax !== null) {
      marginHigh = Math.min(marginHigh, config.marginMax);
    }

    marginHigh = Math.max(marginHigh, 0);
  }

  return {
    ...circaValue,
    marginLow,
    marginHigh,
  };
}

/**
 * 値を更新し、必要に応じてスナップ・対称連動・クランプを適用する。
 *
 * 処理の順序:
 * 1. updatesをマージ
 * 2. valueが更新された場合、stepスナップを適用
 * 3. asymmetric=falseの場合、marginLow/marginHighを同期
 * 4. clampMarginsで範囲内にクランプ
 */
export function updateValue(
  current: CircaValue,
  updates: Partial<Pick<CircaValue, "value" | "marginLow" | "marginHigh">>,
  config: CircaInputConfig,
): CircaValue {
  const next: CircaValue = {
    ...current,
    ...updates,
  };

  // Step 1: valueのスナップ処理
  if (next.value !== null && "value" in updates) {
    next.value = snapToStep(next.value, config);
  }

  // Step 2: 対称モード連動
  // asymmetric=false のとき、marginLowとmarginHighは常に同じ値になる。
  // updatesで明示的に指定された方をもう片方にコピーする。
  if (!config.asymmetric) {
    const hasLow = "marginLow" in updates;
    const hasHigh = "marginHigh" in updates;

    if (hasLow && !hasHigh && next.marginLow !== null) {
      // marginLowだけが指定された → marginHighに同期
      next.marginHigh = next.marginLow;
    } else if (hasHigh && !hasLow && next.marginHigh !== null) {
      // marginHighだけが指定された → marginLowに同期
      next.marginLow = next.marginHigh;
    } else if (hasLow && hasHigh) {
      // 両方指定された場合、marginLowを優先（対称なので片方でいい）
      if (next.marginLow !== null) {
        next.marginHigh = next.marginLow;
      }
    }
  }

  return clampMargins(next, config);
}
