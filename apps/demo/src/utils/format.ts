import type { CircaValue } from "@circa-input/core";
import { t } from "../i18n";

/**
 * Format CircaValue as a JSON string for display.
 */
export function formatCircaValue(v: CircaValue): string {
  return JSON.stringify(v, null, 2);
}

/**
 * Convert a number to a time string (e.g., 14.5 -> "14:30").
 * Converts to total minutes first to avoid floating-point errors.
 */
function toTimeString(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/**
 * Convert a number to a duration string (e.g., 1.5 -> "1h 30min" or "1時間30分").
 */
function toTimeDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return t("format.minuteUnit").replace("{m}", String(m));
  if (m === 0) return t("format.hourUnit").replace("{h}", String(h));
  return t("format.hourMinute")
    .replace("{h}", String(h))
    .replace("{m}", String(m));
}

/**
 * Format an amount as yen (e.g., 50000 -> "¥50,000").
 */
function formatYen(amount: number): string {
  return `\u00A5${amount.toLocaleString("en-US")}`;
}

/**
 * Helper to format CircaValue with margins.
 * centerFn: convert center value to string
 * marginFn: convert margin value to string (for ± display)
 * rangeFn: convert range endpoint to string (for range display)
 */
function formatWithMargin(
  v: CircaValue,
  centerFn: (val: number) => string,
  marginFn: (margin: number) => string,
  rangeFn: (val: number) => string,
): string {
  if (v.value === null) return t("format.unset");
  const center = centerFn(v.value);
  if (v.marginLow === null || v.marginLow === 0) return center;
  if (v.marginLow === v.marginHigh) {
    return `${center} \u00B1 ${marginFn(v.marginLow)}`;
  }
  if (v.marginHigh === null) return center;
  const low = rangeFn(v.value - v.marginLow);
  const high = rangeFn(v.value + v.marginHigh);
  return t("format.range").replace("{low}", low).replace("{high}", high);
}

/**
 * Formatter for the delivery time use case.
 */
export function formatTime(v: CircaValue): string {
  return formatWithMargin(v, toTimeString, toTimeDuration, toTimeString);
}

/**
 * Formatter for the budget use case.
 */
export function formatBudget(v: CircaValue): string {
  return formatWithMargin(v, formatYen, formatYen, formatYen);
}

/**
 * Convert a number to Celsius notation (e.g., 25 -> "25°C").
 */
function degC(val: number): string {
  return `${val}\u00B0C`;
}

/**
 * Formatter for the temperature use case.
 */
export function formatTemp(v: CircaValue): string {
  return formatWithMargin(v, degC, degC, degC);
}

/**
 * Format a number with the "years" unit (e.g., "30 years" or "30歳").
 */
function withYears(val: number): string {
  return `${val}${t("format.yearsUnit")}`;
}

/**
 * Formatter for the age range use case.
 * Range-only mode: shows "25 - 40 years" / "25歳 - 40歳"
 */
export function formatAge(v: CircaValue): string {
  return formatWithMargin(v, withYears, withYears, withYears);
}

/**
 * Format minutes as a duration string (e.g., 90 -> "1h 30min" or "1時間30分").
 * Unlike toTimeDuration which takes hours, this takes minutes directly.
 */
function minutesToDuration(minutes: number): string {
  return toTimeDuration(minutes / 60);
}

/**
 * Formatter for the meeting duration use case.
 */
export function formatDuration(v: CircaValue): string {
  return formatWithMargin(
    v,
    minutesToDuration,
    minutesToDuration,
    minutesToDuration,
  );
}

/**
 * Format a number with "km" unit.
 */
function withKm(val: number): string {
  return `${val}${t("format.kmUnit")}`;
}

/**
 * Formatter for the commute distance use case.
 */
export function formatDistance(v: CircaValue): string {
  return formatWithMargin(v, withKm, withKm, withKm);
}
