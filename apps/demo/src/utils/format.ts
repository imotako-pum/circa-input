import type { CircaValue } from "@circa-input/core";

/**
 * CircaValueをJSON風にフォーマットして表示用の文字列にする
 */
export function formatCircaValue(v: CircaValue): string {
  return JSON.stringify(v, null, 2);
}

/**
 * 数値を時刻文字列に変換（例: 14.5 → "14:30"）
 * 浮動小数点誤差対策のため、先に総分数に変換してから時・分を求める
 */
function toTimeString(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/**
 * 数値を時間幅文字列に変換（例: 1.5 → "1時間30分"）
 */
function toTimeDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

/**
 * 金額をフォーマット（例: 50000 → "¥50,000"）
 */
function formatYen(amount: number): string {
  return `\u00A5${amount.toLocaleString("ja-JP")}`;
}

/**
 * CircaValueのマージン表示を共通化するヘルパー。
 * centerFn: 中心値を文字列に変換する関数
 * marginFn: マージン値を文字列に変換する関数（±表示用）
 * rangeFn: 範囲端の値を文字列に変換する関数（〜表示用）
 */
function formatWithMargin(
  v: CircaValue,
  centerFn: (val: number) => string,
  marginFn: (margin: number) => string,
  rangeFn: (val: number) => string,
): string {
  if (v.value === null) return "未設定";
  const center = centerFn(v.value);
  if (v.marginLow === null || v.marginLow === 0) return center;
  if (v.marginLow === v.marginHigh) {
    return `${center} \u00B1 ${marginFn(v.marginLow)}`;
  }
  // 非対称マージン: marginHighがnullの場合は非対称表示しない
  if (v.marginHigh === null) return center;
  const low = rangeFn(v.value - v.marginLow);
  const high = rangeFn(v.value + v.marginHigh);
  return `${low} 〜 ${high}`;
}

/**
 * 配達時間ユースケース用フォーマッター
 */
export function formatTime(v: CircaValue): string {
  return formatWithMargin(v, toTimeString, toTimeDuration, toTimeString);
}

/**
 * 予算ユースケース用フォーマッター
 */
export function formatBudget(v: CircaValue): string {
  return formatWithMargin(v, formatYen, formatYen, formatYen);
}

/**
 * 数値を摂氏表記に変換（例: 25 → "25°C"）
 */
function degC(val: number): string {
  return `${val}\u00B0C`;
}

/**
 * 気温ユースケース用フォーマッター
 */
export function formatTemp(v: CircaValue): string {
  return formatWithMargin(v, degC, degC, degC);
}
