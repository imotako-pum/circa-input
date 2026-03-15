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

// JSX で <circa-input> を使えるようにする型宣言（module augmentation）
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
 * camelCase props → kebab-case HTML属性名のマッピング。
 * boolean属性（存在/非存在で制御するもの）は別途扱う。
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
};

/** boolean属性のマッピング（true→属性あり、false/undefined→属性なし） */
const BOOLEAN_ATTRS: Record<string, string> = {
  asymmetric: "asymmetric",
  required: "required",
  disabled: "disabled",
  noClear: "no-clear",
};

/**
 * propsをDOM属性に同期する（変更があった属性のみ更新）。
 * - 値属性: null/undefinedなら removeAttribute、それ以外は setAttribute
 * - boolean属性: trueなら setAttribute("")、falseなら removeAttribute
 * - 現在のDOM属性と同じ値の場合はスキップし、不要な attributeChangedCallback を防ぐ
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

/** CustomEvent から CircaValue を取り出してコールバックに渡すハンドラを生成 */
function makeEventHandler(
  cb: ((v: CircaValue) => void) | undefined,
): (e: Event) => void {
  return (e: Event) => cb?.((e as CustomEvent<CircaValue>).detail);
}

/**
 * circa-input Web Component の React ラッパー。
 *
 * Web Component の `<circa-input>` をそのまま使い、描画ロジックを再実装しない。
 * props → HTML属性の変換と、CustomEvent → React コールバックの橋渡しを行う。
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

    // コールバックを ref で保持し、イベントリスナーの再登録を防ぐ。
    // 親が inline arrow function を渡しても（毎レンダーで新しい参照が来ても）、
    // リスナー自体は初回マウント時に一度だけ登録される。
    const onChangeRef = useRef(props.onChange);
    const onInputRef = useRef(props.onInput);
    useLayoutEffect(() => {
      onChangeRef.current = props.onChange;
    });
    useLayoutEffect(() => {
      onInputRef.current = props.onInput;
    });

    // props → HTML属性の同期（変更があった属性のみ更新）
    useLayoutEffect(() => {
      const el = elRef.current;
      if (!el) return;
      syncAttributes(el, props);
    });

    // 初回マウント時: connectedCallback を再発火させる。
    // React が <circa-input> をDOMに挿入すると connectedCallback が即座に発火するが、
    // その時点ではまだ属性が設定されていない。特に default-* 属性は
    // connectedCallback でしか読まれないため、後から設定しても反映されない。
    // そこで初回のみ disconnect→reconnect で connectedCallback を再発火させる。
    useLayoutEffect(() => {
      const el = elRef.current;
      if (!el) return;
      const parent = el.parentNode;
      if (!parent) return;
      const next = el.nextSibling;
      parent.removeChild(el);
      next ? parent.insertBefore(el, next) : parent.appendChild(el);
    }, []);

    // イベントリスナーの登録（一度だけ。コールバックは ref 経由で最新を参照）
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

    // Ref ハンドルの公開
    useImperativeHandle(ref, () => ({
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
    }));

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
