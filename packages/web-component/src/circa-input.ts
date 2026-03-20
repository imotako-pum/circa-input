/**
 * <circa-input> custom element
 *
 * A slider UI for inputting a value and its ambiguity, powered by core logic.
 * Renders via Shadow DOM and ensures accessibility through ARIA attributes.
 */
import type { CircaInputConfig, CircaValue } from "@circa-input/core";
import {
  CircaInputError,
  checkRequired,
  clampMargins,
  createInitialValue,
  generateTicks,
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

/** Retrieve a required element from the Shadow DOM. Throws if not found. */
function queryRequired(root: ShadowRoot, selector: string): HTMLElement {
  const el = root.querySelector(selector);
  if (!el) {
    throw new CircaInputError(
      `Required shadow DOM element not found: ${selector}`,
    );
  }
  return el as HTMLElement;
}

/** HTML attribute name constants */
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
  NO_CLEAR: "no-clear",
  TICK_INTERVAL: "tick-interval",
  INITIAL_MARGIN: "initial-margin",
  ARIA_LABEL: "aria-label",
} as const;

/** List of observed HTML attributes */
const OBSERVED_ATTRS = Object.values(ATTR);

/**
 * Scale factor for margin drag.
 * Coefficient that converts vertical pixel movement to a ratio of the value range.
 * e.g. 100px drag -> (100/SCALE_PX) * range = margin delta
 */
const MARGIN_DRAG_SCALE_PX = 100;

/**
 * Threshold (px) for locking the target margin during asymmetric center thumb drag.
 * The first vertical movement exceeding this distance locks either "low" or "high".
 */
const ASYMMETRIC_LOCK_THRESHOLD_PX = 5;

export class CircaInputElement extends HTMLElement {
  /** @internal Internal state */
  private _circaValue!: CircaValue;
  /** @internal */
  private _config!: CircaInputConfig;

  /** @internal References to Shadow DOM elements */
  private _trackArea!: HTMLElement;
  /** @internal */
  private _track!: HTMLElement;
  /** @internal */
  private _valueEl!: HTMLElement;
  /** @internal */
  private _marginEl!: HTMLElement;
  /** @internal */
  private _handleLow!: HTMLElement;
  /** @internal */
  private _handleHigh!: HTMLElement;
  /** @internal */
  private _clearArea!: HTMLElement;

  /** @internal Drag state */
  private _isDragging = false;
  /** @internal */
  private _dragStartY = 0;
  /** @internal */
  private _dragStartX = 0;
  /** @internal */
  private _dragStartMarginLow = 0;
  /** @internal */
  private _dragStartMarginHigh = 0;
  /** @internal */
  private _dragStartValue = 0;

  /** @internal Asymmetric mode center thumb drag: locked target */
  private _asymmetricDragLocked: "low" | "high" | null = null;

  /** @internal Asymmetric handle drag state */
  private _handleDragTarget: "low" | "high" | null = null;
  /** @internal */
  private _handleDragStartX = 0;
  /** @internal */
  private _handleDragStartMargin = 0;

  /** @internal Cached track BoundingClientRect from drag start */
  private _cachedTrackRect: { left: number; width: number } | null = null;

  /** @internal Deferred attribute update while dragging (controlled mode) */
  private _pendingAttributeUpdate = false;

  /** @internal Form integration */
  private _internals: ElementInternals | null = null;

  /** Register as a form-associated custom element */
  static formAssociated = true;

  static get observedAttributes(): readonly string[] {
    return OBSERVED_ATTRS;
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // ElementInternals (for form integration)
    try {
      this._internals = this.attachInternals();
    } catch {
      console.warn(
        "[circa-input] ElementInternals is not supported. Form integration will be unavailable.",
      );
    }
    const template = createTemplate();
    shadow.appendChild(template.content.cloneNode(true));

    // Cache elements (throws CircaInputError if not found)
    this._trackArea = queryRequired(shadow, "[part='track-area']");
    this._track = queryRequired(shadow, "[part='track']");
    this._valueEl = queryRequired(shadow, "[part='value']");
    this._marginEl = queryRequired(shadow, "[part='margin']");
    this._handleLow = queryRequired(shadow, "[part='handle-low']");
    this._handleHigh = queryRequired(shadow, "[part='handle-high']");
    this._clearArea = queryRequired(shadow, "[part='clear-area']");
  }

