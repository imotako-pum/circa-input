import type { CircaValue } from "./types.js";

/**
 * Clamp a value within the [min, max] range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Helper to extract only the value from a CircaValue.
 * Used when the backend does not support circa-input.
 */
export function toPlainValue(circaValue: CircaValue): number | null {
  return circaValue.value;
}

/**
 * Convert a value to a percentage position (0-100).
 * Used to calculate indicator position on the track.
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
 * Convert a percentage position (0-100) to a value.
 * Used to calculate a value from a click position.
 */
export function percentToValue(
  percent: number,
  min: number,
  max: number,
): number {
  return (percent / 100) * (max - min) + min;
}

/**
 * Generate an array of tick positions.
 * Generates ticks at tickInterval increments starting from min, always including max.
 *
 * @param min - Minimum value of the range
 * @param max - Maximum value of the range
 * @param tickInterval - Interval between ticks
 * @returns Array of tick positions (ascending order)
 */
export function generateTicks(
  min: number,
  max: number,
  tickInterval: number,
): number[] {
  // Return empty array for invalid intervals
  if (tickInterval <= 0 || !Number.isFinite(tickInterval)) return [];
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min >= max) return [];

  // Performance guard: return empty array if tick count exceeds 50
  const count = Math.floor((max - min) / tickInterval) + 1;
  if (count > 50) return [];

  // Determine decimal places of tickInterval (used for floating-point precision rounding)
  const intervalStr = String(tickInterval);
  const decimalIndex = intervalStr.indexOf(".");
  const decimals =
    decimalIndex === -1 ? 0 : intervalStr.length - decimalIndex - 1;
  const factor = 10 ** decimals;

  const ticks: number[] = [];
  for (let v = min; v <= max; v += tickInterval) {
    // Round to mitigate floating-point errors
    ticks.push(Math.round(v * factor) / factor);
  }

  // Always include max (if the last tick is not max)
  const last = ticks[ticks.length - 1];
  if (last !== undefined && Math.abs(last - max) > 1e-9) {
    ticks.push(max);
  }

  return ticks;
}
