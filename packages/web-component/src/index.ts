export type {
  CircaInputConfig,
  CircaValue,
  Distribution,
} from "@circa-input/core";
export { CircaInputElement } from "./circa-input.js";

// カスタム要素の登録
import { CircaInputElement } from "./circa-input.js";

if (!customElements.get("circa-input")) {
  customElements.define("circa-input", CircaInputElement);
}