  connectedCallback(): void {
    this._config = buildConfig((name) => this.getAttribute(name));
    validateConfig(this._config);
    this._circaValue = clampMargins(
      buildInitialValue(
        (name) => this.getAttribute(name),
        this._config,
        this._isControlled,
      ),
      this._config,
    );
    this._renderConfig();
    this._render();

    // Register listeners on connectedCallback (removed in disconnectedCallback)
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
    this._clearArea.addEventListener("click", this._onClearClick);
  }

  disconnectedCallback(): void {
    // Remove listeners
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
    this._clearArea.removeEventListener("click", this._onClearClick);

    // Clean up any in-progress drag
    this._pendingAttributeUpdate = false;
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
    // Skip if called before connectedCallback
    if (!this._config) return;

    // Defer ALL attribute processing during drag to prevent position jumps
    // and config/value inconsistencies. Applied when the drag ends.
    if (this._isDragging || this._handleDragTarget) {
      this._pendingAttributeUpdate = true;
      return;
    }

    this._config = buildConfig((name) => this.getAttribute(name));
    validateConfig(this._config);

    // Rebuild value when controlled attributes change
    if (
      _name === ATTR.VALUE ||
      _name === ATTR.MARGIN_LOW ||
      _name === ATTR.MARGIN_HIGH
    ) {
      if (this._isControlled) {
        this._circaValue = clampMargins(
          buildInitialValue(
            (name) => this.getAttribute(name),
            this._config,
            true,
          ),
          this._config,
        );
      }
    }

    // Handle default-* attributes set after connectedCallback
    // (e.g., React sets attributes after DOM insertion)
    if (
      (_name === ATTR.DEFAULT_VALUE ||
        _name === ATTR.DEFAULT_MARGIN_LOW ||
        _name === ATTR.DEFAULT_MARGIN_HIGH) &&
      !this._isControlled &&
      this._circaValue.value === null
    ) {
      this._circaValue = clampMargins(
        buildInitialValue(
          (name) => this.getAttribute(name),
          this._config,
          false,
        ),
        this._config,
      );
    }

    this._renderConfig();
    this._render();
  }

  /** Expose the current CircaValue as a read-only property */
  get circaValue(): CircaValue {
    return { ...this._circaValue };
  }

  /** JSON value for form submission */
  get formValue(): string | null {
    if (this._circaValue.value !== null) {
      return JSON.stringify(this._circaValue);
    }
    return null;
  }

