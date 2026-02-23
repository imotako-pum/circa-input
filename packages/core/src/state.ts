import type { CircaInputConfig, CircaValue } from "./types.js";

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
 * 値を更新し、必要に応じてクランプする
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

  return clampMargins(next, config);
}
