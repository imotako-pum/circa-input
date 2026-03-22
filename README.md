# circa-input

[![npm](https://img.shields.io/npm/v/@circa-input/web-component)](https://www.npmjs.com/package/@circa-input/web-component)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@circa-input/web-component)](https://bundlephobia.com/package/@circa-input/web-component)
[![CI](https://github.com/imotako-pum/circa-input/actions/workflows/ci.yml/badge.svg)](https://github.com/imotako-pum/circa-input/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

[日本語](./README.ja.md)

**One input. One action. Value + ambiguity.** A single UI component that captures not just a number, but how fuzzy that number is.

```
Traditional:    "What time?"  →  14:00          (a precise lie)
circa-input:    "What time?"  →  14:00 ± 1h     (the honest answer)
```

> *circa* (Latin): "approximately"

**[Live Demo](https://imotako-pum.github.io/circa-input/)** · **[React Demo](https://imotako-pum.github.io/circa-input/react/)**

![circa-input demo](./docs/assets/demo.gif)

## Why

Users think in ranges — "around 2pm", "about $500", "20–30 minute commute". You could build this with two sliders, a min/max pair, or a number input plus a tolerance field. But that's multiple controls, multiple interactions, and a confusing UX.

**circa-input does it in one.** Click to set the value, drag the edges to express uncertainty. One component, one gesture, and the output is structured data (`value ± margin`) ready for matching, filtering, and optimization.

- **Delivery time** — "between 2pm and 4pm" in a single drag, not two dropdowns
- **Budget** — "$50k ± $10k" without a min field and a max field
- **Commute tolerance** — "ideally 20 min, up to 30" with asymmetric margins — no extra controls

## Features

- **Value + Ambiguity** — Capture not just "14:00" but "14:00 ± 1 hour" in a single input
- **Symmetric & Asymmetric margins** — Equal tolerance in both directions, or independent low/high margins
- **Web Component** — Works with any framework (React, Vue, Svelte, or plain HTML)
- **React adapter** — First-class React support with `<CircaInput>`
- **Form integration** — Works with native `<form>` and FormData
- **Accessible** — Full keyboard navigation and ARIA support
- **Customizable** — Style with 14 CSS Custom Properties
- **Lightweight** — Core ~1.3KB, Web Component ~6.7KB gzipped

![circa-input use cases](./docs/assets/demo-use-cases.png)

## Installation

```bash
# Web Component (works with any framework)
npm install @circa-input/web-component

# React
npm install @circa-input/react
```

## Quick Start

### Web Component

```html
<script type="module">
  import "@circa-input/web-component";
</script>

<circa-input min="0" max="100"></circa-input>

<script>
  document.querySelector("circa-input")
    .addEventListener("change", (e) => {
      console.log(e.detail);
      // { value: 42, marginLow: 5, marginHigh: 5, distribution: "normal", distributionParams: {} }
    });
</script>
```

### CDN (no build step)

```html
<script src="https://unpkg.com/@circa-input/web-component"></script>
<circa-input min="0" max="24" step="1" tick-interval="6"></circa-input>
```

### React

```tsx
import { CircaInput } from "@circa-input/react";

function App() {
  return (
    <CircaInput
      min={0}
      max={100}
      onChange={(circaValue) => console.log(circaValue)}
    />
  );
}
```

## Data Structure

circa-input outputs a `CircaValue`:

```typescript
interface CircaValue {
  value: number | null;       // Center value
  marginLow: number | null;   // Lower tolerance
  marginHigh: number | null;  // Upper tolerance
  distribution: "normal" | "uniform";
  distributionParams: DistributionParams;
}
```

**Example:** A user selects "around 14" with ±1 tolerance:

```json
{ "value": 14, "marginLow": 1, "marginHigh": 1, "distribution": "normal", "distributionParams": {} }
```

> `distribution` and `distributionParams` are reserved for future use. Currently they default to `"normal"` and `{}`.

## Packages

| Package | Description | Size (gzip) |
|---------|-------------|-------------|
| [`@circa-input/core`](./packages/core) | Framework-agnostic core logic | ~1.3KB |
| [`@circa-input/web-component`](./packages/web-component) | `<circa-input>` custom element | ~6.7KB |
| [`@circa-input/react`](./packages/react) | React adapter (`<CircaInput>`) | ~1.1KB |

<details>
<summary><strong>API Reference</strong></summary>

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | number | 0 | Minimum selectable value |
| `max` | number | 100 | Maximum selectable value |
| `value` | number | — | Center value (controlled mode) |
| `margin-low` | number | — | Lower margin (controlled mode) |
| `margin-high` | number | — | Upper margin (controlled mode) |
| `default-value` | number | — | Initial center value (uncontrolled mode) |
| `default-margin-low` | number | — | Initial lower margin (uncontrolled mode) |
| `default-margin-high` | number | — | Initial upper margin (uncontrolled mode) |
| `step` | number \| `"any"` | `"any"` | Value granularity |
| `margin-max` | number | — | Maximum margin size |
| `asymmetric` | boolean | `false` | Enable independent low/high margins |
| `initial-margin` | number \| null | `null` | Margin automatically applied on first value set (see [Auto-margin](#auto-margin)) |
| `name` | string | — | Form field name |
| `required` | boolean | `false` | Form validation |
| `disabled` | boolean | `false` | Disable the component |
| `no-clear` | boolean | `false` | Hide the clear button |
| `tick-interval` | number | — | Tick mark interval |

### Auto-margin

When a user first clicks the track, circa-input automatically applies a margin of `(max - min) / 10`. This reflects the core philosophy: human input is inherently approximate.

- **Default:** `initial-margin` is `null` → auto-calculates as `(max - min) / 10`
- **Custom:** `initial-margin="5"` → always applies a margin of 5
- **Opt out:** `initial-margin="0"` → point value, no automatic margin

```html
<!-- Default: auto-margin of (100-0)/10 = 10 -->
<circa-input min="0" max="100"></circa-input>

<!-- No auto-margin -->
<circa-input min="0" max="100" initial-margin="0"></circa-input>

<!-- Custom auto-margin of 5 -->
<circa-input min="0" max="100" initial-margin="5"></circa-input>
```

### Events

| Event | Type | When |
|-------|------|------|
| `change` | `CustomEvent<CircaValue>` | On interaction end (mouseup/touchend) |
| `input` | `CustomEvent<CircaValue>` | During interaction (mousemove/touchmove) |

### Keyboard

| Key | Action |
|-----|--------|
| `←` / `→` | Adjust value by 1 step |
| `Shift + ←` / `Shift + →` | Expand/contract margin |
| `Home` / `End` | Jump to min / max |
| `Delete` / `Backspace` | Clear value |

### CSS Customization

| Variable | Default | Description |
|---|---|---|
| `--circa-track-height` | `8px` | Track height |
| `--circa-track-color` | `#e0e0e0` | Track background color |
| `--circa-track-radius` | `4px` | Track border radius |
| `--circa-value-color` | `#1976d2` | Value indicator color |
| `--circa-margin-color` | `rgba(25,118,210,0.2)` | Margin area color |
| `--circa-handle-size` | `20px` | Handle diameter |
| `--circa-handle-color` | `#1976d2` | Handle color |
| `--circa-clear-color` | `#bbb` | Clear button color |
| `--circa-clear-hover-color` | `#888` | Clear button hover color |
| `--circa-tick-height` | `6px` | Tick line height |
| `--circa-tick-width` | `1px` | Tick line width |
| `--circa-tick-color` | `#999` | Tick line color |
| `--circa-tick-label-size` | `10px` | Tick label font size |
| `--circa-tick-label-color` | `#666` | Tick label color |

```css
circa-input {
  --circa-track-height: 8px;
  --circa-track-color: #e0e0e0;
  --circa-track-radius: 4px;
  --circa-value-color: #1976d2;
  --circa-margin-color: rgba(25, 118, 210, 0.2);
  --circa-handle-size: 20px;
  --circa-handle-color: #1976d2;
}
```

### Form Integration

```html
<form>
  <circa-input name="delivery_time" min="9" max="21"></circa-input>
  <button type="submit">Submit</button>
</form>
```

The value is submitted as a JSON string in FormData. For backends that need a plain number:

```typescript
import { toPlainValue } from "@circa-input/core";

const plain = toPlainValue(circaValue); // 14.0
```

</details>

## Browser Support

Latest 2 versions of Chrome, Firefox, Safari, and Edge.

## Development

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm dev        # Watch mode
pnpm lint       # Lint with Biome

# Run demo locally
pnpm --filter demo dev
```

## License

MIT
