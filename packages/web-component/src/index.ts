export type {
  CircaInputConfig,
  CircaValue,
  Distribution,
} from "@circa-input/core";
export { CircaInputElement } from "./circa-input.js";

// Register custom element
import { CircaInputElement } from "./circa-input.js";

if (!customElements.get("circa-input")) {
  customElements.define("circa-input", CircaInputElement);
}
