/**
 * <circa-input> カスタム要素
 *
 * coreのロジックを使い、値と曖昧さを入力できるスライダーUI。
 * Shadow DOMで描画し、ARIA属性でアクセシビリティを確保する。
 */
import type { CircaInputConfig, CircaValue } from "@circa-input/core";
import { CircaInputError, checkRequired, updateValue } from "@circa-input/core";
import { buildConfig, buildInitialValue } from "./attributes.js";
import { valueToPercent } from "./dom-utils.js";
import { createTemplate } from "./template.js";

/** Shadow DOM内の必須要素を取得。見つからなければエラー。 */
function queryRequired(root: ShadowRoot, selector: string): HTMLElement {
  const el = root.querySelector(selector);
  if (!el) {
    throw new CircaInputError(`Required shadow DOM element not found: ${selector}`);
  }
  return el as HTMLElement;
}

/** 監視対象のHTML属性一覧 */
const OBSERVED_ATTRS = [
  "min",
  "max",
  "value",
  "margin-low",
  "margin-high",
  "default-value",
  "default-margin-low",
  "default-margin-high",
  "margin-max",
  "distribution",
  "asymmetric",
  "step",
  "name",
  "required",
  "disabled",
] as const;

/**
 * マージンドラッグのスケールファクター。
 * 縦方向のピクセル移動量を、値の範囲に対する比率に変換する係数。
 * 例: 100pxドラッグ → (100/SCALE_PX) * range = margin変化量
 */
const MARGIN_DRAG_SCALE_PX = 100;

export class CircaInputElement extends HTMLElement {
  /** 内部状態 */
  private _circaValue!: CircaValue;
  private _config!: CircaInputConfig;

  /** Shadow DOM要素への参照 */
  private _track!: HTMLElement;
  private _valueEl!: HTMLElement;
  private _marginEl!: HTMLElement;
  private _handleLow!: HTMLElement;
  private _handleHigh!: HTMLElement;

  /** ドラッグ状態 */
  private _isDragging = false;
  private _dragStartY = 0;
  private _dragStartX = 0;
  private _dragStartMargin = 0;
  private _dragStartValue = 0;

  /** 非対称ハンドルドラッグ状態 */
  private _handleDragTarget: "low" | "high" | null = null;
  private _handleDragStartX = 0;
  private _handleDragStartMargin = 0;

  /** フォーム連携 */
  private _internals: ElementInternals | null = null;

  /** フォーム関連カスタム要素として登録 */
  static formAssociated = true;

  static get observedAttributes(): readonly string[] {
    return OBSERVED_ATTRS;
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // ElementInternals（フォーム連携用）
    try {
      this._internals = this.attachInternals();
    } catch {
      // happy-dom では未サポートの場合がある
    }
    const template = createTemplate();
    shadow.appendChild(template.content.cloneNode(true));

    // 要素キャッシュ（見つからなければCircaInputErrorをthrow）
    this._track = queryRequired(shadow, "[part='track']");
    this._valueEl = queryRequired(shadow, "[part='value']");
    this._marginEl = queryRequired(shadow, "[part='margin']");
    this._handleLow = queryRequired(shadow, "[part='handle-low']");
    this._handleHigh = queryRequired(shadow, "[part='handle-high']");

  }

  connectedCallback(): void {
    this._config = buildConfig((name) => this.getAttribute(name));
    this._circaValue = buildInitialValue((name) => this.getAttribute(name), this._config);
    this._render();

    // connectedCallback時にリスナーを登録（disconnectedCallbackで解除）
    this._valueEl.addEventListener("keydown", this._onKeyDown);
    this._track.addEventListener("pointerdown", this._onTrackPointerDown);
    this._valueEl.addEventListener("pointerdown", this._onValuePointerDown);
    this._handleLow.addEventListener("pointerdown", this._onHandleLowPointerDown);
    this._handleHigh.addEventListener("pointerdown", this._onHandleHighPointerDown);
  }

