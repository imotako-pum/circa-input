# @circa-input/web-component

A Web Component (`<circa-input>`) for entering a value and its ambiguity. Works in any framework or vanilla HTML.

Part of the [circa-input](https://github.com/imotako-pum/circa-input) project.

## Install

```bash
npm install @circa-input/web-component
```

## Usage

### With a bundler

```html
<script type="module">
  import "@circa-input/web-component";
</script>

<circa-input min="0" max="100"></circa-input>
```

### Via CDN (no build tools)

```html
<script src="https://unpkg.com/@circa-input/web-component@0.1.0/dist/index.iife.js"></script>

<circa-input min="0" max="100"></circa-input>
```

```javascript
document.querySelector("circa-input")
  .addEventListener("change", (e) => {
    console.log(e.detail);
    // { value: 42, marginLow: 5, marginHigh: 5, distribution: "normal", distributionParams: {} }
  });
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | number | 0 | Minimum value |
| `max` | number | 100 | Maximum value |
| `value` | number | null | Center value (controlled) |
| `margin-low` | number | null | Lower margin (controlled) |
| `margin-high` | number | null | Upper margin (controlled) |
| `default-value` | number | null | Initial value (uncontrolled) |
| `default-margin-low` | number | null | Initial lower margin (uncontrolled) |
| `default-margin-high` | number | null | Initial upper margin (uncontrolled) |
| `step` | number \| "any" | "any" | Value granularity |
| `margin-max` | number | null | Max margin size |
| `asymmetric` | boolean | false | Independent low/high margins |
| `initial-margin` | number \| null | null | Margin applied on first value set. Default auto-calculates as `(max - min) / 10`. Set to `0` to disable. |
| `name` | string | null | Form field name |
| `required` | boolean | false | Form validation |
| `tick-interval` | number | null | Tick mark interval |
| `no-clear` | boolean | false | Hide clear button |
| `disabled` | boolean | false | Disable interaction |

## Events

- **`change`** — Fires on interaction end (`CustomEvent<CircaValue>`)
- **`input`** — Fires during interaction (`CustomEvent<CircaValue>`)

## CSS Custom Properties

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
  --circa-value-color: #1976d2;
  --circa-margin-color: rgba(25, 118, 210, 0.2);
  --circa-handle-size: 20px;
  --circa-handle-color: #1976d2;
}
```

## Form Integration

```html
<form>
  <circa-input name="delivery_time" min="9" max="21" required></circa-input>
  <button type="submit">Submit</button>
</form>
```

FormData will contain CircaValue as a JSON string.

## License

MIT
