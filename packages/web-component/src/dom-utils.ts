/**
 * Coordinate conversion utilities (pure functions)
 *
 * Converts between pixel coordinates and values within the Web Component.
 * Implemented as pure functions independent of DOM elements to ensure testability.
 *
 * valueToPercent / percentToValue are defined in @circa-input/core
 * and re-exported from here.
 */

import { clamp } from "@circa-input/core";

export { clamp, percentToValue, valueToPercent } from "@circa-input/core";

/**
 * Convert a client X coordinate to a percent position on the track.
 * Track left edge = 0%, right edge = 100%. Out-of-range values are clamped to 0-100.
 */
export function clientXToPercent(
  clientX: number,
  trackLeft: number,
  trackWidth: number,
): number {
  if (trackWidth <= 0) return 0;
  const raw = ((clientX - trackLeft) / trackWidth) * 100;
  return clamp(raw, 0, 100);
}
