import type { CircaValue } from "@circa-input/core";
import { formatCircaValue } from "../utils/format";

/**
 * Section 2: 非対称モードの初期化
 */
export function initAsymmetricSection(): void {
  const input = document.getElementById("asymmetric-input") as HTMLElement;
  const outputEl = document.querySelector(
    "#asymmetric-output .output-value",
  ) as HTMLElement;

  const handleEvent = (e: Event) => {
    const detail = (e as CustomEvent<CircaValue>).detail;
    outputEl.textContent = formatCircaValue(detail);
  };

  input.addEventListener("input", handleEvent);
  input.addEventListener("change", handleEvent);
}
