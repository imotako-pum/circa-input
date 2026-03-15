/**
 * CSS template for Shadow DOM
 *
 * Uses CSS Custom Properties to allow external style customization.
 * All CSS variables are prefixed with --circa-.
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
  display: flex;
  align-items: center;
  padding: calc(var(--circa-handle-size, 20px) / 2) 0;
}

[part="track-area"] {
  flex: 1;
  position: relative;
}

[part="track"] {
  width: 100%;
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
  background: var(--circa-value-color, var(--circa-handle-color, #1976d2));
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
  z-index: 3;
  display: none;
}

[part="handle-low"]:focus-visible,
[part="handle-high"]:focus-visible {
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.4);
}

/* Expand the handle hit area. Makes it clickable even when overlapping the value thumb at margin=0 */
[part="handle-low"]::before,
[part="handle-high"]::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--circa-handle-size, 20px) * 1.5);
  height: calc(var(--circa-handle-size, 20px) * 1.5);
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

:host([asymmetric]) [part="handle-low"],
:host([asymmetric]) [part="handle-high"] {
  display: block;
}

/* Clear area: wrapper for the slot */
[part="clear-area"] {
  margin-left: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* When no value is set (class added via JS) */
[part="clear-area"].inactive {
  opacity: 0.3;
  pointer-events: none;
}

/* Hide entire area with no-clear attribute */
:host([no-clear]) [part="clear-area"] {
  display: none;
}

/* Default close button (inside fallback slot) */
[part="clear"] {
  width: calc(var(--circa-handle-size, 20px) * 0.8);
  height: calc(var(--circa-handle-size, 20px) * 0.8);
  border: none;
  background: var(--circa-clear-color, #999);
  color: #fff;
  border-radius: 50%;
  font-size: calc(var(--circa-handle-size, 20px) * 0.5);
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

[part="clear"]:hover {
  background: var(--circa-clear-hover-color, #666);
}

[part="clear"]:focus-visible {
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.4);
  outline: none;
}

/* Custom button passed via slot */
::slotted([slot="clear"]) {
  cursor: pointer;
}

/* Tick Marks */
[part="ticks"] {
  position: relative;
  width: 100%;
  height: calc(var(--circa-tick-height, 6px) + var(--circa-tick-label-size, 10px) + 4px);
  pointer-events: none;
  overflow: visible;
}

[part="ticks"] .circa-tick {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
}

[part="ticks"] .circa-tick-line {
  width: var(--circa-tick-width, 1px);
  height: var(--circa-tick-height, 6px);
  background: var(--circa-tick-color, #999);
}

[part="ticks"] .circa-tick-label {
  font-size: var(--circa-tick-label-size, 10px);
  color: var(--circa-tick-label-color, #666);
  line-height: 1;
  margin-top: 2px;
  white-space: nowrap;
}
`;
