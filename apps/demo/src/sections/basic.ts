import type { CircaValue } from "@circa-input/core";
import { formatCircaValue } from "../utils/format";

/**
 * Section 1: 基本操作（対称モード）の初期化
 */
export function initBasicSection(): void {
  const input = document.getElementById("basic-input") as HTMLElement;
  const outputEl = document.querySelector(
    "#basic-output .output-value",
  ) as HTMLElement;

  const handleEvent = (e: Event) => {
    const detail = (e as CustomEvent<CircaValue>).detail;
    outputEl.textContent = formatCircaValue(detail);
  };

  input.addEventListener("input", handleEvent);
  input.addEventListener("change", handleEvent);
}
