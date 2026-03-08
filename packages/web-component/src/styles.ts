/**
 * Shadow DOM用CSSテンプレート
 *
 * CSS Custom Propertiesを使い、外部からスタイルをカスタマイズ可能にする。
 * すべてのCSS変数には --circa- プレフィックスを付ける。
 */

export const STYLES = `
:host {
  display: block;
  position: relative;
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

:host([disabled]) {
  opacity: 0.5;
  pointer-events: none;
}

[part="container"] {
  position: relative;
  padding: calc(var(--circa-handle-size, 20px) / 2) 0;
}

[part="track"] {
  position: relative;
  height: var(--circa-track-height, 8px);
  background: var(--circa-track-color, #e0e0e0);
  border-radius: var(--circa-track-radius, 4px);
  cursor: pointer;
}

[part="margin"] {
  position: absolute;
  top: 0;
  height: 100%;
  background: var(--circa-margin-color, rgba(25, 118, 210, 0.2));
  border-radius: var(--circa-track-radius, 4px);
  pointer-events: none;
}

[part="value"] {
  position: absolute;
  top: 50%;
  width: var(--circa-handle-size, 20px);
  height: var(--circa-handle-size, 20px);
  background: var(--circa-handle-color, #1976d2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  outline: none;
  z-index: 2;
}

[part="value"]:focus-visible {
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.4);
}

[part="value"]:active {
  cursor: grabbing;
}

[part="handle-low"],
[part="handle-high"] {
  position: absolute;
  top: 50%;
  width: calc(var(--circa-handle-size, 20px) * 0.7);
  height: calc(var(--circa-handle-size, 20px) * 0.7);
  background: var(--circa-handle-color, #1976d2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: ew-resize;
  outline: none;
  z-index: 1;
  display: none;
}

[part="handle-low"]:focus-visible,
[part="handle-high"]:focus-visible {
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.4);
}

:host([asymmetric]) [part="handle-low"],
:host([asymmetric]) [part="handle-high"] {
  display: block;
}
`;
