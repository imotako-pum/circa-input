import type { CircaValue } from "@circa-input/core";

/**
 * CircaValueをJSON風にフォーマットして表示用の文字列にする
 */
export function formatCircaValue(v: CircaValue): string {
  return JSON.stringify(v, null, 2);
}

/**
 * 数値を時刻文字列に変換（例: 14.5 → "14:30"）
 */
function toTimeString(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/**
 * 数値を時間幅文字列に変換（例: 1.5 → "1時間30分"）
 */
function toTimeDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
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
 * 配達時間ユースケース用フォーマッター
 */
export function formatTime(v: CircaValue): string {
  if (v.value === null) return "未設定";
  const center = toTimeString(v.value);
  if (v.marginLow === null || v.marginLow === 0) return center;
  if (v.marginLow === v.marginHigh) {
    return `${center} \u00B1 ${toTimeDuration(v.marginLow)}`;
  }
  const low = toTimeString(v.value - (v.marginLow ?? 0));
  const high = toTimeString(v.value + (v.marginHigh ?? 0));
  return `${low} 〜 ${high}`;
}

/**
 * 予算ユースケース用フォーマッター
 */
export function formatBudget(v: CircaValue): string {
  if (v.value === null) return "未設定";
  const center = formatYen(v.value);
  if (v.marginLow === null || v.marginLow === 0) return center;
  if (v.marginLow === v.marginHigh) {
    return `${center} \u00B1 ${formatYen(v.marginLow)}`;
  }
  const low = formatYen(v.value - (v.marginLow ?? 0));
  const high = formatYen(v.value + (v.marginHigh ?? 0));
  return `${low} 〜 ${high}`;
}

/**
 * 気温ユースケース用フォーマッター
 */
export function formatTemp(v: CircaValue): string {
  if (v.value === null) return "未設定";
  const center = `${v.value}\u00B0C`;
  if (v.marginLow === null || v.marginLow === 0) return center;
  if (v.marginLow === v.marginHigh) {
    return `${center} \u00B1 ${v.marginLow}\u00B0C`;
  }
  const low = v.value - (v.marginLow ?? 0);
  const high = v.value + (v.marginHigh ?? 0);
  return `${low}\u00B0C 〜 ${high}\u00B0C`;
}
