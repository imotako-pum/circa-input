# circa-input

[日本語](./README.ja.md)

A UI primitive for entering a **value** and its **ambiguity** at the same time.

Traditional UIs force users to pick a single precise value — but people really mean "around 2pm" or "about $500". circa-input captures that fuzziness as structured data.

> *circa* (Latin): "approximately"

**[Live Demo](https://imotako-pum.github.io/circa-input/)** · **[React Demo](https://imotako-pum.github.io/circa-input/react/)**

## Features

- **Value + Ambiguity** — Capture not just "14:00" but "14:00 ± 1 hour" in a single input
- **Symmetric & Asymmetric margins** — Equal tolerance in both directions, or independent low/high margins
- **Web Component** — Works with any framework (React, Vue, Svelte, or plain HTML)
- **React adapter** — First-class React support with `<CircaInput>`
- **Form integration** — Works with native `<form>` and FormData
- **Accessible** — Full keyboard navigation and ARIA support
- **Customizable** — Style with CSS Custom Properties
- **Lightweight** — Core ~1.3KB gzipped, Web Component ~6.7KB gzipped

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
  distribution: "normal" | "uniform" | "skewed";
  distributionParams: Record<string, unknown>;
}
```

> **Note:** `distribution` and `distributionParams` are reserved for future use.
> In v0.1.x, they always default to `"normal"` and `{}` respectively and have no effect on behavior.

**Example:** A user selects "around 14" with ±1 tolerance:

```json
{ "value": 14, "marginLow": 1, "marginHigh": 1, "distribution": "normal", "distributionParams": {} }
```

## Attributes

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
| `name` | string | — | Form field name |
| `required` | boolean | `false` | Form validation |
| `disabled` | boolean | `false` | Disable the component |
| `no-clear` | boolean | `false` | Hide the clear button |
| `tick-interval` | number | — | Tick mark interval |

## Events

| Event | Type | When |
|-------|------|------|
| `change` | `CustomEvent<CircaValue>` | On interaction end (mouseup/touchend) |
| `input` | `CustomEvent<CircaValue>` | During interaction (mousemove/touchmove) |

## Keyboard

| Key | Action |
|-----|--------|
| `←` / `→` | Adjust value by 1 step |
| `Shift + ←` / `Shift + →` | Expand/contract margin |
| `Home` / `End` | Jump to min / max |
| `Delete` / `Backspace` | Clear value |

## CSS Customization

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

See [spec.md](./docs/spec.md) for the full list of CSS variables.

## Form Integration

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

## Packages

| Package | Description | Size (gzip) |
|---------|-------------|-------------|
| [`@circa-input/core`](./packages/core) | Framework-agnostic core logic | ~1.3KB |
| [`@circa-input/web-component`](./packages/web-component) | `<circa-input>` custom element | ~6.7KB |
| [`@circa-input/react`](./packages/react) | React adapter (`<CircaInput>`) | ~1.1KB |

## Browser Support

Latest 2 versions of Chrome, Firefox, Safari, and Edge.

## Development

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm dev        # Watch mode
pnpm lint       # Lint with Biome
```

## License

MIT
