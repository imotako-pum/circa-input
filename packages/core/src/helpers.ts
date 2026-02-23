import type { CircaValue } from "./types.js";

/**
 * CircaValueからvalueのみを取り出すヘルパー。
 * バックエンドがcirca-inputに未対応の場合に使用。
 */
export function toPlainValue(circaValue: CircaValue): number | null {
  return circaValue.value;
}
