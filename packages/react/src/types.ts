import type { CircaValue, Distribution } from "@circa-input/core";
import type { CSSProperties, ReactNode } from "react";

/**
 * Props definition for the <CircaInput> component.
 *
 * Accepts props in camelCase (React convention) and
 * internally converts them to kebab-case HTML attributes to sync with <circa-input>.
 */
export interface CircaInputProps {
  /** Minimum selectable value (default: 0) */
  min?: number;
  /** Maximum selectable value (default: 100) */
  max?: number;

  // --- Controlled ---
  /** Center value (Controlled). When present, enables controlled mode */
  value?: number | null;
  /** Lower margin (Controlled) */
  marginLow?: number | null;
  /** Upper margin (Controlled) */
  marginHigh?: number | null;

  // --- Uncontrolled ---
  /** Initial center value (Uncontrolled) */
  defaultValue?: number | null;
  /** Initial lower margin (Uncontrolled) */
  defaultMarginLow?: number | null;
  /** Initial upper margin (Uncontrolled) */
  defaultMarginHigh?: number | null;

  // --- Options ---
  /** Maximum margin value */
  marginMax?: number;
  /** Distribution shape */
  distribution?: Distribution;
  /** Asymmetric mode */
  asymmetric?: boolean;
  /** Step increment for values */
  step?: number | "any";
  /** Name for form integration */
  name?: string;
  /** Required validation */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Hide the clear button */
  noClear?: boolean;
  /** Tick mark interval (ticks are displayed only when set) */
  tickInterval?: number;
  /** Default margin width applied when value is first set (null → value) */
  initialMargin?: number | null;

  // --- Events ---
  /** Fires on interaction complete (receives CircaValue directly) */
  onChange?: (value: CircaValue) => void;
  /** Fires in real-time during interaction (receives CircaValue directly) */
  onInput?: (value: CircaValue) => void;

  // --- Slots / HTML ---
  /** Children (e.g., custom clear button with slot="clear") */
  children?: ReactNode;
  /** Class for the host element */
  className?: string;
  /** Style for the host element */
  style?: CSSProperties;
  /** ID for the host element */
  id?: string;
}

/**
 * Ref handle for <CircaInput>.
 *
 * Imperative API exposed via useImperativeHandle.
 */
export interface CircaInputHandle {
  /** Current CircaValue */
  readonly circaValue: CircaValue;
  /** JSON string for form submission (null when no value is set) */
  readonly formValue: string | null;
  /** Clear the value and reset to empty state */
  clear(): void;
  /** Reference to the internal <circa-input> custom element */
  readonly nativeElement: HTMLElement | null;
}
