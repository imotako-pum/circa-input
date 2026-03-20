import { bindCircaOutput } from "../utils/dom";

/**
 * Section 4: Range Only comparison (normal vs range-only mode).
 */
export function initRangeOnlySection(): void {
  bindCircaOutput("ro-normal", "#ro-normal-output");
  bindCircaOutput("ro-range-only", "#ro-range-only-output");
}
