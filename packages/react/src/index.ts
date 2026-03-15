// Register the <circa-input> custom element (side-effect import)
import "@circa-input/web-component";

export type {
  CircaInputConfig,
  CircaValue,
  Distribution,
} from "@circa-input/core";
export { CircaInput } from "./CircaInput";
export type { CircaInputHandle, CircaInputProps } from "./types";