  /**
   * Clear the value and reset to the unset state.
   * In controlled mode, only fires the change event without modifying internal state.
   */
  clear(): void {
    if (this._isDisabled) return;
    const initial = createInitialValue(this._config);
    if (this._isControlled) {
      // In controlled mode, only fire the event and let the external owner decide
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

  /** @internal Check if in controlled mode */
  private get _isControlled(): boolean {
    return this.getAttribute("value") !== null;
  }

  /** @internal Check if disabled */
  private get _isDisabled(): boolean {
    return this.hasAttribute("disabled");
  }

  /** @internal Step size (1% of range when step="any") */
  private get _stepSize(): number {
    if (this._config.step === "any") {
      return (this._config.max - this._config.min) * 0.01;
    }
    return this._config.step;
  }

  /** @internal Keyboard event handler for the value slider */
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
        // Asymmetric mode: Up/Left adjusts marginLow, Down/Right adjusts marginHigh
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
        // Symmetric mode: all arrow keys expand/shrink marginLow/High together
        if (key === "ArrowRight" || key === "ArrowUp") {
          const newM = ml + step;
          this._setValue(
            updateValue(
              base,
              { marginLow: newM, marginHigh: newM },
              this._config,
            ),
          );
          handled = true;
        } else if (key === "ArrowLeft" || key === "ArrowDown") {
          const newM = Math.max(ml - step, 0);
          this._setValue(
            updateValue(
              base,
              { marginLow: newM, marginHigh: newM },
              this._config,
            ),
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
    } else if (key === "PageUp") {
      const largeStep = (this._config.max - this._config.min) * 0.1;
      this._setValue(
        updateValue(this._circaValue, { value: cv + largeStep }, this._config),
      );
      handled = true;
    } else if (key === "PageDown") {
      const largeStep = (this._config.max - this._config.min) * 0.1;
      this._setValue(
        updateValue(this._circaValue, { value: cv - largeStep }, this._config),
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

  /** @internal Set value on track click */
  private _onTrackPointerDown = (e: Event): void => {
    if (this._isDisabled) return;
    // Skip clicks on the thumb as they are handled as drags
    if (this._isDragging) return;
    const pe = e as PointerEvent;
    // Skip events bubbling up from valueEl
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

  /** @internal Start drag on thumb pointerdown */
  private _onValuePointerDown = (e: Event): void => {
    if (this._isDisabled) return;
    const pe = e as PointerEvent;
    pe.stopPropagation(); // Prevent bubbling to track click handler
    pe.preventDefault();

    this._isDragging = true;
    this._asymmetricDragLocked = null;
    this._dragStartY = pe.clientY;
    this._dragStartX = pe.clientX;

    // Cache track rect at drag start (to avoid calling per frame in move handler)
    const rect = this._track.getBoundingClientRect();
    this._cachedTrackRect = { left: rect.left, width: rect.width };

    const currentValue =
      this._circaValue.value ?? (this._config.min + this._config.max) / 2;
    this._dragStartValue = currentValue;
    this._dragStartMarginLow = this._circaValue.marginLow ?? 0;
    this._dragStartMarginHigh = this._circaValue.marginHigh ?? 0;

    // setPointerCapture to prevent event leakage during drag
    try {
      this._valueEl.setPointerCapture(pe.pointerId);
    } catch {
      // Pointer capture is optional — drag still works via attached event listeners.
      // May fail in test environments (happy-dom) or very old browsers.
    }

    this._valueEl.addEventListener("pointermove", this._onValuePointerMove);
    this._valueEl.addEventListener("pointerup", this._onValuePointerUp);
    this._valueEl.addEventListener("pointercancel", this._onValuePointerUp);
  };

  /** @internal Pointer move during drag */
  private _onValuePointerMove = (e: Event): void => {
    if (!this._isDragging) return;
    const pe = e as PointerEvent;

    const range = this._config.max - this._config.min;
    const deltaY = pe.clientY - this._dragStartY;

    // Horizontal: move value (using cached rect)
    const rect = this._cachedTrackRect;
    let newValue = this._dragStartValue;
    if (rect && rect.width > 0) {
      const deltaX = pe.clientX - this._dragStartX;
      const deltaPercent = (deltaX / rect.width) * 100;
      newValue = this._dragStartValue + (deltaPercent / 100) * range;
    }

    // Vertical: margin adjustment
    let newMarginLow: number;
    let newMarginHigh: number;

    if (this._config.asymmetric) {
      // Asymmetric mode: lock the target margin on the first vertical movement
      // Drag up -> marginLow, drag down -> marginHigh
      // After locking, freely increase/decrease that margin (the other stays unchanged)
      const absDeltaY = Math.abs(deltaY);

      // Lock direction once threshold is exceeded
      if (
        this._asymmetricDragLocked === null &&
        absDeltaY >= ASYMMETRIC_LOCK_THRESHOLD_PX
      ) {
        this._asymmetricDragLocked = deltaY < 0 ? "low" : "high";
      }

      if (this._asymmetricDragLocked === "low") {
        // Adjust marginLow: up (deltaY<0) increases, down (deltaY>0) decreases
        const marginDelta = (-deltaY / MARGIN_DRAG_SCALE_PX) * range;
        newMarginLow = Math.max(this._dragStartMarginLow + marginDelta, 0);
        newMarginHigh = this._dragStartMarginHigh;
      } else if (this._asymmetricDragLocked === "high") {
        // Adjust marginHigh: down (deltaY>0) increases, up (deltaY<0) decreases
        const marginDelta = (deltaY / MARGIN_DRAG_SCALE_PX) * range;
        newMarginLow = this._dragStartMarginLow;
        newMarginHigh = Math.max(this._dragStartMarginHigh + marginDelta, 0);
      } else {
        // Below threshold: no margin change
        newMarginLow = this._dragStartMarginLow;
        newMarginHigh = this._dragStartMarginHigh;
      }
    } else {
      // Symmetric mode: down expands, up shrinks (same as before)
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

  /** @internal Drag end */
  private _onValuePointerUp = (e: Event): void => {
    if (!this._isDragging) return;
    const pe = e as PointerEvent;

    this._isDragging = false;
    this._asymmetricDragLocked = null;
    this._cachedTrackRect = null;

    try {
      this._valueEl.releasePointerCapture(pe.pointerId);
    } catch {
      // Pointer capture is optional — drag still works via attached event listeners.
      // May fail in test environments (happy-dom) or very old browsers.
    }

    this._valueEl.removeEventListener("pointermove", this._onValuePointerMove);
    this._valueEl.removeEventListener("pointerup", this._onValuePointerUp);
    this._valueEl.removeEventListener("pointercancel", this._onValuePointerUp);

    this._applyPendingAttributeUpdate();
    this._emitChange();
  };

  /** @internal Apply deferred attribute updates after drag ends */
  private _applyPendingAttributeUpdate(): void {
    if (!this._pendingAttributeUpdate) return;
    this._pendingAttributeUpdate = false;
    if (this._isControlled) {
      this._config = buildConfig((name) => this.getAttribute(name));
      validateConfig(this._config);
      this._circaValue = clampMargins(
        buildInitialValue(
          (name) => this.getAttribute(name),
          this._config,
          true,
        ),
        this._config,
      );
      this._renderConfig();
      this._render();
    }
  }

  /** @internal handle-low pointerdown */
  private _onHandleLowPointerDown = (e: Event): void => {
    this._startHandleDrag(e as PointerEvent, "low");
  };

  /** @internal handle-high pointerdown */
  private _onHandleHighPointerDown = (e: Event): void => {
    this._startHandleDrag(e as PointerEvent, "high");
  };

  /** @internal Start asymmetric handle drag */
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

    // Cache track rect at drag start
    const trackRect = this._track.getBoundingClientRect();
    this._cachedTrackRect = { left: trackRect.left, width: trackRect.width };

    const handle = target === "low" ? this._handleLow : this._handleHigh;

    try {
      handle.setPointerCapture(pe.pointerId);
    } catch {
      // Pointer capture is optional — drag still works via attached event listeners.
      // May fail in test environments (happy-dom) or very old browsers.
    }

    handle.addEventListener("pointermove", this._onHandlePointerMove);
    handle.addEventListener("pointerup", this._onHandlePointerUp);
    handle.addEventListener("pointercancel", this._onHandlePointerUp);
  }

  /** @internal Asymmetric handle drag move */
  private _onHandlePointerMove = (e: Event): void => {
    if (!this._handleDragTarget) return;
    const pe = e as PointerEvent;

    const rect = this._cachedTrackRect;
    const range = this._config.max - this._config.min;
    const deltaX = pe.clientX - this._handleDragStartX;

    const trackWidth = rect?.width ?? 0;
    const deltaPercent = trackWidth > 0 ? (deltaX / trackWidth) * 100 : 0;
    const deltaValue = (deltaPercent / 100) * range;

    // handle-low: moving left increases marginLow (sign=-1)
    // handle-high: moving right increases marginHigh (sign=+1)
    const sign = this._handleDragTarget === "low" ? -1 : 1;
    const newMargin = Math.max(
      this._handleDragStartMargin + sign * deltaValue,
      0,
    );
    const marginUpdate =
      this._handleDragTarget === "low"
        ? { marginLow: newMargin }
        : { marginHigh: newMargin };
    this._setValue(updateValue(this._circaValue, marginUpdate, this._config));

    this._emitInput();
  };

  /** @internal Asymmetric handle drag end */
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
      // Pointer capture is optional — drag still works via attached event listeners.
      // May fail in test environments (happy-dom) or very old browsers.
    }

    handle.removeEventListener("pointermove", this._onHandlePointerMove);
    handle.removeEventListener("pointerup", this._onHandlePointerUp);
    handle.removeEventListener("pointercancel", this._onHandlePointerUp);

    this._applyPendingAttributeUpdate();
    this._emitChange();
  };

  /** @internal Update internal state and render. Skips full rendering in controlled mode (rendered on attribute change). */
  private _setValue(newValue: CircaValue): void {
    this._circaValue = newValue;
    if (!this._isControlled) {
      this._render();
    } else {
      // In controlled mode, still update ARIA attributes live during drag
      this._updateAriaValues();
    }
  }

  /** @internal Update ARIA value attributes (aria-valuenow / aria-valuetext). Single source of truth. */
  private _updateAriaValues(): void {
    const { value, marginLow, marginHigh } = this._circaValue;
    if (value !== null) {
      this._valueEl.setAttribute("aria-valuenow", String(value));
      if (marginLow !== null || marginHigh !== null) {
        const low = marginLow ?? 0;
        const high = marginHigh ?? 0;
        if (!this._config.asymmetric && low === high) {
          this._valueEl.setAttribute(
            "aria-valuetext",
            `${value}, plus or minus ${low}`,
          );
        } else {
          this._valueEl.setAttribute(
            "aria-valuetext",
            `${value}, minus ${low}, plus ${high}`,
          );
        }
      } else {
        this._valueEl.removeAttribute("aria-valuetext");
      }
    } else {
      this._valueEl.removeAttribute("aria-valuenow");
      this._valueEl.removeAttribute("aria-valuetext");
    }
  }

  /** @internal Keyboard handler for asymmetric handles */
  private _onHandleLowKeyDown = (e: Event): void => {
    if (this._isDisabled) return;
    const ke = e as KeyboardEvent;
    const s = this._stepSize,
      c = this._circaValue.marginLow ?? 0;
    // handle-low: Left/Up=expand, Right/Down=shrink
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

  /** @internal */
  private _onHandleHighKeyDown = (e: Event): void => {
    if (this._isDisabled) return;
    const ke = e as KeyboardEvent;
    const s = this._stepSize,
      c = this._circaValue.marginHigh ?? 0;
    // handle-high: Right/Up=expand, Left/Down=shrink
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

  /** @internal Clear button click handler */
  private _onClearClick = (e: Event): void => {
    e.stopPropagation();
    this.clear();
  };

  /**
   * @internal
   * Render tick marks based on the tick-interval attribute.
   * Recreates the tick container if one already exists.
   */
  private _renderTicks(): void {
    // Remove existing tick container
    const existing = this._trackArea.querySelector("[part='ticks']");
    if (existing) existing.remove();

    // Parse tick-interval attribute
    const tickIntervalStr = this.getAttribute(ATTR.TICK_INTERVAL);
    if (tickIntervalStr === null) return;

    const tickInterval = Number(tickIntervalStr);
    const { min, max } = this._config;
    const ticks = generateTicks(min, max, tickInterval);
    if (ticks.length === 0) return;

    // Create tick container
    const container = document.createElement("div");
    container.setAttribute("part", "ticks");
    container.setAttribute("aria-hidden", "true");

    for (const tick of ticks) {
      const percent = valueToPercent(tick, min, max);
      const tickEl = document.createElement("div");
      tickEl.className = "circa-tick";
      tickEl.style.left = `${percent}%`;

      const line = document.createElement("div");
      line.className = "circa-tick-line";

      const label = document.createElement("span");
      label.className = "circa-tick-label";
      label.textContent = String(tick);

      tickEl.appendChild(line);
      tickEl.appendChild(label);
      container.appendChild(tickEl);
    }

    this._trackArea.appendChild(container);
  }

  /**
   * @internal
   * Update static ARIA attributes that depend on config.
   * Only called from connectedCallback/attributeChangedCallback since these don't change during drag.
   */
  private _renderConfig(): void {
    if (!this._valueEl) return;

    const { min, max } = this._config;

    // Value slider range ARIA
    this._valueEl.setAttribute("aria-valuemin", String(min));
    this._valueEl.setAttribute("aria-valuemax", String(max));

    // Render tick marks
    this._renderTicks();

    // Propagate host's aria-label to the Shadow DOM group
    const container = this.shadowRoot?.querySelector(
      "[part='container']",
    ) as HTMLElement | null;
    if (container) {
      const hostLabel = this.getAttribute("aria-label");
      container.setAttribute("aria-label", hostLabel ?? "circa input");
    }

    // Sync disabled state to ARIA
    const disabled = this._isDisabled;
    this._valueEl.setAttribute("aria-disabled", String(disabled));
    this._handleLow.setAttribute("aria-disabled", String(disabled));
    this._handleHigh.setAttribute("aria-disabled", String(disabled));
    const clearBtn = this._clearArea.querySelector(
      "[part='clear']",
    ) as HTMLButtonElement | null;
    if (clearBtn) {
      clearBtn.disabled = disabled;
    }

    // Accessibility for asymmetric handles
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

  /** @internal Update the DOM to reflect the current value (position and value only; safe to call during drag) */
  private _render(): void {
    if (!this._valueEl) return;

    const { value, marginLow, marginHigh } = this._circaValue;
    const { min, max } = this._config;

    // Common margin calculations
    const low = marginLow ?? 0;
    const high = marginHigh ?? 0;

    // Update ARIA attributes (single source of truth)
    this._updateAriaValues();

    // Value indicator position
    if (value !== null) {
      const percent = valueToPercent(value, min, max);
      this._valueEl.style.left = `${percent}%`;
      this._valueEl.classList.remove("unset");
    } else {
      // Show thumb at center even when unset so keyboard users can focus it
      this._valueEl.style.left = "50%";
      this._valueEl.classList.add("unset");
    }

    // Render margin band
    if (value !== null && (marginLow !== null || marginHigh !== null)) {
      const lowPercent = valueToPercent(value - low, min, max);
      const highPercent = valueToPercent(value + high, min, max);
      this._marginEl.style.left = `${lowPercent}%`;
      this._marginEl.style.width = `${highPercent - lowPercent}%`;
      this._marginEl.style.display = "";
    } else {
      this._marginEl.style.display = "none";
    }

    // Update handle positions and ARIA values
    if (value !== null) {
      this._handleLow.classList.remove("unset");
      this._handleHigh.classList.remove("unset");

      const lowPercent = valueToPercent(value - low, min, max);
      this._handleLow.style.left = `${lowPercent}%`;
      this._handleLow.setAttribute("aria-valuenow", String(low));
      this._handleLow.setAttribute("aria-valuemin", "0");
      this._handleLow.setAttribute(
        "aria-valuemax",
        String(this._config.marginMax ?? value - min),
      );

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
    } else {
      this._handleLow.classList.add("unset");
      this._handleHigh.classList.add("unset");
    }

    // Toggle clear area active/inactive state
    this._clearArea.classList.toggle("inactive", value === null);

    // Update form value
    this._updateFormValue();
  }

  /** @internal Set JSON value in FormData via ElementInternals */
  private _updateFormValue(): void {
    if (!this._internals) return;

    if (this._circaValue.value !== null) {
      this._internals.setFormValue(JSON.stringify(this._circaValue));
    } else {
      this._internals.setFormValue(null);
    }

    // Required validation (checkRequired also checks config.required internally)
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

  /** @internal Fire change event (on operation complete) */
  private _emitChange(): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: this.circaValue,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** @internal Fire input event (real-time during operation) */
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
