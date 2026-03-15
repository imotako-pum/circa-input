import type { CircaValue } from "./types.js";

/**
 * 値を[min, max]の範囲内にクランプする。
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * CircaValueからvalueのみを取り出すヘルパー。
 * バックエンドがcirca-inputに未対応の場合に使用。
 */
export function toPlainValue(circaValue: CircaValue): number | null {
  return circaValue.value;
}

/**
 * 値をパーセント位置（0〜100）に変換する。
 * トラック上のインジケータ位置の計算に使う。
 */
export function valueToPercent(
  value: number,
  min: number,
  max: number,
): number {
  if (max === min) return 0;
  const raw = ((value - min) / (max - min)) * 100;
  return clamp(raw, 0, 100);
}

/**
 * パーセント位置（0〜100）を値に変換する。
 * クリック位置から値を算出するのに使う。
 */
export function percentToValue(
  percent: number,
  min: number,
  max: number,
): number {
  return (percent / 100) * (max - min) + min;
}

/**
 * 目盛り位置の配列を生成する。
 * minからtickInterval刻みで目盛りを生成し、maxは常に含める。
 *
 * @param min - 範囲の最小値
 * @param max - 範囲の最大値
 * @param tickInterval - 目盛りの間隔
 * @returns 目盛り位置の配列（昇順）
 */
export function generateTicks(
  min: number,
  max: number,
  tickInterval: number,
): number[] {
  // 無効な間隔の場合は空配列
  if (tickInterval <= 0 || !Number.isFinite(tickInterval)) return [];
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min >= max) return [];

  // 目盛り数が50を超える場合はパフォーマンス保護で空配列
  const count = Math.floor((max - min) / tickInterval) + 1;
  if (count > 50) return [];

  // tickIntervalの小数桁数を求める（浮動小数点精度の丸めに使用）
  const intervalStr = String(tickInterval);
  const decimalIndex = intervalStr.indexOf(".");
  const decimals =
    decimalIndex === -1 ? 0 : intervalStr.length - decimalIndex - 1;
  const factor = 10 ** decimals;

  const ticks: number[] = [];
  for (let v = min; v <= max; v += tickInterval) {
    // 浮動小数点誤差を丸める
    ticks.push(Math.round(v * factor) / factor);
  }

  // maxを常に含める（最後の目盛りがmaxでない場合）
  const last = ticks[ticks.length - 1];
  if (last !== undefined && Math.abs(last - max) > 1e-9) {
    ticks.push(max);
  }

  return ticks;
}
