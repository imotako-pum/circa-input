import type { CircaValue } from "@circa-input/core";
import { formatCircaValue } from "./format";

/**
 * DOM要素を取得し、見つからない場合はエラーをthrowする
 */
export function requireElement<T extends Element>(
  selector: string,
  context: string,
): T {
  const el = document.querySelector(selector);
  if (!el) {
    throw new Error(`[demo] Element not found: "${selector}" (${context})`);
  }
  return el as T;
}

/**
 * IDで要素を取得し、見つからない場合はエラーをthrowする
 */
export function requireById<T extends HTMLElement>(
  id: string,
  context: string,
): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`[demo] Element not found: "#${id}" (${context})`);
  }
  return el as T;
}

/**
 * circa-inputのinput/changeイベントでCircaValue JSONを表示する共通処理
 */
export function bindCircaOutput(inputId: string, outputSelector: string): void {
  const input = requireById(inputId, "bindCircaOutput");
  const outputEl = requireElement<HTMLElement>(
    `${outputSelector} .output-value`,
    "bindCircaOutput",
  );

  const handleEvent = (e: Event) => {
    const detail = (e as CustomEvent<CircaValue>).detail;
    outputEl.textContent = formatCircaValue(detail);
  };

  input.addEventListener("input", handleEvent);
  input.addEventListener("change", handleEvent);
}
