export { CircaInputElement } from "./circa-input.js";
export type { CircaValue, CircaInputConfig, Distribution } from "@circa-input/core";

// カスタム要素の登録
import { CircaInputElement } from "./circa-input.js";

if (!customElements.get("circa-input")) {
  customElements.define("circa-input", CircaInputElement);
}
