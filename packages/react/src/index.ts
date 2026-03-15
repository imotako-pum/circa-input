// カスタム要素 <circa-input> の登録（副作用インポート）
import "@circa-input/web-component";

export type {
  CircaInputConfig,
  CircaValue,
  Distribution,
} from "@circa-input/core";
export { CircaInput } from "./CircaInput";
export type { CircaInputHandle, CircaInputProps } from "./types";