  disconnectedCallback(): void {
    // リスナー解除
    this._valueEl.removeEventListener("keydown", this._onKeyDown);
    this._track.removeEventListener("pointerdown", this._onTrackPointerDown);
    this._valueEl.removeEventListener("pointerdown", this._onValuePointerDown);
    this._handleLow.removeEventListener("pointerdown", this._onHandleLowPointerDown);
    this._handleHigh.removeEventListener("pointerdown", this._onHandleHighPointerDown);

    // 進行中のドラッグをクリーンアップ
    if (this._isDragging) {
      this._isDragging = false;
      this._valueEl.removeEventListener("pointermove", this._onValuePointerMove);
      this._valueEl.removeEventListener("pointerup", this._onValuePointerUp);
      this._valueEl.removeEventListener("pointercancel", this._onValuePointerUp);
    }
    if (this._handleDragTarget) {
      const handle = this._handleDragTarget === "low" ? this._handleLow : this._handleHigh;
      this._handleDragTarget = null;
      handle.removeEventListener("pointermove", this._onHandlePointerMove);
      handle.removeEventListener("pointerup", this._onHandlePointerUp);
      handle.removeEventListener("pointercancel", this._onHandlePointerUp);
    }
  }

  attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null): void {
    // connectedCallback前はスキップ
    if (!this._config) return;

    this._config = buildConfig((name) => this.getAttribute(name));

    // Controlled属性が変更された場合は値も再構築
    if (_name === "value" || _name === "margin-low" || _name === "margin-high") {
      if (this._isControlled) {
        this._circaValue = buildInitialValue((name) => this.getAttribute(name), this._config);
      }
    }

    this._render();
  }

  /** 現在のCircaValueを読み取り専用プロパティとして公開 */
  get circaValue(): CircaValue {
    return { ...this._circaValue };
  }

  /** フォーム送信用のJSON値 */
  get formValue(): string | null {
    if (this._circaValue.value !== null) {
      return JSON.stringify(this._circaValue);
    }
    return null;
  }

  /** Controlled モードか判定 */
  private get _isControlled(): boolean {
    return this.getAttribute("value") !== null;
  }

  /** step刻み（step="any"なら範囲の1%） */
  private get _stepSize(): number {
    if (this._config.step === "any") {
      return (this._config.max - this._config.min) * 0.01;
    }
    return this._config.step;
  }

  /** キーボードイベント処理 */
  private _onKeyDown = (e: Event): void => {
    const ke = e as KeyboardEvent;
    const step = this._stepSize;

    // 値が未設定の場合は中央値をベースにする
    const currentValue = this._circaValue.value ?? (this._config.min + this._config.max) / 2;
    const currentMarginLow = this._circaValue.marginLow ?? 0;
    const currentMarginHigh = this._circaValue.marginHigh ?? 0;

    let handled = false;

    if (ke.shiftKey) {
      // Shift + 矢印: margin操作
      switch (ke.key) {
        case "ArrowRight":
        case "ArrowUp": {
          const newValue = updateValue(
            { ...this._circaValue, value: currentValue, marginLow: currentMarginLow, marginHigh: currentMarginHigh },
            { marginLow: currentMarginLow + step },
            this._config,
          );
          this._setValue(newValue);
          handled = true;
          break;
        }
        case "ArrowLeft":
        case "ArrowDown": {
          const newMargin = Math.max(currentMarginLow - step, 0);
          const newValue = updateValue(
            { ...this._circaValue, value: currentValue, marginLow: currentMarginLow, marginHigh: currentMarginHigh },
            { marginLow: newMargin },
            this._config,
          );
          this._setValue(newValue);
          handled = true;
          break;
        }
      }
    } else {
      // 通常矢印: value操作
      switch (ke.key) {
        case "ArrowRight":
        case "ArrowUp": {
          const newValue = updateValue(
            this._circaValue,
            { value: currentValue + step },
            this._config,
          );
          this._setValue(newValue);
          handled = true;
          break;
        }
        case "ArrowLeft":
        case "ArrowDown": {
          const newValue = updateValue(
            this._circaValue,
            { value: currentValue - step },
            this._config,
          );
          this._setValue(newValue);
          handled = true;
          break;
        }
        case "Home": {
          const newValue = updateValue(
            this._circaValue,
            { value: this._config.min },
            this._config,
          );
          this._setValue(newValue);
          handled = true;
          break;
        }
        case "End": {
          const newValue = updateValue(
            this._circaValue,
            { value: this._config.max },
            this._config,
          );
          this._setValue(newValue);
          handled = true;
          break;
        }
      }
    }

    if (handled) {
      ke.preventDefault();
      this._emitChange();
    }
  };

  /** トラッククリックで値を設定 */
  private _onTrackPointerDown = (e: Event): void => {
    // つまみ上のクリックはドラッグとして扱うのでスキップ
    if (this._isDragging) return;
    const pe = e as PointerEvent;
    // valueEl上のイベントはバブリングで来るのでスキップ
    if (pe.target === this._valueEl) return;

    const rect = this._track.getBoundingClientRect();
    const percent = ((pe.clientX - rect.left) / rect.width) * 100;
    const clampedPercent = Math.min(Math.max(percent, 0), 100);
    const newVal = (clampedPercent / 100) * (this._config.max - this._config.min) + this._config.min;

    const newCirca = updateValue(this._circaValue, { value: newVal }, this._config);
    this._setValue(newCirca);
    this._emitChange();
  };

  /** つまみのpointerdownでドラッグ開始 */
  private _onValuePointerDown = (e: Event): void => {
    const pe = e as PointerEvent;
    pe.stopPropagation(); // トラッククリックへのバブリングを防止
    pe.preventDefault();

    this._isDragging = true;
    this._dragStartY = pe.clientY;
    this._dragStartX = pe.clientX;

    const currentValue = this._circaValue.value ?? (this._config.min + this._config.max) / 2;
    this._dragStartValue = currentValue;
    this._dragStartMargin = this._circaValue.marginLow ?? 0;

    // setPointerCapture でドラッグ中のイベント漏れ防止
    try {
      this._valueEl.setPointerCapture(pe.pointerId);
    } catch {
      // happy-dom ではサポートされない場合がある
    }

    this._valueEl.addEventListener("pointermove", this._onValuePointerMove);
    this._valueEl.addEventListener("pointerup", this._onValuePointerUp);
    this._valueEl.addEventListener("pointercancel", this._onValuePointerUp);
  };

  /** ドラッグ中のポインター移動 */
  private _onValuePointerMove = (e: Event): void => {
    if (!this._isDragging) return;
    const pe = e as PointerEvent;

    const range = this._config.max - this._config.min;

    // 縦方向: margin操作（下で拡大、上で縮小）
    const deltaY = pe.clientY - this._dragStartY;
    const newMarginRaw = this._dragStartMargin + (deltaY / MARGIN_DRAG_SCALE_PX) * range;
    const newMargin = Math.max(newMarginRaw, 0);

    // 水平方向: value移動
    const rect = this._track.getBoundingClientRect();
    let newValue = this._dragStartValue;
    if (rect.width > 0) {
      const deltaX = pe.clientX - this._dragStartX;
      const deltaPercent = (deltaX / rect.width) * 100;
      newValue = this._dragStartValue + (deltaPercent / 100) * range;
    }

    const newCirca = updateValue(
      this._circaValue,
      { value: newValue, marginLow: newMargin },
      this._config,
    );
    this._setValue(newCirca);
    this._emitInput();
  };

  /** ドラッグ終了 */
  private _onValuePointerUp = (e: Event): void => {
    if (!this._isDragging) return;
    const pe = e as PointerEvent;

    this._isDragging = false;

    try {
      this._valueEl.releasePointerCapture(pe.pointerId);
    } catch {
      // happy-dom ではサポートされない場合がある
    }

    this._valueEl.removeEventListener("pointermove", this._onValuePointerMove);
    this._valueEl.removeEventListener("pointerup", this._onValuePointerUp);
    this._valueEl.removeEventListener("pointercancel", this._onValuePointerUp);

    this._emitChange();
  };

  /** handle-low の pointerdown */
  private _onHandleLowPointerDown = (e: Event): void => {
    this._startHandleDrag(e as PointerEvent, "low");
  };

  /** handle-high の pointerdown */
  private _onHandleHighPointerDown = (e: Event): void => {
    this._startHandleDrag(e as PointerEvent, "high");
  };

  /** 非対称ハンドルのドラッグ開始 */
  private _startHandleDrag(pe: PointerEvent, target: "low" | "high"): void {
    pe.stopPropagation();
    pe.preventDefault();

    this._handleDragTarget = target;
    this._handleDragStartX = pe.clientX;
    this._handleDragStartMargin =
      target === "low"
        ? this._circaValue.marginLow ?? 0
        : this._circaValue.marginHigh ?? 0;

    const handle = target === "low" ? this._handleLow : this._handleHigh;

    try {
      handle.setPointerCapture(pe.pointerId);
    } catch {
      // happy-dom ではサポートされない場合がある
    }

    handle.addEventListener("pointermove", this._onHandlePointerMove);
    handle.addEventListener("pointerup", this._onHandlePointerUp);
    handle.addEventListener("pointercancel", this._onHandlePointerUp);
  }

  /** 非対称ハンドルのドラッグ中 */
  private _onHandlePointerMove = (e: Event): void => {
    if (!this._handleDragTarget) return;
    const pe = e as PointerEvent;

    const rect = this._track.getBoundingClientRect();
    const range = this._config.max - this._config.min;
    const deltaX = pe.clientX - this._handleDragStartX;

    if (this._handleDragTarget === "low") {
      // handle-low: 左に動かすとmarginLow増加（deltaX負で増加）
      const deltaPercent = rect.width > 0 ? (deltaX / rect.width) * 100 : 0;
      const deltaValue = (deltaPercent / 100) * range;
      const newMargin = Math.max(this._handleDragStartMargin - deltaValue, 0);
      const newCirca = updateValue(
        this._circaValue,
        { marginLow: newMargin },
        this._config,
      );
      this._setValue(newCirca);
    } else {
      // handle-high: 右に動かすとmarginHigh増加
      const deltaPercent = rect.width > 0 ? (deltaX / rect.width) * 100 : 0;
      const deltaValue = (deltaPercent / 100) * range;
      const newMargin = Math.max(this._handleDragStartMargin + deltaValue, 0);
      const newCirca = updateValue(
        this._circaValue,
        { marginHigh: newMargin },
        this._config,
      );
      this._setValue(newCirca);
    }

    this._emitInput();
  };

  /** 非対称ハンドルのドラッグ終了 */
  private _onHandlePointerUp = (e: Event): void => {
    if (!this._handleDragTarget) return;
    const pe = e as PointerEvent;

    const handle = this._handleDragTarget === "low" ? this._handleLow : this._handleHigh;
    this._handleDragTarget = null;

    try {
      handle.releasePointerCapture(pe.pointerId);
    } catch {
      // happy-dom ではサポートされない場合がある
    }

    handle.removeEventListener("pointermove", this._onHandlePointerMove);
    handle.removeEventListener("pointerup", this._onHandlePointerUp);
    handle.removeEventListener("pointercancel", this._onHandlePointerUp);

    this._emitChange();
  };

  /** 内部状態を更新し描画する（Controlledモードの場合は更新しない） */
  private _setValue(newValue: CircaValue): void {
    if (this._isControlled) {
      // Controlledモードではイベントのみ発火し、内部状態は変更しない
      // 外部からvalue属性を変更してもらう必要がある
      this._circaValue = newValue; // イベントdetail用に一時的に保持
      return;
    }
    this._circaValue = newValue;
    this._render();
  }

  /** DOMを現在の状態に合わせて更新 */
  private _render(): void {
    if (!this._valueEl) return;

    const { value, marginLow, marginHigh } = this._circaValue;
    const { min, max } = this._config;

    // ARIA属性の更新
    this._valueEl.setAttribute("aria-valuemin", String(min));
    this._valueEl.setAttribute("aria-valuemax", String(max));
    this._valueEl.setAttribute("aria-valuenow", value !== null ? String(value) : "");

    // 値インジケータの位置
    if (value !== null) {
      const percent = valueToPercent(value, min, max);
      this._valueEl.style.left = `${percent}%`;
      this._valueEl.style.display = "";
    } else {
      this._valueEl.style.display = "none";
    }

    // マージン帯の描画
    if (value !== null && (marginLow !== null || marginHigh !== null)) {
      const low = marginLow ?? 0;
      const high = marginHigh ?? 0;
      const leftPercent = valueToPercent(value - low, min, max);
      const rightPercent = valueToPercent(value + high, min, max);
      this._marginEl.style.left = `${leftPercent}%`;
      this._marginEl.style.width = `${rightPercent - leftPercent}%`;
      this._marginEl.style.display = "";
    } else {
      this._marginEl.style.display = "none";
    }

    // 非対称ハンドルのアクセシビリティと位置
    const isAsymmetric = this._config.asymmetric;
    this._handleLow.setAttribute("tabindex", isAsymmetric ? "0" : "-1");
    this._handleLow.setAttribute("aria-hidden", isAsymmetric ? "false" : "true");
    this._handleHigh.setAttribute("tabindex", isAsymmetric ? "0" : "-1");
    this._handleHigh.setAttribute("aria-hidden", isAsymmetric ? "false" : "true");

    if (value !== null && marginLow !== null) {
      const lowPercent = valueToPercent(value - marginLow, min, max);
      this._handleLow.style.left = `${lowPercent}%`;
      this._handleLow.setAttribute("aria-valuenow", String(marginLow));
      this._handleLow.setAttribute("aria-valuemin", "0");
      this._handleLow.setAttribute(
        "aria-valuemax",
        String(this._config.marginMax ?? value - min),
      );
    }
    if (value !== null && marginHigh !== null && marginHigh !== Infinity) {
      const highPercent = valueToPercent(value + marginHigh, min, max);
      this._handleHigh.style.left = `${highPercent}%`;
      this._handleHigh.setAttribute("aria-valuenow", String(marginHigh));
      this._handleHigh.setAttribute("aria-valuemin", "0");
      this._handleHigh.setAttribute(
        "aria-valuemax",
        String(this._config.marginMax ?? max - value),
      );
    }

    // フォーム値の更新
    this._updateFormValue();
  }

  /** ElementInternals経由でFormDataにJSON値を設定 */
  private _updateFormValue(): void {
    if (!this._internals) return;

    if (this._circaValue.value !== null) {
      this._internals.setFormValue(JSON.stringify(this._circaValue));
    } else {
      this._internals.setFormValue(null);
    }

    // requiredバリデーション
    if (this._config.required && !checkRequired(this._circaValue, this._config)) {
      this._internals.setValidity(
        { valueMissing: true },
        "This field is required",
        this._valueEl,
      );
    } else {
      this._internals.setValidity({});
    }
  }

  /** changeイベントを発火（操作完了時） */
  private _emitChange(): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: this.circaValue,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** inputイベントを発火（操作中リアルタイム） */
  private _emitInput(): void {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: this.circaValue,
        bubbles: true,
        composed: true,
      }),
    );
  }
}
