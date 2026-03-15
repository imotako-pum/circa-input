import type { CircaValue, Distribution } from "@circa-input/core";
import type { CSSProperties, ReactNode } from "react";

/**
 * <CircaInput> コンポーネントのProps定義。
 *
 * camelCase（React慣例）でpropsを受け取り、
 * 内部でkebab-case HTML属性に変換して <circa-input> に同期する。
 */
export interface CircaInputProps {
  // --- 必須 ---
  /** 選択可能な最小値 */
  min: number;
  /** 選択可能な最大値 */
  max: number;

  // --- Controlled ---
  /** 中心値（Controlled）。存在するとControlledモードになる */
  value?: number | null;
  /** 下側の許容幅（Controlled） */
  marginLow?: number | null;
  /** 上側の許容幅（Controlled） */
  marginHigh?: number | null;

  // --- Uncontrolled ---
  /** 中心値の初期値（Uncontrolled） */
  defaultValue?: number | null;
  /** 下側の許容幅の初期値（Uncontrolled） */
  defaultMarginLow?: number | null;
  /** 上側の許容幅の初期値（Uncontrolled） */
  defaultMarginHigh?: number | null;

  // --- オプション ---
  /** 許容幅の最大値 */
  marginMax?: number;
  /** 分布の形状 */
  distribution?: Distribution;
  /** 非対称モード */
  asymmetric?: boolean;
  /** 値の刻み幅 */
  step?: number | "any";
  /** フォーム統合用の名前 */
  name?: string;
  /** 必須バリデーション */
  required?: boolean;
  /** 無効化 */
  disabled?: boolean;
  /** クリアボタンを非表示にする */
  noClear?: boolean;

  // --- イベント ---
  /** 操作完了時に発火（CircaValueを直接受け取る） */
  onChange?: (value: CircaValue) => void;
  /** 操作中リアルタイムに発火（CircaValueを直接受け取る） */
  onInput?: (value: CircaValue) => void;

  // --- スロット・HTML ---
  /** 子要素（slot="clear" のカスタムクリアボタン等） */
  children?: ReactNode;
  /** ホスト要素のclass */
  className?: string;
  /** ホスト要素のstyle */
  style?: CSSProperties;
  /** ホスト要素のid */
  id?: string;
}

/**
 * <CircaInput> の ref ハンドル。
 *
 * useImperativeHandle で公開される命令型API。
 */
export interface CircaInputHandle {
  /** 現在のCircaValue */
  readonly circaValue: CircaValue;
  /** フォーム送信用のJSON文字列（未入力時はnull） */
  readonly formValue: string | null;
  /** 値をクリアして未入力状態に戻す */
  clear(): void;
  /** 内部の <circa-input> カスタム要素への参照 */
  readonly nativeElement: HTMLElement | null;
}
