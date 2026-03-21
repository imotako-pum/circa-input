import type { GradientMode, GradientStop } from "./types.js";

/**
 * Default number of evenly-spaced stops generated per side of the margin band.
 * 10 stops per side (20 total) gives a smooth visual approximation of the power curve.
 */
const DEFAULT_STOPS_PER_SIDE = 10;

/**
 * Generate an array of {@link GradientStop} entries that describe how opacity
 * should vary across the margin band from left edge to right edge.
 *
 * The margin band spans from `value - marginLow` to `value + marginHigh`.
 * The center of the band (where the value sits) always has `opacity = 1`.
 * Opacity falls off toward each edge following a power curve controlled by `intensity`.
 *
 * @param mode       - `"relative"` normalizes each side independently (edges always reach 0).
 *                     `"absolute"` uses a shared scale (shorter side may retain some opacity at edge).
 * @param intensity  - Exponent for the falloff curve. 1 = linear, >1 = steeper drop, <1 = gentler.
 * @param marginLow  - Width of the left side of the margin band (in value-space units).
 * @param marginHigh - Width of the right side of the margin band (in value-space units).
 * @param stopsPerSide - Number of evenly-spaced stops to generate on each side (default 10).
 * @returns Sorted array of GradientStop (position ascending, 0→1).
 */
export function generateGradientStops(
  mode: GradientMode,
  intensity: number,
  marginLow: number,
  marginHigh: number,
  stopsPerSide: number = DEFAULT_STOPS_PER_SIDE,
): GradientStop[] {
  const totalWidth = marginLow + marginHigh;

  // Both margins zero → no band to render
  if (totalWidth <= 0) return [];

  // Position of the center value within the 0–1 coordinate system of the margin band
  const center = marginLow / totalWidth;

  const stops: GradientStop[] = [];

  // --- Left side (from left edge toward center) ---
  if (marginLow > 0) {
    for (let i = 0; i <= stopsPerSide; i++) {
      // t goes from 0 (left edge) to 1 (center)
      const t = i / stopsPerSide;
      const position = t * center; // map to 0–center range

      // Distance from center, normalized by the relevant margin width
      const distance = (1 - t) * marginLow;
      const scale =
        mode === "relative" ? marginLow : Math.max(marginLow, marginHigh);
      const d = distance / scale;

      const opacity = Math.max(1 - d, 0) ** intensity;
      stops.push({ position, opacity });
    }
  } else {
    // marginLow = 0 → center is at position 0 (left edge)
    stops.push({ position: 0, opacity: 1 });
  }

  // --- Right side (from center toward right edge) ---
  if (marginHigh > 0) {
    // Start from 1 (skip 0 since center was already added by the left side)
    for (let i = 1; i <= stopsPerSide; i++) {
      // t goes from 0 (center) to 1 (right edge)
      const t = i / stopsPerSide;
      const position = center + t * (1 - center); // map to center–1 range

      const distance = t * marginHigh;
      const scale =
        mode === "relative" ? marginHigh : Math.max(marginLow, marginHigh);
      const d = distance / scale;

      const opacity = Math.max(1 - d, 0) ** intensity;
      stops.push({ position, opacity });
    }
  } else {
    // marginHigh = 0 → center is at position 1 (right edge)
    // Center stop already added by left side (at position = center = 1)
  }

  return stops;
}
