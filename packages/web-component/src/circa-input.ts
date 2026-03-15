/**
 * <circa-input> カスタム要素
 *
 * coreのロジックを使い、値と曖昧さを入力できるスライダーUI。
 * Shadow DOMで描画し、ARIA属性でアクセシビリティを確保する。
 */
import type { CircaInputConfig, CircaValue } from "@circa-input/core";
import {
  CircaInputError,
  checkRequired,
  createInitialValue,
  updateValue,
  validateConfig,
} from "@circa-input/core";
import { buildConfig, buildInitialValue } from "./attributes.js";
import {
  clientXToPercent,
  percentToValue,
  valueToPercent,
} from "./dom-utils.js";
import { createTemplate } from "./template.js";

/** Shadow DOM内の必須要素を取得。見つからなければエラー。 */
function queryRequired(root: ShadowRoot, selector: string): HTMLElement {
  const el = root.querySelector(selector);
  if (!el) {
    throw new CircaInputError(
      `Required shadow DOM element not found: ${selector}`,
    );
  }
  return el as HTMLElement;
}

/** HTML属性名の定数 */
const ATTR = {
  MIN: "min",
  MAX: "max",
  VALUE: "value",
  MARGIN_LOW: "margin-low",
  MARGIN_HIGH: "margin-high",
  DEFAULT_VALUE: "default-value",
  DEFAULT_MARGIN_LOW: "default-margin-low",
  DEFAULT_MARGIN_HIGH: "default-margin-high",
  MARGIN_MAX: "margin-max",
  DISTRIBUTION: "distribution",
  ASYMMETRIC: "asymmetric",
  STEP: "step",
  NAME: "name",
  REQUIRED: "required",
  DISABLED: "disabled",
} as const;

