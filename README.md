# circa-input

A UI primitive for entering a **value** and its **ambiguity** at the same time.

Traditional UIs force users to pick a single precise value — but people really mean "around 2pm" or "about $500". circa-input captures that fuzziness as structured data.

## Packages

| Package | Description |
|---------|-------------|
| [`@circa-input/core`](./packages/core) | Framework-agnostic core logic |
| [`@circa-input/web-component`](./packages/web-component) | `<circa-input>` custom element |
| [`@circa-input/react`](./packages/react) | React adapter (`<CircaInput>`) |

## Quick Start

### Web Component (any framework)

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

### React

```tsx
import { CircaInput } from "@circa-input/react";

function App() {
  return (
    <CircaInput
      min={0}
      max={100}
      onChange={(value) => console.log(value)}
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

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | number | *required* | Minimum selectable value |
| `max` | number | *required* | Maximum selectable value |
| `value` | number | null | Center value (controlled) |
| `margin-low` | number | null | Lower margin (controlled) |
| `margin-high` | number | null | Upper margin (controlled) |
| `default-value` | number | null | Initial center value (uncontrolled) |
| `default-margin-low` | number | null | Initial lower margin (uncontrolled) |
| `default-margin-high` | number | null | Initial upper margin (uncontrolled) |
| `step` | number \| "any" | "any" | Value granularity |
| `margin-max` | number | null | Maximum margin size |
| `asymmetric` | boolean | false | Enable independent low/high margins |
| `name` | string | null | Form integration field name |
| `required` | boolean | false | Form validation |
| `tick-interval` | number | null | Tick mark interval |

## Events

- **`change`** — Fires on interaction end (`CustomEvent<CircaValue>`)
- **`input`** — Fires during interaction (`CustomEvent<CircaValue>`)

## CSS Customization

Style via CSS Custom Properties:

```css
circa-input {
  --circa-track-color: #e0e0e0;
  --circa-value-color: #1976d2;
  --circa-margin-color: rgba(25, 118, 210, 0.2);
  --circa-handle-size: 20px;
}
```

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm dev    # watch mode
```

## License

MIT
