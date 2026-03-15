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
