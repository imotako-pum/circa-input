# @circa-input/web-component

[![npm](https://img.shields.io/npm/v/@circa-input/web-component)](https://www.npmjs.com/package/@circa-input/web-component)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@circa-input/web-component)](https://bundlephobia.com/package/@circa-input/web-component)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/imotako-pum/circa-input/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

**One input. One action. Value + ambiguity.** A Web Component that captures not just a number, but how fuzzy that number is — in a single gesture. Works with any framework or plain HTML.

No more wiring up two sliders, a min/max pair, or a number field plus tolerance. One `<circa-input>` tag replaces them all.

![circa-input demo](https://raw.githubusercontent.com/imotako-pum/circa-input/main/docs/assets/demo.gif)

**[Live Demo](https://imotako-pum.github.io/circa-input/)** · **[React? Use @circa-input/react](https://www.npmjs.com/package/@circa-input/react)**

## Install

```bash
npm install @circa-input/web-component
```

## Quick Start

### With a bundler

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

### Via CDN (no build tools)

```html
<script src="https://unpkg.com/@circa-input/web-component"></script>
<circa-input min="0" max="24" step="1" tick-interval="6"></circa-input>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | number | 0 | Minimum value |
| `max` | number | 100 | Maximum value |
| `value` | number | — | Center value (controlled) |
| `margin-low` | number | — | Lower margin (controlled) |
| `margin-high` | number | — | Upper margin (controlled) |
| `default-value` | number | — | Initial value (uncontrolled) |
| `default-margin-low` | number | — | Initial lower margin (uncontrolled) |
| `default-margin-high` | number | — | Initial upper margin (uncontrolled) |
| `step` | number \| `"any"` | `"any"` | Value granularity |
| `margin-max` | number | — | Max margin size |
| `asymmetric` | boolean | `false` | Independent low/high margins |
| `initial-margin` | number \| null | `null` | Margin applied on first click. Default: `(max - min) / 10`. Set to `0` to disable. |
| `name` | string | — | Form field name |
| `required` | boolean | `false` | Form validation |
| `tick-interval` | number | — | Tick mark interval |
| `no-clear` | boolean | `false` | Hide clear button |
| `disabled` | boolean | `false` | Disable interaction |

## Events

| Event | Type | When |
|-------|------|------|
| `change` | `CustomEvent<CircaValue>` | On interaction end |
| `input` | `CustomEvent<CircaValue>` | During interaction |

## CSS Customization

Style with 14 CSS Custom Properties:

```css
circa-input {
  --circa-track-height: 8px;
  --circa-track-color: #e0e0e0;
  --circa-track-radius: 4px;
  --circa-value-color: #1976d2;
  --circa-margin-color: rgba(25, 118, 210, 0.2);
  --circa-handle-size: 20px;
  --circa-handle-color: #1976d2;
  --circa-clear-color: #bbb;
  --circa-clear-hover-color: #888;
  --circa-tick-height: 6px;
  --circa-tick-width: 1px;
  --circa-tick-color: #999;
  --circa-tick-label-size: 10px;
  --circa-tick-label-color: #666;
}
```

## Form Integration

```html
<form>
  <circa-input name="delivery_time" min="9" max="21" required></circa-input>
  <button type="submit">Submit</button>
</form>
```

FormData contains the `CircaValue` as a JSON string.

## Full Documentation

See the [circa-input monorepo](https://github.com/imotako-pum/circa-input) for keyboard shortcuts, auto-margin details, and more examples.

## License

MIT