/** 監視対象のHTML属性一覧 */
const OBSERVED_ATTRS = Object.values(ATTR);

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
  private _clearBtn!: HTMLElement;

  /** ドラッグ状態 */
  private _isDragging = false;
  private _dragStartY = 0;
  private _dragStartX = 0;
  private _dragStartMarginLow = 0;
  private _dragStartMarginHigh = 0;
  private _dragStartValue = 0;

  /** 非対称ハンドルドラッグ状態 */
  private _handleDragTarget: "low" | "high" | null = null;
  private _handleDragStartX = 0;
  private _handleDragStartMargin = 0;

  /** ドラッグ開始時にキャッシュしたトラックのBoundingClientRect */
  private _cachedTrackRect: { left: number; width: number } | null = null;

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
    this._clearBtn = queryRequired(shadow, "[part='clear']");
  }

  connectedCallback(): void {
    this._config = buildConfig((name) => this.getAttribute(name));
    validateConfig(this._config);
    this._circaValue = buildInitialValue(
      (name) => this.getAttribute(name),
      this._config,
      this._isControlled,
    );
    this._renderConfig();
    this._render();

    // connectedCallback時にリスナーを登録（disconnectedCallbackで解除）
    this._valueEl.addEventListener("keydown", this._onKeyDown);
    this._track.addEventListener("pointerdown", this._onTrackPointerDown);
    this._valueEl.addEventListener("pointerdown", this._onValuePointerDown);
    this._handleLow.addEventListener(
      "pointerdown",
      this._onHandleLowPointerDown,
    );
    this._handleHigh.addEventListener(
      "pointerdown",
      this._onHandleHighPointerDown,
    );
    this._handleLow.addEventListener("keydown", this._onHandleLowKeyDown);
    this._handleHigh.addEventListener("keydown", this._onHandleHighKeyDown);
    this._clearBtn.addEventListener("click", this._onClearClick);
  }

  disconnectedCallback(): void {
    // リスナー解除
    this._valueEl.removeEventListener("keydown", this._onKeyDown);
    this._track.removeEventListener("pointerdown", this._onTrackPointerDown);
    this._valueEl.removeEventListener("pointerdown", this._onValuePointerDown);
    this._handleLow.removeEventListener(
      "pointerdown",
      this._onHandleLowPointerDown,
    );
    this._handleHigh.removeEventListener(
      "pointerdown",
      this._onHandleHighPointerDown,
    );
    this._handleLow.removeEventListener("keydown", this._onHandleLowKeyDown);
    this._handleHigh.removeEventListener("keydown", this._onHandleHighKeyDown);
    this._clearBtn.removeEventListener("click", this._onClearClick);

    // 進行中のドラッグをクリーンアップ
    if (this._isDragging) {
      this._isDragging = false;
      this._valueEl.removeEventListener(
        "pointermove",
        this._onValuePointerMove,
      );
      this._valueEl.removeEventListener("pointerup", this._onValuePointerUp);
      this._valueEl.removeEventListener(
        "pointercancel",
        this._onValuePointerUp,
      );
    }
    if (this._handleDragTarget) {
      const handle =
        this._handleDragTarget === "low" ? this._handleLow : this._handleHigh;
      this._handleDragTarget = null;
      handle.removeEventListener("pointermove", this._onHandlePointerMove);
      handle.removeEventListener("pointerup", this._onHandlePointerUp);
      handle.removeEventListener("pointercancel", this._onHandlePointerUp);
    }
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    // connectedCallback前はスキップ
    if (!this._config) return;

    this._config = buildConfig((name) => this.getAttribute(name));
    validateConfig(this._config);

    // Controlled属性が変更された場合は値も再構築
    if (
      _name === ATTR.VALUE ||
      _name === ATTR.MARGIN_LOW ||
      _name === ATTR.MARGIN_HIGH
    ) {
      if (this._isControlled) {
        this._circaValue = buildInitialValue(
          (name) => this.getAttribute(name),
          this._config,
          true,
        );
      }
    }

    this._renderConfig();
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

  /**
   * 値をクリアして未入力状態に戻す。
   * Controlledモードではchangeイベントのみ発火し、内部状態は変更しない。
   */
  clear(): void {
    if (this._isDisabled) return;
    const initial = createInitialValue(this._config);
    if (this._isControlled) {
      // Controlledモードではイベントだけ発火し、外部に判断を委ねる
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { ...initial },
          bubbles: true,
          composed: true,
        }),
      );
    } else {
      this._circaValue = initial;
      this._render();
      this._emitChange();
    }
  }

  /** Controlled モードか判定 */
  private get _isControlled(): boolean {
    return this.getAttribute("value") !== null;
  }

  /** disabled状態か判定 */
  private get _isDisabled(): boolean {
    return this.hasAttribute("disabled");
  }

  /** step刻み（step="any"なら範囲の1%） */
  private get _stepSize(): number {
    if (this._config.step === "any") {
      return (this._config.max - this._config.min) * 0.01;
    }
    return this._config.step;
  }

  /** valueスライダーのキーボードイベント処理 */
  private _onKeyDown = (e: Event): void => {
    if (this._isDisabled) return;
    const ke = e as KeyboardEvent;
    const { key, shiftKey } = ke;
    const step = this._stepSize;
    const cv =
      this._circaValue.value ?? (this._config.min + this._config.max) / 2;
    let handled = false;

    if (shiftKey) {
      const ml = this._circaValue.marginLow ?? 0;
      const mh = this._circaValue.marginHigh ?? 0;
      const base = {
        ...this._circaValue,
        value: cv,
        marginLow: ml,
        marginHigh: mh,
      };

      if (this._config.asymmetric) {
        // 非対称モード: Up/Left→marginLow調整、Down/Right→marginHigh調整
        if (key === "ArrowUp" || key === "ArrowLeft") {
          this._setValue(
            updateValue(base, { marginLow: ml + step }, this._config),
          );
          handled = true;
        } else if (key === "ArrowDown" || key === "ArrowRight") {
          this._setValue(
            updateValue(base, { marginHigh: mh + step }, this._config),
          );
          handled = true;
        }
      } else {
        // 対称モード: 上下左右でmarginLow/Highを同時に拡縮
        if (key === "ArrowRight" || key === "ArrowUp") {
          const newM = ml + step;
          this._setValue(
            updateValue(base, { marginLow: newM, marginHigh: newM }, this._config),
          );
          handled = true;
        } else if (key === "ArrowLeft" || key === "ArrowDown") {
          const newM = Math.max(ml - step, 0);
          this._setValue(
            updateValue(base, { marginLow: newM, marginHigh: newM }, this._config),
          );
          handled = true;
        }
      }
    } else if (key === "ArrowRight" || key === "ArrowUp") {
      this._setValue(
        updateValue(this._circaValue, { value: cv + step }, this._config),
      );
      handled = true;
    } else if (key === "ArrowLeft" || key === "ArrowDown") {
      this._setValue(
        updateValue(this._circaValue, { value: cv - step }, this._config),
      );
      handled = true;
    } else if (key === "Home") {
      this._setValue(
        updateValue(
          this._circaValue,
          { value: this._config.min },
          this._config,
        ),
      );
      handled = true;
    } else if (key === "End") {
      this._setValue(
        updateValue(
          this._circaValue,
          { value: this._config.max },
          this._config,
        ),
      );
      handled = true;
    } else if (key === "Delete" || key === "Backspace") {
      this.clear();
      handled = true;
    }

    if (handled) {
      ke.preventDefault();
      this._emitChange();
    }
  };

  /** トラッククリックで値を設定 */
  private _onTrackPointerDown = (e: Event): void => {
    if (this._isDisabled) return;
    // つまみ上のクリックはドラッグとして扱うのでスキップ
    if (this._isDragging) return;
    const pe = e as PointerEvent;
    // valueEl上のイベントはバブリングで来るのでスキップ
    if (pe.target === this._valueEl) return;

    const rect = this._track.getBoundingClientRect();
    const percent = clientXToPercent(pe.clientX, rect.left, rect.width);
    const newVal = percentToValue(percent, this._config.min, this._config.max);

    const newCirca = updateValue(
      this._circaValue,
      { value: newVal },
      this._config,
    );
    this._setValue(newCirca);
    this._emitChange();
  };

  /** つまみのpointerdownでドラッグ開始 */
  private _onValuePointerDown = (e: Event): void => {
    if (this._isDisabled) return;
    const pe = e as PointerEvent;
    pe.stopPropagation(); // トラッククリックへのバブリングを防止
    pe.preventDefault();

    this._isDragging = true;
    this._dragStartY = pe.clientY;
    this._dragStartX = pe.clientX;

    // ドラッグ開始時にトラックのrectをキャッシュ（moveハンドラで毎フレーム呼ばないため）
    const rect = this._track.getBoundingClientRect();
    this._cachedTrackRect = { left: rect.left, width: rect.width };

    const currentValue =
      this._circaValue.value ?? (this._config.min + this._config.max) / 2;
    this._dragStartValue = currentValue;
    this._dragStartMarginLow = this._circaValue.marginLow ?? 0;
    this._dragStartMarginHigh = this._circaValue.marginHigh ?? 0;

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
    const deltaY = pe.clientY - this._dragStartY;

    // 水平方向: value移動（キャッシュされたrectを使用）
    const rect = this._cachedTrackRect;
    let newValue = this._dragStartValue;
    if (rect && rect.width > 0) {
      const deltaX = pe.clientX - this._dragStartX;
      const deltaPercent = (deltaX / rect.width) * 100;
      newValue = this._dragStartValue + (deltaPercent / 100) * range;
    }

    // 縦方向: margin操作
    let newMarginLow: number;
    let newMarginHigh: number;

    if (this._config.asymmetric) {
      // 非対称モード: 上ドラッグ(deltaY<0)→marginLow拡大、下ドラッグ(deltaY>0)→marginHigh拡大
      const marginDelta = (Math.abs(deltaY) / MARGIN_DRAG_SCALE_PX) * range;
      if (deltaY < 0) {
        // 上方向 → marginLow を増やす
        newMarginLow = this._dragStartMarginLow + marginDelta;
        newMarginHigh = this._dragStartMarginHigh;
      } else {
        // 下方向 → marginHigh を増やす
        newMarginLow = this._dragStartMarginLow;
        newMarginHigh = this._dragStartMarginHigh + marginDelta;
      }
    } else {
      // 対称モード: 下で拡大、上で縮小（従来通り）
      const newMarginRaw =
        this._dragStartMarginLow + (deltaY / MARGIN_DRAG_SCALE_PX) * range;
      newMarginLow = Math.max(newMarginRaw, 0);
      newMarginHigh = newMarginLow;
    }

    const newCirca = updateValue(
      this._circaValue,
      { value: newValue, marginLow: newMarginLow, marginHigh: newMarginHigh },
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
    this._cachedTrackRect = null;

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
    if (this._isDisabled) return;
    pe.stopPropagation();
    pe.preventDefault();

    this._handleDragTarget = target;
    this._handleDragStartX = pe.clientX;
    this._handleDragStartMargin =
      target === "low"
        ? (this._circaValue.marginLow ?? 0)
        : (this._circaValue.marginHigh ?? 0);

    // ドラッグ開始時にトラックのrectをキャッシュ
    const trackRect = this._track.getBoundingClientRect();
    this._cachedTrackRect = { left: trackRect.left, width: trackRect.width };

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

    const rect = this._cachedTrackRect;
    const range = this._config.max - this._config.min;
    const deltaX = pe.clientX - this._handleDragStartX;

    const trackWidth = rect?.width ?? 0;
    const deltaPercent = trackWidth > 0 ? (deltaX / trackWidth) * 100 : 0;
    const deltaValue = (deltaPercent / 100) * range;

    // handle-low: 左に動かすとmarginLow増加（sign=-1）
    // handle-high: 右に動かすとmarginHigh増加（sign=+1）
    const sign = this._handleDragTarget === "low" ? -1 : 1;
    const newMargin = Math.max(this._handleDragStartMargin + sign * deltaValue, 0);
    const marginUpdate = this._handleDragTarget === "low"
      ? { marginLow: newMargin }
      : { marginHigh: newMargin };
    this._setValue(updateValue(this._circaValue, marginUpdate, this._config));

    this._emitInput();
  };

  /** 非対称ハンドルのドラッグ終了 */
  private _onHandlePointerUp = (e: Event): void => {
    if (!this._handleDragTarget) return;
    const pe = e as PointerEvent;

    const handle =
      this._handleDragTarget === "low" ? this._handleLow : this._handleHigh;
    this._handleDragTarget = null;
    this._cachedTrackRect = null;

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

  /** 内部状態を更新し描画する。Controlledモードでは描画をスキップ（属性変更で描画される） */
  private _setValue(newValue: CircaValue): void {
    this._circaValue = newValue;
    if (!this._isControlled) {
      this._render();
    }
  }

  /** 非対称ハンドルのキーボード操作 */
  private _onHandleLowKeyDown = (e: Event): void => {
    if (this._isDisabled) return;
    const ke = e as KeyboardEvent;
    const s = this._stepSize,
      c = this._circaValue.marginLow ?? 0;
    // handle-low: Left/Up=拡大、Right/Down=縮小
    const d =
      ke.key === "ArrowLeft" || ke.key === "ArrowUp"
        ? 1
        : ke.key === "ArrowRight" || ke.key === "ArrowDown"
          ? -1
          : 0;
    if (!d) return;
    this._setValue(
      updateValue(
        this._circaValue,
        { marginLow: Math.max(c + d * s, 0) },
        this._config,
      ),
    );
    ke.preventDefault();
    ke.stopPropagation();
    this._emitChange();
  };

  private _onHandleHighKeyDown = (e: Event): void => {
    if (this._isDisabled) return;
    const ke = e as KeyboardEvent;
    const s = this._stepSize,
      c = this._circaValue.marginHigh ?? 0;
    // handle-high: Right/Up=拡大、Left/Down=縮小
    const d =
      ke.key === "ArrowRight" || ke.key === "ArrowUp"
        ? 1
        : ke.key === "ArrowLeft" || ke.key === "ArrowDown"
          ? -1
          : 0;
    if (!d) return;
    this._setValue(
      updateValue(
        this._circaValue,
        { marginHigh: Math.max(c + d * s, 0) },
        this._config,
      ),
    );
    ke.preventDefault();
    ke.stopPropagation();
    this._emitChange();
  };

  /** クリアボタンのクリックハンドラ */
  private _onClearClick = (e: Event): void => {
    e.stopPropagation();
    this.clear();
  };

  /**
   * config依存の静的ARIA属性を更新する。
   * ドラッグ中には変わらないため、connectedCallback/attributeChangedCallbackでのみ呼ぶ。
   */
  private _renderConfig(): void {
    if (!this._valueEl) return;

    const { min, max } = this._config;

    // valueスライダーの範囲ARIA
    this._valueEl.setAttribute("aria-valuemin", String(min));
    this._valueEl.setAttribute("aria-valuemax", String(max));

    // 非対称ハンドルのアクセシビリティ
    const isAsymmetric = this._config.asymmetric;
    this._handleLow.setAttribute("tabindex", isAsymmetric ? "0" : "-1");
    this._handleLow.setAttribute(
      "aria-hidden",
      isAsymmetric ? "false" : "true",
    );
    this._handleHigh.setAttribute("tabindex", isAsymmetric ? "0" : "-1");
    this._handleHigh.setAttribute(
      "aria-hidden",
      isAsymmetric ? "false" : "true",
    );
  }

  /** DOMを現在の値に合わせて更新する（位置・値のみ。ドラッグ中にも安全に呼べる） */
  private _render(): void {
    if (!this._valueEl) return;

    const { value, marginLow, marginHigh } = this._circaValue;
    const { min, max } = this._config;

    // aria-valuenow の更新
    this._valueEl.setAttribute(
      "aria-valuenow",
      value !== null ? String(value) : "",
    );

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

    // ハンドル位置とARIA値の更新
    if (value !== null) {
      const low = marginLow ?? 0;
      const lowPercent = valueToPercent(value - low, min, max);
      this._handleLow.style.left = `${lowPercent}%`;
      this._handleLow.setAttribute("aria-valuenow", String(low));
      this._handleLow.setAttribute("aria-valuemin", "0");
      this._handleLow.setAttribute(
        "aria-valuemax",
        String(this._config.marginMax ?? value - min),
      );

      const high = marginHigh ?? 0;
      if (high !== Infinity) {
        const highPercent = valueToPercent(value + high, min, max);
        this._handleHigh.style.left = `${highPercent}%`;
        this._handleHigh.setAttribute("aria-valuenow", String(high));
        this._handleHigh.setAttribute("aria-valuemin", "0");
        this._handleHigh.setAttribute(
          "aria-valuemax",
          String(this._config.marginMax ?? max - value),
        );
      }
    }

    // クリアボタンの表示/非表示
    this._clearBtn.style.display = value !== null ? "" : "none";

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

    // requiredバリデーション（checkRequired内部でconfig.requiredもチェックする）
    if (!checkRequired(this._circaValue, this._config)) {
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
