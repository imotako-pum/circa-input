import type { CircaValue } from "@circa-input/core";
import type { CircaInputElement } from "@circa-input/web-component";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import type { CircaInputHandle, CircaInputProps } from "./types";

// Type declaration to enable <circa-input> in JSX (module augmentation)
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "circa-input": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { class?: string };
    }
  }
}

/**
 * Mapping from camelCase props to kebab-case HTML attribute names.
 * Boolean attributes (controlled by presence/absence) are handled separately.
 */
const PROP_TO_ATTR: Record<string, string> = {
  min: "min",
  max: "max",
  value: "value",
  marginLow: "margin-low",
  marginHigh: "margin-high",
  defaultValue: "default-value",
  defaultMarginLow: "default-margin-low",
  defaultMarginHigh: "default-margin-high",
  marginMax: "margin-max",
  distribution: "distribution",
  step: "step",
  name: "name",
  tickInterval: "tick-interval",
  initialMargin: "initial-margin",
};

/** Boolean attribute mapping (true -> attribute present, false/undefined -> attribute absent) */
const BOOLEAN_ATTRS: Record<string, string> = {
  asymmetric: "asymmetric",
  required: "required",
  disabled: "disabled",
  noClear: "no-clear",
};

/**
 * Sync props to DOM attributes (only updates changed attributes).
 * - Value attributes: removeAttribute if null/undefined, otherwise setAttribute
 * - Boolean attributes: setAttribute("") if true, removeAttribute if false
 * - Skips if current DOM attribute matches, preventing unnecessary attributeChangedCallback
 */
function syncAttributes(el: HTMLElement, props: CircaInputProps): void {
  for (const [prop, attr] of Object.entries(PROP_TO_ATTR)) {
    const val = props[prop as keyof CircaInputProps];
    const strVal = val === undefined || val === null ? null : String(val);
    const current = el.getAttribute(attr);
    if (strVal === current) continue;
    if (strVal === null) {
      el.removeAttribute(attr);
    } else {
      el.setAttribute(attr, strVal);
    }
  }

  for (const [prop, attr] of Object.entries(BOOLEAN_ATTRS)) {
    const val = props[prop as keyof CircaInputProps];
    const shouldExist = !!val;
    const exists = el.hasAttribute(attr);
    if (shouldExist === exists) continue;
    if (shouldExist) {
      el.setAttribute(attr, "");
    } else {
      el.removeAttribute(attr);
    }
  }
}

/** Create a handler that extracts CircaValue from a CustomEvent and passes it to the callback */
function makeEventHandler(
  cb: ((v: CircaValue) => void) | undefined,
): (e: Event) => void {
  return (e: Event) => cb?.((e as CustomEvent<CircaValue>).detail);
}

/**
 * React wrapper for the circa-input Web Component.
 *
 * Uses the `<circa-input>` Web Component directly without reimplementing rendering logic.
 * Bridges props to HTML attributes and CustomEvents to React callbacks.
 *
 * @example
 * ```tsx
 * <CircaInput
 *   min={0}
 *   max={100}
 *   defaultValue={50}
 *   onChange={(v) => console.log(v)}
 * />
 * ```
 */
export const CircaInput = forwardRef<CircaInputHandle, CircaInputProps>(
  function CircaInput(props, ref) {
    const { children, className, style, id } = props;

    const elRef = useRef<CircaInputElement | null>(null);

    // Store callbacks in refs to avoid re-registering event listeners.
    // Even if the parent passes inline arrow functions (new references each render),
    // the listeners are only registered once on initial mount.
    const onChangeRef = useRef(props.onChange);
    const onInputRef = useRef(props.onInput);
    useLayoutEffect(() => {
      onChangeRef.current = props.onChange;
    });
    useLayoutEffect(() => {
      onInputRef.current = props.onInput;
    });

    // Sync props to HTML attributes (only updates changed attributes)
    useLayoutEffect(() => {
      const el = elRef.current;
      if (!el) return;
      syncAttributes(el, props);
    });

    // On initial mount: re-trigger connectedCallback so it picks up React-set attributes.
    // React sets attributes asynchronously after DOM insertion, so the first connectedCallback
    // fires before attributes exist. This remove/re-insert forces a second connectedCallback
    // with all attributes present. Cannot be removed until the web component is refactored
    // to defer initialization (see issue #6).
    useLayoutEffect(() => {
      const el = elRef.current;
      if (!el) return;
      const parent = el.parentNode;
      if (!parent) return;
      const next = el.nextSibling;
      parent.removeChild(el);
      next ? parent.insertBefore(el, next) : parent.appendChild(el);
    }, []);

    // Register event listeners (once only; callbacks reference latest via refs)
    useEffect(() => {
      const el = elRef.current;
      if (!el) return;

      const handleChange = makeEventHandler((v: CircaValue) =>
        onChangeRef.current?.(v),
      );
      const handleInput = makeEventHandler((v: CircaValue) =>
        onInputRef.current?.(v),
      );

      el.addEventListener("change", handleChange);
      el.addEventListener("input", handleInput);

      return () => {
        el.removeEventListener("change", handleChange);
        el.removeEventListener("input", handleInput);
      };
    }, []);

    // Expose ref handle
    useImperativeHandle(
      ref,
      () => ({
        get circaValue() {
          return (
            elRef.current?.circaValue ?? {
              value: null,
              marginLow: null,
              marginHigh: null,
              distribution: "normal" as const,
              distributionParams: {},
            }
          );
        },
        get formValue() {
          return elRef.current?.formValue ?? null;
        },
        clear() {
          elRef.current?.clear();
        },
        get nativeElement() {
          return elRef.current;
        },
      }),
      [],
    );

    return (
      <circa-input
        ref={elRef as React.RefObject<HTMLElement>}
        class={className}
        style={style as React.CSSProperties}
        id={id}
      >
        {children}
      </circa-input>
    );
  },
);
